package client

import (
	"fmt"
	"net/http"

	apiextensionsv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/apiextentions/v1"
	kubernetesv1alpha "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/kubernetes/v1alpha1"
	pkgv1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1"
	"k8s.io/client-go/util/flowcontrol"

	"k8s.io/client-go/rest"
)

type Interface interface {
	APIExtensionsV1() apiextensionsv1.ApiExtensionsV1Interface
	PkgV1() pkgv1.PkgV1Interface
	KubernetesV1alpha1() kubernetesv1alpha.KubernetesV1AlphaClient
}

// Clientset contains the clients for groups.
type Clientset struct {
	//	*discovery.DiscoveryClient
	apiextensionsV1    *apiextensionsv1.ApiExtensionsV1Client
	pkgV1              *pkgv1.PkgV1Client
	kubernetesV1alpha1 *kubernetesv1alpha.KubernetesV1AlphaClient
}

func (c *Clientset) ApiExtensionsV1() apiextensionsv1.ApiExtensionsV1Interface {
	return c.apiextensionsV1
}

func (c *Clientset) PkgV1() pkgv1.PkgV1Interface {
	return c.pkgV1
}

func (c *Clientset) KubernetesV1alpha() kubernetesv1alpha.KubernetesV1alphaInterface {
	return c.kubernetesV1alpha1
}

// Discovery retrieves the DiscoveryClient
/*func (c *Clientset) Discovery() discovery.DiscoveryInterface {
	if c == nil {
		return nil
	}
	return c.DiscoveryClient
}*/

// NewForConfig creates a new Clientset for the given config.
// If config's RateLimiter is not set and QPS and Burst are acceptable,
// NewForConfig will generate a rate-limiter in configShallowCopy.
// NewForConfig is equivalent to NewForConfigAndClient(c, httpClient),
// where httpClient was generated with rest.HTTPClientFor(c).
func NewForConfig(c *rest.Config) (*Clientset, error) {
	configShallowCopy := *c

	if configShallowCopy.UserAgent == "" {
		configShallowCopy.UserAgent = rest.DefaultKubernetesUserAgent()
	}

	// share the transport between all clients
	httpClient, err := rest.HTTPClientFor(&configShallowCopy)
	if err != nil {
		return nil, err
	}

	return NewForConfigAndClient(&configShallowCopy, httpClient)
}

// NewForConfigAndClient creates a new Clientset for the given config and http client.
// Note the http client provided takes precedence over the configured transport values.
// If config's RateLimiter is not set and QPS and Burst are acceptable,
// NewForConfigAndClient will generate a rate-limiter in configShallowCopy.
func NewForConfigAndClient(c *rest.Config, httpClient *http.Client) (*Clientset, error) {
	configShallowCopy := *c
	if configShallowCopy.RateLimiter == nil && configShallowCopy.QPS > 0 {
		if configShallowCopy.Burst <= 0 {
			return nil, fmt.Errorf("burst is required to be greater than 0 when RateLimiter is not set and QPS is set to greater than 0")
		}
		configShallowCopy.RateLimiter = flowcontrol.NewTokenBucketRateLimiter(configShallowCopy.QPS, configShallowCopy.Burst)
	}

	var cs Clientset
	var err error
	cs.apiextensionsV1, err = apiextensionsv1.NewForConfigAndClient(&configShallowCopy, httpClient)
	if err != nil {
		return nil, err
	}
	cs.kubernetesV1alpha1, err = kubernetesv1alpha.NewForConfigAndClient(&configShallowCopy, httpClient)
	if err != nil {
		return nil, err
	}
	cs.pkgV1, err = pkgv1.NewForConfigAndClient(&configShallowCopy, httpClient)

	// cs.DiscoveryClient, err = discovery.NewDiscoveryClientForConfigAndClient(&configShallowCopy, httpClient)
	if err != nil {
		return nil, err
	}
	return &cs, nil
}

// NewForConfigOrDie creates a new Clientset for the given config and
// panics if there is an error in the config.
func NewForConfigOrDie(c *rest.Config) *Clientset {
	cs, err := NewForConfig(c)
	if err != nil {
		panic(err)
	}
	return cs
}

// New creates a new Clientset for the given RESTClient.
func New(c rest.Interface) *Clientset {
	var cs Clientset
	cs.apiextensionsV1 = apiextensionsv1.New(c)
	cs.kubernetesV1alpha1 = kubernetesv1alpha.New(c)
	cs.pkgV1 = pkgv1.New(c)

	// cs.DiscoveryClient = discovery.NewDiscoveryClient(c)
	return &cs
}
