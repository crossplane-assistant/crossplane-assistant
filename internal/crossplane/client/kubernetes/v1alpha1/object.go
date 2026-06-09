package v1alpha1

import (
	"context"
	"time"

	"github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	scheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
)

const objectResource = "Objects"

type ObjectInterface interface {
	Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1alpha1.Object, err error)
	List(ctx context.Context, opts metav1.ListOptions) (result *v1alpha1.ObjectList, err error)
	Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error)
	Create(ctx context.Context, node *v1alpha1.Object, opts metav1.CreateOptions) (result *v1alpha1.Object, err error)
	Update(ctx context.Context, node *v1alpha1.Object, opts metav1.UpdateOptions) (result *v1alpha1.Object, err error)
	UpdateStatus(ctx context.Context, node *v1alpha1.Object, opts metav1.UpdateOptions) (result *v1alpha1.Object, err error)
	Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error
	DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error
}

type ObjectGetter interface {
	Objects() ObjectInterface
}

type objects struct {
	client rest.Interface
}

// newNodes returns a Nodes
func newObjects(c *KubernetesV1AlphaClient) *objects {
	return &objects{
		client: c.RESTClient(),
	}
}

// Get takes name of the object, and returns the corresponding object object, and an error if there is any.
func (c *objects) Get(ctx context.Context, name string, options metav1.GetOptions) (result *v1alpha1.Object, err error) {
	result = &v1alpha1.Object{}
	err = c.client.Get().
		Resource(objectResource).
		Name(name).
		VersionedParams(&options, scheme.ParameterCodec).
		Do(ctx).
		Into(result)
	return
}

func (c *objects) List(ctx context.Context, opts metav1.ListOptions) (result *v1alpha1.ObjectList, err error) {

	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	result = &v1alpha1.ObjectList{}
	err = c.client.Get().
		Resource(objectResource).
		// VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Do(ctx).
		Into(result)
	return

}

// Watch returns a watch.Interface that watches the requested nodes.
func (c *objects) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	opts.Watch = true
	return c.client.Get().
		Resource(objectResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Watch(ctx)
}

// Create takes the representation of a node and creates it.  Returns the server's representation of the node, and an error, if there is any.
func (c *objects) Create(ctx context.Context, node *v1alpha1.Object, opts metav1.CreateOptions) (result *v1alpha1.Object, err error) {
	result = &v1alpha1.Object{}
	err = c.client.Post().
		Resource(objectResource).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *objects) Update(ctx context.Context, node *v1alpha1.Object, opts metav1.UpdateOptions) (result *v1alpha1.Object, err error) {
	result = &v1alpha1.Object{}
	err = c.client.Put().
		Resource(objectResource).
		Name(node.Name).
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

func (c *objects) UpdateStatus(ctx context.Context, node *v1alpha1.Object, opts metav1.UpdateOptions) (result *v1alpha1.Object, err error) {
	result = &v1alpha1.Object{}
	err = c.client.Put().
		Resource(objectResource).
		Name(node.Name).
		SubResource("status").
		VersionedParams(&opts, scheme.ParameterCodec).
		Body(node).
		Do(ctx).
		Into(result)
	return
}

// Delete takes name of the node and deletes it. Returns an error if one occurs.
func (c *objects) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return c.client.Delete().
		Resource(objectResource).
		Name(name).
		Body(&opts).
		Do(ctx).
		Error()
}

// DeleteCollection deletes a collection of objects.
func (c *objects) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	var timeout time.Duration
	if listOpts.TimeoutSeconds != nil {
		timeout = time.Duration(*listOpts.TimeoutSeconds) * time.Second
	}
	return c.client.Delete().
		Resource(objectResource).
		VersionedParams(&listOpts, scheme.ParameterCodec).
		Timeout(timeout).
		Body(&opts).
		Do(ctx).
		Error()
}
