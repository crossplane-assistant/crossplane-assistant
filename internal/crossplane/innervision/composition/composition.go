package composition

import (
	"context"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	compositionv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/apiextentions/v1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition/dependency"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// NewService Create a new composition service
// param compositionClient: the client to interact with the composition API
func NewService(
	compositionClient compositionv1.CompositionInterface,
) *Service {

	return &Service{
		compositionClient: compositionClient,
	}
}

type Service struct {
	compositionClient compositionv1.CompositionInterface
}

// List returns all the compositions installed in the cluster
func (s *Service) List(ctx context.Context) (*v1.CompositionList, error) {
	compositions, err := s.compositionClient.List(ctx, metav1.ListOptions{})
	return compositions, err
}

// Get returns a composition by its name
// param name: the name of the composition
func (s *Service) Get(ctx context.Context, name string) (*v1.Composition, error) {

	composition, err := s.compositionClient.Get(ctx, name, metav1.GetOptions{})
	return composition, err
}

// GetDependencies returns the dependencies of a composition.
// dependencies are computed by analysing the composition patch resources
// param name: the name of the composition
func (s *Service) GetDependencies(ctx context.Context, name string) (*dependency.ResourceGraph, error) {

	composition, err := s.compositionClient.Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	analyser := dependency.NewAnalyser()
	err = analyser.Load(composition)
	if err != nil {
		return nil, err
	}

	graph, err := analyser.GetResourceGraph()
	if err != nil {
		return nil, err
	}

	return graph, err
}

func (s *Service) Create(ctx context.Context, composition *v1.Composition) (*v1.Composition, error) {

	composition, err := s.compositionClient.Create(ctx, composition, metav1.CreateOptions{})
	return composition, err
}

func (s *Service) Update(ctx context.Context, composition *v1.Composition) (*v1.Composition, error) {

	composition, err := s.compositionClient.Update(ctx, composition, metav1.UpdateOptions{})
	return composition, err
}

func (s *Service) Delete(ctx context.Context, name string) error {

	err := s.compositionClient.Delete(ctx, name, metav1.DeleteOptions{})
	return err
}
