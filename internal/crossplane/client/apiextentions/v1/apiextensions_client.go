package v1

import (
	"net/http"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

type Interface interface {
}

type ApiExtensionsV1Interface interface {
	RESTClient() rest.Interface
	CompositionGetter
	CompositeResourceDefinitionGetter
	CompositionRevisionGetter
}

func New(c rest.Interface) *ApiExtensionsV1Client {
	return &ApiExtensionsV1Client{c}
}

type ApiExtensionsV1Client struct {
	restClient rest.Interface
}

func (c *ApiExtensionsV1Client) Compositions() CompositionInterface {
	return newCompositions(c)
}
func (c *ApiExtensionsV1Client) CompositionRevisions() CompositionRevisionInterface {
	return newCompositionRevisions(c)
}
func (c *ApiExtensionsV1Client) CompositeResourceDefinitions() CompositeResourceDefinitionsInterface {
	return newCompositeResourceDefinitions(c)
}

func (c *ApiExtensionsV1Client) RESTClient() rest.Interface {
	if c == nil {
		return nil
	}
	return c.restClient
}

func NewForConfig(c *rest.Config) (*ApiExtensionsV1Client, error) {
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

func NewForConfigAndClient(c *rest.Config, h *http.Client) (*ApiExtensionsV1Client, error) {
	config := *c
	if err := setConfigDefaults(&config); err != nil {
		return nil, err
	}
	client, err := rest.RESTClientForConfigAndClient(&config, h)
	if err != nil {
		return nil, err
	}
	return &ApiExtensionsV1Client{client}, nil
}

func setConfigDefaults(config *rest.Config) error {

	config.ContentConfig.GroupVersion = &schema.GroupVersion{Group: v1.Group, Version: v1.Version}
	config.APIPath = "/apis"
	config.NegotiatedSerializer = scheme.Codecs.WithoutConversion()
	config.UserAgent = rest.DefaultKubernetesUserAgent()

	if config.UserAgent == "" {
		config.UserAgent = rest.DefaultKubernetesUserAgent()
	}
	return nil
}
