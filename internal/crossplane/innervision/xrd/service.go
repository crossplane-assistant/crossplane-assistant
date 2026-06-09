package xrd

import (
	"context"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	compositionv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/apiextentions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type XRDService interface {
	List(ctx context.Context) (*v1.CompositeResourceDefinitionList, error)

	Get(ctx context.Context, id string) (*v1.CompositeResourceDefinition, error)

	Create(ctx context.Context, xrd *v1.CompositeResourceDefinition) (*v1.CompositeResourceDefinition, error)

	Update(ctx context.Context, xrd *v1.CompositeResourceDefinition) (*v1.CompositeResourceDefinition, error)
}

func NewService(
	xrdClient compositionv1.CompositeResourceDefinitionsInterface,
) *Service {

	return &Service{
		xrdClient: xrdClient,
	}
}

type Service struct {
	xrdClient compositionv1.CompositeResourceDefinitionsInterface
}

// List returns all the CompositeResourceDefinitions installed in the cluster
func (s *Service) List(ctx context.Context) (*v1.CompositeResourceDefinitionList, error) {

	xrds, err := s.xrdClient.List(ctx, metav1.ListOptions{})
	return xrds, err
}

func (s *Service) Get(ctx context.Context, id string) (*v1.CompositeResourceDefinition, error) {

	xrd, err := s.xrdClient.Get(ctx, id, metav1.GetOptions{})
	return xrd, err
}

func (s *Service) Create(ctx context.Context, xrd *v1.CompositeResourceDefinition) (*v1.CompositeResourceDefinition, error) {

	xrd, err := s.xrdClient.Create(ctx, xrd, metav1.CreateOptions{})
	return xrd, err
}

func (s *Service) Update(ctx context.Context, xrd *v1.CompositeResourceDefinition) (*v1.CompositeResourceDefinition, error) {

	xrd, err := s.xrdClient.Update(ctx, xrd, metav1.UpdateOptions{})
	return xrd, err
}

func (s *Service) Delete(ctx context.Context, name string) error {

	err := s.xrdClient.Delete(ctx, name, metav1.DeleteOptions{})
	return err
}
