package provider

import (
	"context"

	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	xpcliv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type ProviderService interface {

	// List Give all the providers installed in the cluster
	List(ctx context.Context) (*xpapiv1.ProviderList, error)

	// Get Give a provider by its name
	Get(ctx context.Context, name string) (*xpapiv1.Provider, error)

	Create(ctx context.Context, fnc *xpapiv1.Provider) (*xpapiv1.Provider, error)

	Update(ctx context.Context, fnc *xpapiv1.Provider) (*xpapiv1.Provider, error)

	Delete(ctx context.Context, name string) error
}

func NewService(
	providerClient xpcliv1.ProviderInterface,
) *Service {
	return &Service{
		providerClient: providerClient,
	}
}

type Service struct {
	providerClient xpcliv1.ProviderInterface
}

// List Give all the providers installed in the cluster
func (s *Service) List(ctx context.Context) (*xpapiv1.ProviderList, error) {

	providers, err := s.providerClient.List(ctx, metav1.ListOptions{})
	return providers, err
}

// Get Give a provider by its name
func (s *Service) Get(ctx context.Context, name string) (*xpapiv1.Provider, error) {

	provider, err := s.providerClient.Get(ctx, name, metav1.GetOptions{})
	return provider, err
}

func (s *Service) Create(ctx context.Context, p *xpapiv1.Provider) (*xpapiv1.Provider, error) {

	provider, err := s.providerClient.Create(ctx, p, metav1.CreateOptions{})
	return provider, err
}

// Update a provider
func (s *Service) Update(ctx context.Context, p *xpapiv1.Provider) (*xpapiv1.Provider, error) {

	provider, err := s.providerClient.Update(ctx, p, metav1.UpdateOptions{})
	return provider, err
}

// Delete a provider by its name
func (s *Service) Delete(ctx context.Context, name string) error {

	err := s.providerClient.Delete(ctx, name, metav1.DeleteOptions{})
	return err
}
