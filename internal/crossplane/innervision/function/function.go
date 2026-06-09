package function

import (
	"context"

	"github.com/rs/zerolog/log"

	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	xpcliv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type FunctionsService interface {

	// List Give all the functions installed in the cluster
	List(ctx context.Context) (*xpapiv1.FunctionList, error)

	// Get Give a function by its name
	Get(ctx context.Context, name string) (*xpapiv1.Function, error)

	Create(ctx context.Context, fnc *xpapiv1.Function) (*xpapiv1.Function, error)

	Update(ctx context.Context, fnc *xpapiv1.Function) (*xpapiv1.Function, error)

	Delete(ctx context.Context, name string) error
}

func NewService(
	functionClient xpcliv1.FunctionInterface,
) *Service {
	return &Service{
		functionClient: functionClient,
	}
}

type Service struct {
	functionClient xpcliv1.FunctionInterface
}

// List Give all the functions installed in the cluster
func (s *Service) List(ctx context.Context) (*xpapiv1.FunctionList, error) {

	functions, err := s.functionClient.List(ctx, metav1.ListOptions{})
	if err != nil {
		log.Err(err).Msg("Error while list  functions")
		return nil, err
	}
	return functions, err
}

// Get Give a function by its name
func (s *Service) Get(ctx context.Context, name string) (*xpapiv1.Function, error) {

	function, err := s.functionClient.Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		log.Err(err).Msg("Error while getting the function")
		return nil, err
	}
	return function, err
}

func (s *Service) Create(ctx context.Context, fnc *xpapiv1.Function) (*xpapiv1.Function, error) {

	res, err := s.functionClient.Create(ctx, fnc, metav1.CreateOptions{})
	return res, err
}

func (s *Service) Update(ctx context.Context, fnc *xpapiv1.Function) (*xpapiv1.Function, error) {

	res, err := s.functionClient.Update(ctx, fnc, metav1.UpdateOptions{})
	return res, err
}

func (s *Service) Delete(ctx context.Context, name string) error {

	err := s.functionClient.Delete(ctx, name, metav1.DeleteOptions{})
	return err
}
