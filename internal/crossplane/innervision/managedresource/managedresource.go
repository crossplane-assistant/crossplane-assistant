package managedresource

import (
	"context"
	"sync"

	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"github.com/rs/zerolog/log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

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
	}
	s.listFunc = s.List
	return s
}

type Service struct {
	resourceResolver *unstruct.ResourceResolver
	prRegistry       *providerrevision.Registry
	crdRegistry      *resource.CRDRegistry
	listFunc         func(ctx context.Context, gvk schema.GroupVersionKind) (*unstructured.UnstructuredList, error)
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

	var wg sync.WaitGroup
	sem := make(chan struct{}, 10)

	kinds := make([]MRKind, len(initialKinds))
	copy(kinds, initialKinds)

	for i := range kinds {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			kindObj := kinds[idx]
			gvk := schema.GroupVersionKind{
				Group:   kindObj.Group,
				Version: kindObj.Version,
				Kind:    kindObj.Kind,
			}

			instances, err := s.listFunc(ctx, gvk)
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

			kinds[idx].TotalItems = total
			kinds[idx].ReadyItems = ready
		}(i)
	}

	wg.Wait()
	return kinds, nil
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
