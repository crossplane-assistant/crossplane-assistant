package v1alpha1

import (
	"net/http"

	"github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

type Interface interface {
}

type KubernetesV1alphaInterface interface {
	RESTClient() rest.Interface
	ObjectGetter
}

type KubernetesV1AlphaClient struct {
	restClient rest.Interface
}

func New(c rest.Interface) *KubernetesV1AlphaClient {
	return &KubernetesV1AlphaClient{c}
}

func (c *KubernetesV1AlphaClient) Objects() ObjectInterface {
	return newObjects(c)
}

func (c *KubernetesV1AlphaClient) RESTClient() rest.Interface {
	if c == nil {
		return nil
	}
	return c.restClient
}

func NewForConfig(c *rest.Config) (*KubernetesV1AlphaClient, error) {
	config := *c
	if err := setConfigDefaults(&config); err != nil {
		return nil, err
	}

	httpClient, err := rest.HTTPClientFor(&config)
	if err != nil {
		return nil, err
	}
	return NewForConfigAndClient(&config, httpClient)
}

func NewForConfigAndClient(c *rest.Config, h *http.Client) (*KubernetesV1AlphaClient, error) {
	config := *c
	if err := setConfigDefaults(&config); err != nil {
		return nil, err
	}
	client, err := rest.RESTClientForConfigAndClient(&config, h)
	if err != nil {
		return nil, err
	}
	return &KubernetesV1AlphaClient{client}, nil
}

func setConfigDefaults(config *rest.Config) error {

	config.ContentConfig.GroupVersion = &schema.GroupVersion{Group: v1alpha1.Group, Version: v1alpha1.Version}
	config.APIPath = "/apis"
	config.NegotiatedSerializer = scheme.Codecs.WithoutConversion()
	config.UserAgent = rest.DefaultKubernetesUserAgent()

	if config.UserAgent == "" {
		config.UserAgent = rest.DefaultKubernetesUserAgent()
	}

	return nil

}
