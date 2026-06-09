package v1

import (
	v1 "github.com/crossplane/crossplane/apis/pkg/v1"
	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/scheme"
)

func init() {
	// Register the types with the Scheme so the components can map objects to GroupVersionKinds and back
	AddToSchemes = append(AddToSchemes,
		v1.SchemeBuilder.AddToScheme,
	)
	
	err := AddToScheme(scheme.Scheme)
	if err != nil {
		log.Fatal().Err(err).Msg("Error adding to scheme for pkg.crossplane.io/v1")
	}
}

// AddToSchemes may be used to add all resources defined in the project to a Scheme
var AddToSchemes runtime.SchemeBuilder

// AddToScheme adds all Resources to the Scheme
func AddToScheme(s *runtime.Scheme) error {
	return AddToSchemes.AddToScheme(s)
}
