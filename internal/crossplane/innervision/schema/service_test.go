package schema

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/stretchr/testify/assert"
	apiextensionsfake "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	"k8s.io/client-go/discovery/fake"
)

func TestGetSchema_NativeFallback(t *testing.T) {
	// Create a temporary cache directory for the test
	tmpCacheDir, err := os.MkdirTemp("", "schema-test-cache")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpCacheDir)

	// Mock HTTP server for yannh/kubernetes-json-schema
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/secret-v1.json", r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{
			"type": "object",
			"description": "A Secret is an object containing sensitive data...",
			"properties": {
				"apiVersion": { "type": "string" },
				"kind": { "type": "string" },
				"data": { "type": "object" }
			}
		}`))
	}))
	defer server.Close()

	// Instantiate fake k8s client-go clients
	fakeExtensions := apiextensionsfake.NewSimpleClientset()
	fakeDiscovery := &fake.FakeDiscovery{Fake: &fakeExtensions.Fake}
	crdClient := fakeExtensions.ApiextensionsV1().CustomResourceDefinitions()
	crdRegistry := resource.NewCRDRegistry(crdClient)

	// Create service
	svc := NewService(crdRegistry, fakeDiscovery)
	svc.cacheDir = tmpCacheDir
	svc.k8sSchemaBaseURL = server.URL // override to mock server

	ctx := context.Background()
	schemaProps, err := svc.GetSchema(ctx, "", "v1", "Secret")
	assert.NoError(t, err)
	assert.NotNil(t, schemaProps)
	assert.Equal(t, "object", schemaProps.Type)
	assert.Contains(t, schemaProps.Description, "A Secret is an object")
	assert.Contains(t, schemaProps.Properties, "data")

	// Verify that the schema is cached
	cachedFile := filepath.Join(tmpCacheDir, "-v1-Secret.json")
	assert.FileExists(t, cachedFile)
}

func TestGetSchema_ExternalFallback(t *testing.T) {
	// Create a temporary cache directory
	tmpCacheDir, err := os.MkdirTemp("", "schema-test-cache-ext")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpCacheDir)

	// Mock HTTP server for doc.crds.dev raw aggregated YAML
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/github.com/upbound/provider-aws@main", r.URL.Path)
		w.Header().Set("Content-Type", "text/yaml")
		w.WriteHeader(http.StatusOK)
		crdYaml := `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: rdsinstances.database.aws.upbound.io
spec:
  group: database.aws.upbound.io
  names:
    kind: RDSInstance
    plural: rdsinstances
  versions:
  - name: v1beta1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        description: "RDSInstance is the Schema for the RDSInstances API"
        properties:
          spec:
            type: object
            properties:
              forProvider:
                type: object
                required:
                - region
                properties:
                  region:
                    type: string
                    description: "The AWS region"
`
		_, _ = w.Write([]byte(crdYaml))
	}))
	defer server.Close()

	fakeExtensions := apiextensionsfake.NewSimpleClientset()
	fakeDiscovery := &fake.FakeDiscovery{Fake: &fakeExtensions.Fake}
	crdClient := fakeExtensions.ApiextensionsV1().CustomResourceDefinitions()
	crdRegistry := resource.NewCRDRegistry(crdClient)

	svc := NewService(crdRegistry, fakeDiscovery)
	svc.cacheDir = tmpCacheDir
	svc.crdsDevBaseURL = server.URL // override to mock server

	ctx := context.Background()
	schemaProps, err := svc.GetSchema(ctx, "database.aws.upbound.io", "v1beta1", "RDSInstance")
	assert.NoError(t, err)
	assert.NotNil(t, schemaProps)
	assert.Equal(t, "object", schemaProps.Type)
	assert.Contains(t, schemaProps.Description, "RDSInstance is the Schema")

	specProps, ok := schemaProps.Properties["spec"]
	assert.True(t, ok)
	assert.Equal(t, "object", specProps.Type)

	// Verify that the schema is cached
	cachedFile := filepath.Join(tmpCacheDir, "database.aws.upbound.io-v1beta1-RDSInstance.json")
	assert.FileExists(t, cachedFile)
}

func TestGenerateDummyClaim(t *testing.T) {
	tmpCacheDir, err := os.MkdirTemp("", "schema-test-cache-dummy")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpCacheDir)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/yaml")
		w.WriteHeader(http.StatusOK)
		crdYaml := `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: compositethings.database.aws.upbound.io
spec:
  group: database.aws.upbound.io
  names:
    kind: CompositeThing
    plural: compositethings
  versions:
  - name: v1alpha1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            required:
            - requiredField
            properties:
              requiredField:
                type: string
              optionalField:
                type: integer
                description: "An optional integer field"
`
		_, _ = w.Write([]byte(crdYaml))
	}))
	defer server.Close()

	fakeExtensions := apiextensionsfake.NewSimpleClientset()
	fakeDiscovery := &fake.FakeDiscovery{Fake: &fakeExtensions.Fake}
	crdClient := fakeExtensions.ApiextensionsV1().CustomResourceDefinitions()
	crdRegistry := resource.NewCRDRegistry(crdClient)

	svc := NewService(crdRegistry, fakeDiscovery)
	svc.cacheDir = tmpCacheDir
	svc.crdsDevBaseURL = server.URL

	ctx := context.Background()
	dummyClaim, err := svc.GenerateDummyClaim(ctx, "database.aws.upbound.io", "v1alpha1", "CompositeThing")
	assert.NoError(t, err)
	assert.Contains(t, dummyClaim, "apiVersion: database.aws.upbound.io/v1alpha1")
	assert.Contains(t, dummyClaim, "kind: CompositeThing")
	assert.Contains(t, dummyClaim, "requiredField: \"string\"")
	assert.Contains(t, dummyClaim, "# optionalField: 0")
	assert.Contains(t, dummyClaim, "# An optional integer field")
}

