package schema

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	"k8s.io/client-go/discovery"
	"sigs.k8s.io/yaml"
)

type Service struct {
	crdRegistry      *resource.CRDRegistry
	discoveryClient  discovery.DiscoveryInterface
	cacheDir         string
	mu               sync.RWMutex
	k8sSchemaBaseURL string
	crdsDevBaseURL   string
}

func NewService(crdRegistry *resource.CRDRegistry, discoveryClient discovery.DiscoveryInterface) *Service {
	homeDir, err := os.UserHomeDir()
	var cacheDir string
	if err != nil {
		cacheDir = filepath.Join(".", ".cache", "schemas")
	} else {
		cacheDir = filepath.Join(homeDir, ".crossplane-assistant", "schemas")
	}
	_ = os.MkdirAll(cacheDir, 0755)

	return &Service{
		crdRegistry:      crdRegistry,
		discoveryClient:  discoveryClient,
		cacheDir:         cacheDir,
		k8sSchemaBaseURL: "https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.31.0",
		crdsDevBaseURL:   "https://doc.crds.dev/raw",
	}
}

// GetSchema returns the OpenAPI v3 schema for the given GVK
func (s *Service) GetSchema(ctx context.Context, group, version, kind string) (*v1.JSONSchemaProps, error) {
	// 1. Check native Kubernetes API fallback
	if s.isNativeGroup(group) {
		return s.resolveNativeSchema(ctx, group, version, kind)
	}

	// 2. Check local CRD Registry (Option A)
	schema, err := s.resolveLocalCRDSchema(group, version, kind)
	if err == nil && schema != nil {
		return schema, nil
	}

	// 3. Fallback to external registry with cache (Option C)
	return s.resolveExternalSchema(ctx, group, version, kind)
}

func (s *Service) isNativeGroup(group string) bool {
	if group == "" || group == "core" {
		return true
	}
	nativeSuffixes := []string{
		"apps", "batch", "autoscaling", "networking.k8s.io", "policy",
		"rbac.authorization.k8s.io", "admissionregistration.k8s.io", "storage.k8s.io",
	}
	for _, suffix := range nativeSuffixes {
		if strings.HasSuffix(group, suffix) || group == suffix {
			return true
		}
	}
	return false
}

// resolveLocalCRDSchema looks up the CRD schema from the in-cluster CRD registry
func (s *Service) resolveLocalCRDSchema(group, version, kind string) (*v1.JSONSchemaProps, error) {
	crdList := s.crdRegistry.List()
	for _, crd := range crdList {
		if crd.Spec.Group == group && crd.Spec.Names.Kind == kind {
			for _, v := range crd.Spec.Versions {
				if v.Name == version {
					if v.Schema != nil && v.Schema.OpenAPIV3Schema != nil {
						return v.Schema.OpenAPIV3Schema, nil
					}
				}
			}
		}
	}
	return nil, fmt.Errorf("schema not found in local CRD registry for %s/%s, Kind=%s", group, version, kind)
}

// resolveNativeSchema fetches the core Kubernetes resource schemas (Option B)
func (s *Service) resolveNativeSchema(ctx context.Context, group, version, kind string) (*v1.JSONSchemaProps, error) {
	// Check disk cache first to avoid unnecessary K8s API server pressure
	cachedSchema, err := s.readFromCache(group, version, kind)
	if err == nil && cachedSchema != nil {
		return cachedSchema, nil
	}

	// Fetch native schemas from a stable public JSON schema registry (yannh/kubernetes-json-schema)
	// Example URL: https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.31.0/secret-v1.json
	// Since standard K8s resources are extremely stable, we target v1.31.0 as a stable modern base.
	resourceName := strings.ToLower(kind)
	url := fmt.Sprintf("%s/%s-%s.json", s.k8sSchemaBaseURL, resourceName, version)
	
	log.Info().Msgf("Fetching native Kubernetes schema from external fallback: %s", url)
	resp, err := http.Get(url)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		return nil, fmt.Errorf("unable to fetch native schema from fallback URL: %s", url)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var schemaProps v1.JSONSchemaProps
	if err := json.Unmarshal(body, &schemaProps); err != nil {
		return nil, errors.Wrap(err, "fail to parse native JSON schema")
	}

	// Cache it
	_ = s.writeToCache(group, version, kind, &schemaProps)
	return &schemaProps, nil
}

// resolveExternalSchema resolves schemas for uninstalled provider resources from doc.crds.dev (Option C)
func (s *Service) resolveExternalSchema(ctx context.Context, group, version, kind string) (*v1.JSONSchemaProps, error) {
	// Check disk cache first
	cachedSchema, err := s.readFromCache(group, version, kind)
	if err == nil && cachedSchema != nil {
		return cachedSchema, nil
	}

	// Find the matching Provider repo based on the API group
	providerRepo := s.getProviderRepoForGroup(group)
	if providerRepo == "" {
		return nil, fmt.Errorf("no known provider mapping for API group %s", group)
	}

	// We default to @main or a stable release tag. doc.crds.dev handles main branch aggregation
	url := fmt.Sprintf("%s/%s@main", s.crdsDevBaseURL, providerRepo)
	log.Info().Msgf("Fetching uninstalled provider CRDs from external registry: %s", url)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("external registry returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Split aggregated YAML documents and extract our CRD
	documents := strings.Split(string(body), "\n---\n")
	for _, doc := range documents {
		if !strings.Contains(doc, "kind: CustomResourceDefinition") {
			continue
		}

		var crd v1.CustomResourceDefinition
		if err := yaml.Unmarshal([]byte(doc), &crd); err != nil {
			continue
		}

		if crd.Spec.Group == group && crd.Spec.Names.Kind == kind {
			for _, v := range crd.Spec.Versions {
				if v.Name == version {
					if v.Schema != nil && v.Schema.OpenAPIV3Schema != nil {
						// Write the resolved schema of interest to our cache
						_ = s.writeToCache(group, version, kind, v.Schema.OpenAPIV3Schema)
						return v.Schema.OpenAPIV3Schema, nil
					}
				}
			}
		}
	}

	return nil, fmt.Errorf("schema not found in external provider registry for %s/%s, Kind=%s", group, version, kind)
}

func (s *Service) getProviderRepoForGroup(group string) string {
	if strings.Contains(group, "aws.upbound.io") {
		return "github.com/upbound/provider-aws"
	}
	if strings.Contains(group, "gcp.upbound.io") {
		return "github.com/upbound/provider-gcp"
	}
	if strings.Contains(group, "azure.upbound.io") {
		return "github.com/upbound/provider-azure"
	}
	if strings.Contains(group, "kubernetes.crossplane.io") {
		return "github.com/crossplane-contrib/provider-kubernetes"
	}
	if strings.Contains(group, "helm.crossplane.io") {
		return "github.com/crossplane-contrib/provider-helm"
	}
	if strings.Contains(group, "aws.infra.pe") {
		return "github.com/crossplane-contrib/provider-aws"
	}
	return ""
}

// readFromCache attempts to read a cached schema file from disk
func (s *Service) readFromCache(group, version, kind string) (*v1.JSONSchemaProps, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	safeGroup := strings.ReplaceAll(group, "/", "_")
	filename := fmt.Sprintf("%s-%s-%s.json", safeGroup, version, kind)
	filepath := filepath.Join(s.cacheDir, filename)

	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		return nil, err
	}

	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, err
	}

	var schemaProps v1.JSONSchemaProps
	if err := json.Unmarshal(data, &schemaProps); err != nil {
		return nil, err
	}

	return &schemaProps, nil
}

// writeToCache writes a resolved schema JSON to disk
func (s *Service) writeToCache(group, version, kind string, schema *v1.JSONSchemaProps) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	safeGroup := strings.ReplaceAll(group, "/", "_")
	filename := fmt.Sprintf("%s-%s-%s.json", safeGroup, version, kind)
	filepath := filepath.Join(s.cacheDir, filename)

	data, err := json.Marshal(schema)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath, data, 0644)
}
