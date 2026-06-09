package providerrevision

import (
	"context"

	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	xpcliv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type ProviderRevisionService interface {

	// List Give all the providers installed in the cluster
	List(ctx context.Context) (*xpapiv1.ProviderRevisionList, error)

	ListByProvider(ctx context.Context, name string) ([]xpapiv1.ProviderRevision, error)

	// Get Give a provider by its name
	Get(ctx context.Context, name string) (*xpapiv1.ProviderRevision, error)
}

func NewService(
	providerClient xpcliv1.ProviderRevisionInterface,
) *ProviderRevision {
	return &ProviderRevision{
		providerRevisionClient: providerClient,
	}
}

type ProviderRevision struct {
	providerRevisionClient xpcliv1.ProviderRevisionInterface
}

// List Give all the providers installed in the cluster
func (s *ProviderRevision) List(ctx context.Context) (*xpapiv1.ProviderRevisionList, error) {

	providers, err := s.providerRevisionClient.List(ctx, metav1.ListOptions{})
	return providers, err
}

// Get Give a provider by its name
func (s *ProviderRevision) Get(ctx context.Context, name string) (*xpapiv1.ProviderRevision, error) {

	provider, err := s.providerRevisionClient.Get(ctx, name, metav1.GetOptions{})
	return provider, err
}

func (s *ProviderRevision) ListByProvider(ctx context.Context, name string) ([]xpapiv1.ProviderRevision, error) {

	revisions, err := s.providerRevisionClient.List(ctx, metav1.ListOptions{})
	res := make([]xpapiv1.ProviderRevision, 0)

	if revisions != nil {
		for _, revision := range revisions.Items {
			for _, or := range revision.GetOwnerReferences() {
				if or.Name == name {
					res = append(res, revision)
				}
			}
		}
	}

	return res, err
}
