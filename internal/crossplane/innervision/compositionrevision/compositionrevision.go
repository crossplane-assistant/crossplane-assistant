package compositionrevision

import (
	"context"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	compositionv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/apiextentions/v1"
	"github.com/rs/zerolog/log"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func NewService(
	compositionRevisionClient compositionv1.CompositionRevisionInterface,
) *Service {

	return &Service{
		compositionRevisionClient: compositionRevisionClient,
	}
}

type Service struct {
	compositionRevisionClient compositionv1.CompositionRevisionInterface
}

func (s *Service) Get(ctx context.Context, name string) (*v1.CompositionRevision, error) {

	compositionRevision, err := s.compositionRevisionClient.Get(ctx, name, metav1.GetOptions{})

	if err != nil {
		log.Err(err).Msg("Error while getting CompositionRevision")
	}
	return compositionRevision, err

}

func (s *Service) List(ctx context.Context) (*v1.CompositionRevisionList, error) {

	compositionRevisionList, err := s.compositionRevisionClient.List(ctx, metav1.ListOptions{})
	return compositionRevisionList, err

}
