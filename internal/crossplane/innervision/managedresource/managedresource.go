package managedresource

import (
	"context"
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
	return &Service{
		resourceResolver: resourceResolver,
		prRegistry:       prRegistry,
		crdRegistry:      crdRegistry,
	}
}

type Service struct {
	resourceResolver *unstruct.ResourceResolver
	prRegistry       *providerrevision.Registry
	crdRegistry      *resource.CRDRegistry
}

type MRKind struct {
	Provider string `json:"provider"`
	Group    string `json:"group"`
	Version  string `json:"version"`
	Kind     string `json:"kind"`
	Resource string `json:"resource"`
}

func (s *Service) ListKind(ctx context.Context) ([]MRKind, error) {

	var res = make([]MRKind, 0)

	revisions := s.prRegistry.ListActive()
	for _, revision := range revisions {

		for _, obj := range revision.GetObjects() {
			if obj.Kind == "CustomResourceDefinition" {
				// Get the CRD
				crd, err := s.crdRegistry.Get(obj.Name)
				if err != nil {
					log.Err(err).Msg("Error while getting CRD")
					continue
				}

				if crd.Spec.Names.Kind == "ProviderConfig" ||
					crd.Spec.Names.Kind == "ProviderRevision" ||
					crd.Spec.Names.Kind == "ProviderConfigUsage" ||
					crd.Spec.Names.Kind == "ProviderConfigRevision" {
					continue
				}
				/*
					for _, version := range crd.Spec.Versions {

						mrk := MRKind{
							Group:    crd.Spec.Group,
							Version:  version.Name,
							Kind:     crd.Spec.Names.Kind,
							Provider: revision.Labels["pkg.crossplane.io/package"],
							Resource: crd.Spec.Names.Plural + "." + crd.Spec.Group,
						}
						res = append(res, mrk)
					}
				*/

				mrk := MRKind{
					Group:    crd.Spec.Group,
					Version:  crd.Spec.Versions[len(crd.Spec.Versions)-1].Name,
					Kind:     crd.Spec.Names.Kind,
					Provider: revision.Labels["pkg.crossplane.io/package"],
					Resource: crd.Spec.Names.Plural + "." + crd.Spec.Group,
				}
				res = append(res, mrk)

			}
		}
	}
	return res, nil
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
