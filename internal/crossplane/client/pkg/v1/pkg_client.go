package v1

import (
	"net/http"

	v1 "github.com/crossplane/crossplane/apis/pkg/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

type Interface interface {
}

type PkgV1Interface interface {
	RESTClient() rest.Interface
	ProviderGetter
	ProviderRevisionGetter
	FunctionGetter
}

type PkgV1Client struct {
	restClient rest.Interface
}

func New(c rest.Interface) *PkgV1Client {
	return &PkgV1Client{c}
}

func (c *PkgV1Client) Functions() FunctionInterface {
	return newFunctions(c)
}

func (c *PkgV1Client) Providers() ProviderInterface {
	return newProviders(c)
}

func (c *PkgV1Client) ProviderRevisions() ProviderRevisionInterface {
	return newProviderRevisions(c)
}

func (c *PkgV1Client) RESTClient() rest.Interface {
	if c == nil {
		return nil
	}
	return c.restClient
}

func NewForConfig(c *rest.Config) (*PkgV1Client, error) {
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

func NewForConfigAndClient(c *rest.Config, h *http.Client) (*PkgV1Client, error) {
	config := *c
	if err := setConfigDefaults(&config); err != nil {
		return nil, err
	}
	client, err := rest.RESTClientForConfigAndClient(&config, h)
	if err != nil {
		return nil, err
	}
	return &PkgV1Client{client}, nil
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
