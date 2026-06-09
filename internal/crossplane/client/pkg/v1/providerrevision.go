package v1

import (
	"context"
	"time"

	v1 "github.com/crossplane/crossplane/apis/pkg/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

const providerRevisionResource = "ProviderRevisions"

var _ ProviderRevisionInterface = &providerRevisions{}

type ProviderRevisionInterface interface {
	Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1.ProviderRevision, err error)
	List(ctx context.Context, opts metav1.ListOptions) (result *v1.ProviderRevisionList, err error)
	Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error)
	Create(ctx context.Context, node *v1.ProviderRevision, opts metav1.CreateOptions) (result *v1.ProviderRevision, err error)
	Update(ctx context.Context, node *v1.ProviderRevision, opts metav1.UpdateOptions) (result *v1.ProviderRevision, err error)
	UpdateStatus(ctx context.Context, node *v1.ProviderRevision, opts metav1.UpdateOptions) (result *v1.ProviderRevision, err error)
	Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error
	DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error
}

type ProviderRevisionGetter interface {
	ProviderRevisions() ProviderRevisionInterface
}

type providerRevisions struct {
	client rest.Interface
}

// newNodes returns a Nodes
func newProviderRevisions(c *PkgV1Client) *providerRevisions {
	return &providerRevisions{
		client: c.RESTClient(),
	}
}

// Get takes name of the provider, and returns the corresponding provider object, and an error if there is any.
func (c *providerRevisions) Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1.ProviderRevision, err error) {
	result = &v1.ProviderRevision{}
	err = c.client.Get().
		Resource(providerRevisionResource).
		Name(name).
		VersionedParams(&options, scheme.ParameterCodec).
		Do(ctx).
		Into(result)
	return
}

func (c *providerRevisions) List(ctx context.Context, opts metav1.ListOptions) (result *v1.ProviderRevisionList, err error) {

	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	result = &v1.ProviderRevisionList{}
	err = c.client.Get().
		Resource(providerRevisionResource).
		// VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Do(ctx).
		Into(result)
	return

}

// Watch returns a watch.Interface that watches the requested nodes.
func (c *providerRevisions) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	opts.Watch = true
	return c.client.Get().
		Resource(providerRevisionResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Watch(ctx)
}

// Create takes the representation of a node and creates it.  Returns the server's representation of the node, and an error, if there is any.
func (c *providerRevisions) Create(ctx context.Context, node *v1.ProviderRevision, opts metav1.CreateOptions) (result *v1.ProviderRevision, err error) {
	result = &v1.ProviderRevision{}
	err = c.client.Post().
		Resource(providerRevisionResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *providerRevisions) Update(ctx context.Context, node *v1.ProviderRevision, opts metav1.UpdateOptions) (result *v1.ProviderRevision, err error) {
	result = &v1.ProviderRevision{}
	err = c.client.Put().
		Resource(providerRevisionResource).
		Name(node.Name).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *providerRevisions) UpdateStatus(ctx context.Context, node *v1.ProviderRevision, opts metav1.UpdateOptions) (result *v1.ProviderRevision, err error) {
	result = &v1.ProviderRevision{}
	err = c.client.Put().
		Resource(providerRevisionResource).
		Name(node.Name).
		SubResource("status").
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

// Delete takes name of the node and deletes it. Returns an error if one occurs.
func (c *providerRevisions) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return c.client.Delete().
		Resource(providerRevisionResource).
		Name(name).
		Body(&opts).
		Do(ctx).
		Error()
}

// DeleteCollection deletes a collection of objects.
func (c *providerRevisions) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	var timeout time.Duration
	if listOpts.TimeoutSeconds != nil {
		timeout = time.Duration(*listOpts.TimeoutSeconds) * time.Second
	}
	return c.client.Delete().
		Resource(providerRevisionResource).
		VersionedParams(&listOpts, scheme.ParameterCodec).
		Timeout(timeout).
		Body(&opts).
		Do(ctx).
		Error()
}
