package managedresource

import (
	"context"
	"sync"
	"time"

	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"github.com/rs/zerolog/log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type MRCount struct {
	Total int
	Ready int
}

type ManagedResourceService interface {

	// List Give all the functions installed in the cluster
	List(ctx context.Context, gvk schema.GroupVersionKind) (*unstructured.UnstructuredList, error)

	// Get Give a function by its name
	Get(ctx context.Context, gvk schema.GroupVersionKind, name string) (*unstructured.Unstructured, error)

	ListKind(ctx context.Context) ([]MRKind, error)

	Create(ctx context.Context, mr *unstructured.Unstructured) (*unstructured.Unstructured, error)

	Delete(ctx context.Context, gvk schema.GroupVersionKind, name string) error

	Update(ctx context.Context, mr *unstructured.Unstructured) (*unstructured.Unstructured, error)
}

var _ ManagedResourceService = &Service{}

func NewService(
	resourceResolver *unstruct.ResourceResolver,
	prRegistry *providerrevision.Registry,
	crdRegistry *resource.CRDRegistry,
) *Service {
	s := &Service{
		resourceResolver: resourceResolver,
		prRegistry:       prRegistry,
		crdRegistry:      crdRegistry,
		cacheCounts:      make(map[schema.GroupVersionKind]MRCount),
	}
	s.listFunc = s.List

	if resourceResolver != nil {
		go func() {
			// Proactive delay on startup to allow local CRD registries and ProviderRevisions to synchronize
			time.Sleep(2 * time.Second)
			s.refreshCache(context.Background())
		}()
	}

	return s
}

func (s *Service) refreshCache(ctx context.Context) {
	s.cacheMu.Lock()
	if s.isUpdating {
		s.cacheMu.Unlock()
		return
	}
	s.isUpdating = true
	s.cacheMu.Unlock()

	defer func() {
		s.cacheMu.Lock()
		s.isUpdating = false
		s.cacheMu.Unlock()
	}()

	refreshCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	var initialKinds []MRKind
	revisions := s.prRegistry.ListActive()
	for _, revision := range revisions {
		for _, obj := range revision.GetObjects() {
			if obj.Kind == "CustomResourceDefinition" || obj.Kind == "ManagedResourceDefinition" {
				crd, err := s.crdRegistry.Get(obj.Name)
				if err != nil || crd == nil {
					continue
				}

				if crd.Spec.Names.Kind == "ProviderConfig" ||
					crd.Spec.Names.Kind == "ProviderRevision" ||
					crd.Spec.Names.Kind == "ProviderConfigUsage" ||
					crd.Spec.Names.Kind == "ProviderConfigRevision" ||
					crd.Spec.Names.Kind == "ClusterProviderConfig" {
					continue
				}

				mrk := MRKind{
					Group:    crd.Spec.Group,
					Version:  crd.Spec.Versions[len(crd.Spec.Versions)-1].Name,
					Kind:     crd.Spec.Names.Kind,
					Provider: revision.Labels["pkg.crossplane.io/package"],
					Resource: crd.Spec.Names.Plural + "." + crd.Spec.Group,
				}
				initialKinds = append(initialKinds, mrk)
			}
		}
	}

	var wg sync.WaitGroup
	sem := make(chan struct{}, 10)
	tempCounts := make(map[schema.GroupVersionKind]MRCount)
	var mu sync.Mutex

	for _, k := range initialKinds {
		wg.Add(1)
		go func(kindObj MRKind) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			gvk := schema.GroupVersionKind{
				Group:   kindObj.Group,
				Version: kindObj.Version,
				Kind:    kindObj.Kind,
			}

			instances, err := s.listFunc(refreshCtx, gvk)
			if err != nil {
				log.Debug().Err(err).Msgf("Failed to list instances for kind %s", kindObj.Kind)
				return
			}

			total := len(instances.Items)
			ready := 0
			for _, item := range instances.Items {
				if isResourceReady(&item) {
					ready++
				}
			}

			mu.Lock()
			tempCounts[gvk] = MRCount{Total: total, Ready: ready}
			mu.Unlock()
		}(k)
	}

	wg.Wait()

	s.cacheMu.Lock()
	s.cacheCounts = tempCounts
	// Only mark the cache as successfully updated if we found and processed at least one kind.
	// If the registries are not synchronized yet, leaving lastUpdated untouched ensures
	// that subsequent queries will continue to trigger non-blocking retries.
	if len(initialKinds) > 0 {
		s.lastUpdated = time.Now()
	}
	s.cacheMu.Unlock()
}

type Service struct {
	resourceResolver *unstruct.ResourceResolver
	prRegistry       *providerrevision.Registry
	crdRegistry      *resource.CRDRegistry
	listFunc         func(ctx context.Context, gvk schema.GroupVersionKind) (*unstructured.UnstructuredList, error)

	// Cache fields
	cacheMu     sync.RWMutex
	cacheCounts map[schema.GroupVersionKind]MRCount
	lastUpdated time.Time
	isUpdating  bool
}

type MRKind struct {
	Provider   string `json:"provider"`
	Group      string `json:"group"`
	Version    string `json:"version"`
	Kind       string `json:"kind"`
	Resource   string `json:"resource"`
	TotalItems int    `json:"totalItems"`
	ReadyItems int    `json:"readyItems"`
}

func (s *Service) ListKind(ctx context.Context) ([]MRKind, error) {
	s.cacheMu.RLock()
	isCacheEmpty := s.lastUpdated.IsZero()
	needsRefresh := (time.Since(s.lastUpdated) > 30*time.Second || isCacheEmpty) && !s.isUpdating
	s.cacheMu.RUnlock()

	if needsRefresh {
		if isCacheEmpty {
			// If cache has never been loaded, block and run synchronously
			// so we don't serve "0" counts to the user on first page load.
			s.refreshCache(ctx)
		} else {
			// Otherwise, run asynchronously in the background
			go s.refreshCache(ctx)
		}
	}

	var initialKinds = make([]MRKind, 0)

	revisions := s.prRegistry.ListActive()
	for _, revision := range revisions {

		for _, obj := range revision.GetObjects() {
			if obj.Kind == "CustomResourceDefinition" || obj.Kind == "ManagedResourceDefinition" {
				// Get the CRD
				crd, err := s.crdRegistry.Get(obj.Name)
				if err != nil {
					log.Err(err).Msg("Error while getting CRD")
					continue
				}
				if crd == nil {
					continue
				}

				if crd.Spec.Names.Kind == "ProviderConfig" ||
					crd.Spec.Names.Kind == "ProviderRevision" ||
					crd.Spec.Names.Kind == "ProviderConfigUsage" ||
					crd.Spec.Names.Kind == "ProviderConfigRevision" ||
					crd.Spec.Names.Kind == "ClusterProviderConfig" {
					continue
				}

				mrk := MRKind{
					Group:    crd.Spec.Group,
					Version:  crd.Spec.Versions[len(crd.Spec.Versions)-1].Name,
					Kind:     crd.Spec.Names.Kind,
					Provider: revision.Labels["pkg.crossplane.io/package"],
					Resource: crd.Spec.Names.Plural + "." + crd.Spec.Group,
				}
				initialKinds = append(initialKinds, mrk)

			}
		}
	}

	s.cacheMu.RLock()
	defer s.cacheMu.RUnlock()

	for i := range initialKinds {
		gvk := schema.GroupVersionKind{
			Group:   initialKinds[i].Group,
			Version: initialKinds[i].Version,
			Kind:    initialKinds[i].Kind,
		}
		if counts, exists := s.cacheCounts[gvk]; exists {
			initialKinds[i].TotalItems = counts.Total
			initialKinds[i].ReadyItems = counts.Ready
		}
	}

	return initialKinds, nil
}

func isResourceReady(obj *unstructured.Unstructured) bool {
	conditions, found, _ := unstructured.NestedSlice(obj.Object, "status", "conditions")
	if !found {
		return false
	}
	for _, rawCond := range conditions {
		cond, ok := rawCond.(map[string]interface{})
		if !ok {
			continue
		}
		cType, _ := cond["type"].(string)
		cStatus, _ := cond["status"].(string)
		if cType == "Ready" && cStatus == "True" {
			return true
		}
	}
	return false
}

// List Give all the functions installed in the cluster
func (s *Service) List(ctx context.Context, gvk schema.GroupVersionKind) (*unstructured.UnstructuredList, error) {

	client, err := s.resourceResolver.GetClientByGVK(gvk)
	if err != nil {
		log.Err(err).Msg("Error while getting managed resource client")
		return nil, err
	}

	resources, err := client.List(ctx, metav1.ListOptions{})
	if err != nil {
		log.Err(err).Msg("Error while list managedResource")
		return nil, err
	}
	return resources, err
}

// Get Give a managed resource by its name
func (s *Service) Get(ctx context.Context, gvk schema.GroupVersionKind, name string) (*unstructured.Unstructured, error) {

	client, err := s.resourceResolver.GetClientByGVK(gvk)
	if err != nil {
		log.Err(err).Msg("Error while getting managed resource client")
		return nil, err
	}

	mr, err := client.Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		log.Err(err).Msg("Error while getting managedResource")
		return nil, err
	}
	return mr, err
}

// Delete a managed resource by its name
func (s *Service) Delete(ctx context.Context, gvk schema.GroupVersionKind, name string) error {

	client, err := s.resourceResolver.GetClientByGVK(gvk)
	if err != nil {
		log.Err(err).Msg("Error while getting managed resource client")
		return err
	}

	err = client.Delete(ctx, name, metav1.DeleteOptions{})
	if err != nil {
		log.Err(err).Msg("Error while getting managedResource")
		return err
	}
	return err
}

// Create a managed resource.
func (s *Service) Create(ctx context.Context, mr *unstructured.Unstructured) (*unstructured.Unstructured, error) {

	client, err := s.resourceResolver.GetClientByGVK(mr.GroupVersionKind())
	if err != nil {
		log.Err(err).Msg("Error while getting managed resource client")
		return nil, err
	}

	mrCreated, err := client.Create(ctx, mr, metav1.CreateOptions{})
	if err != nil {
		log.Err(err).Msg("Error while creating managedResource")
		return nil, err
	}
	return mrCreated, err
}

func (s *Service) Update(ctx context.Context, mr *unstructured.Unstructured) (*unstructured.Unstructured, error) {

	client, err := s.resourceResolver.GetClientByGVK(mr.GroupVersionKind())
	if err != nil {
		log.Err(err).Msg("Error while getting managed resource client")
		return nil, err
	}

	mrCreated, err := client.Update(ctx, mr, metav1.UpdateOptions{})
	if err != nil {
		log.Err(err).Msg("Error while creating managedResource")
		return nil, err
	}
	return mrCreated, err
}
