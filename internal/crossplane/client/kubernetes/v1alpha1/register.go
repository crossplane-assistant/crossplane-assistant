package v1alpha1

import (
	objectv1alpha1 "github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/scheme"
)

func init() {
	// Register the types with the Scheme so the components can map objects to GroupVersionKinds and back
	AddToSchemes = append(AddToSchemes,
		// templatev1alpha1.SchemeBuilder.AddToScheme,
		objectv1alpha1.SchemeBuilder.AddToScheme,
	)

	err := AddToScheme(scheme.Scheme)
	if err != nil {
		log.Fatal().Err(err).Msg("Error adding to scheme for kubernetes/v1alpha1")
	}
}

// AddToSchemes may be used to add all resources defined in the project to a Scheme
var AddToSchemes runtime.SchemeBuilder

// AddToScheme adds all Resources to the Scheme
func AddToScheme(s *runtime.Scheme) error {
	return AddToSchemes.AddToScheme(s)
}
