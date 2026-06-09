package v1

import (
	"context"
	"time"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	scheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

const compositeResourceDefinitionResource = "CompositeResourceDefinitions"

type CompositeResourceDefinitionsInterface interface {
	Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1.CompositeResourceDefinition, err error)
	List(ctx context.Context, opts metav1.ListOptions) (result *v1.CompositeResourceDefinitionList, err error)
	Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error)
	Create(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.CreateOptions) (result *v1.CompositeResourceDefinition, err error)
	Update(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (result *v1.CompositeResourceDefinition, err error)
	UpdateStatus(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (result *v1.CompositeResourceDefinition, err error)
	Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error
	DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error
}

type CompositeResourceDefinitionGetter interface {
	CompositeResourceDefinitions() CompositeResourceDefinitionsInterface
}

type compositeResourceDefinitions struct {
	client rest.Interface
}

// newNodes returns a Nodes
func newCompositeResourceDefinitions(c *ApiExtensionsV1Client) *compositeResourceDefinitions {
	return &compositeResourceDefinitions{
		client: c.RESTClient(),
	}
}

// Get takes name of the compositeResourceDefinition, and returns the corresponding compositeResourceDefinition object, and an error if there is any.
func (c *compositeResourceDefinitions) Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1.CompositeResourceDefinition, err error) {
	result = &v1.CompositeResourceDefinition{}
	err = c.client.Get().
		Resource(compositeResourceDefinitionResource).
		Name(name).
		VersionedParams(&options, scheme.ParameterCodec).
		Do(ctx).
		Into(result)
	return
}

func (c *compositeResourceDefinitions) List(ctx context.Context, opts metav1.ListOptions) (result *v1.CompositeResourceDefinitionList, err error) {

	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	result = &v1.CompositeResourceDefinitionList{}
	err = c.client.Get().
		Resource(compositeResourceDefinitionResource).
		// VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Do(ctx).
		Into(result)
	return

}

// Watch returns a watch.Interface that watches the requested nodes.
func (c *compositeResourceDefinitions) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	opts.Watch = true
	return c.client.Get().
		Resource(compositeResourceDefinitionResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Watch(ctx)
}

// Create takes the representation of a node and creates it.  Returns the server's representation of the node, and an error, if there is any.
func (c *compositeResourceDefinitions) Create(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.CreateOptions) (result *v1.CompositeResourceDefinition, err error) {
	result = &v1.CompositeResourceDefinition{}
	err = c.client.Post().
		Resource(compositeResourceDefinitionResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *compositeResourceDefinitions) Update(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (result *v1.CompositeResourceDefinition, err error) {
	result = &v1.CompositeResourceDefinition{}
	err = c.client.Put().
		Resource(compositeResourceDefinitionResource).
		Name(node.Name).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *compositeResourceDefinitions) UpdateStatus(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (result *v1.CompositeResourceDefinition, err error) {
	result = &v1.CompositeResourceDefinition{}
	err = c.client.Put().
		Resource(compositeResourceDefinitionResource).
		Name(node.Name).
		SubResource("status").
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

// Delete takes name of the node and deletes it. Returns an error if one occurs.
func (c *compositeResourceDefinitions) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return c.client.Delete().
		Resource(compositeResourceDefinitionResource).
		Name(name).
		Body(&opts).
		Do(ctx).
		Error()
}

// DeleteCollection deletes a collection of objects.
func (c *compositeResourceDefinitions) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	var timeout time.Duration
	if listOpts.TimeoutSeconds != nil {
		timeout = time.Duration(*listOpts.TimeoutSeconds) * time.Second
	}
	return c.client.Delete().
		Resource(compositeResourceDefinitionResource).
		VersionedParams(&listOpts, scheme.ParameterCodec).
		Timeout(timeout).
		Body(&opts).
		Do(ctx).
		Error()
}
