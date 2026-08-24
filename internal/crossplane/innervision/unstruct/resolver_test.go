package unstruct

import (
	"context"
	"testing"
	"time"

	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsfake "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	dynamicfake "k8s.io/client-go/dynamic/fake"
)

// newFakeCRDRegistry builds a CRDRegistry backed by an apiextensionsfake
// clientset seeded with the given CRDs. The registry's informer syncs
// asynchronously, so callers must allow a short delay before reading it.
func newFakeCRDRegistry(t *testing.T, crds ...*v1.CustomResourceDefinition) *resource.CRDRegistry {
	t.Helper()
	objs := make([]runtime.Object, 0, len(crds))
	for _, crd := range crds {
		objs = append(objs, crd)
	}
	fakeExtensions := apiextensionsfake.NewSimpleClientset(objs...)
	crdClient := fakeExtensions.ApiextensionsV1().CustomResourceDefinitions()
	registry := resource.NewCRDRegistry(crdClient)

	// Give the cache informer a tiny moment to sync.
	time.Sleep(10 * time.Millisecond)
	return registry
}

func widgetCRD() *v1.CustomResourceDefinition {
	return &v1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "widgets.example.org",
		},
		Spec: v1.CustomResourceDefinitionSpec{
			Group: "example.org",
			Names: v1.CustomResourceDefinitionNames{
				Kind:   "Widget",
				Plural: "widgets",
			},
			Versions: []v1.CustomResourceDefinitionVersion{
				{Name: "v1"},
			},
		},
	}
}

func TestIsK8SNativeGroup(t *testing.T) {
	r := &ResourceResolver{}

	assert.True(t, r.isK8SNativeGroup(""))
	assert.True(t, r.isK8SNativeGroup("batch"))
	assert.True(t, r.isK8SNativeGroup("autoscaling"))
	assert.False(t, r.isK8SNativeGroup("example.org"))
	assert.False(t, r.isK8SNativeGroup("database.aws.upbound.io"))
}

func TestResolveNativeGVR(t *testing.T) {
	r := &ResourceResolver{}

	t.Run("regular kind is pluralized", func(t *testing.T) {
		gvr, err := r.resolveNativeGVR(schema.GroupVersionKind{Group: "", Version: "v1", Kind: "Pod"})
		require.NoError(t, err)
		assert.Equal(t, schema.GroupVersionResource{Group: "", Version: "v1", Resource: "pods"}, gvr)
	})

	t.Run("ComponentStatus uses the -es suffix", func(t *testing.T) {
		gvr, err := r.resolveNativeGVR(schema.GroupVersionKind{Group: "", Version: "v1", Kind: "ComponentStatus"})
		require.NoError(t, err)
		assert.Equal(t, schema.GroupVersionResource{Group: "", Version: "v1", Resource: "componentstatuses"}, gvr)
	})
}

func TestResolveCustomResourceGVR(t *testing.T) {
	crdRegistry := newFakeCRDRegistry(t, widgetCRD())
	r := &ResourceResolver{crdRegistry: crdRegistry}

	t.Run("found returns the GVR matching the CRD's plural name", func(t *testing.T) {
		gvr, err := r.resolveCustomResourceGVR(schema.GroupVersionKind{Group: "example.org", Version: "v1", Kind: "Widget"})
		require.NoError(t, err)
		assert.Equal(t, schema.GroupVersionResource{Group: "example.org", Version: "v1", Resource: "widgets"}, gvr)
	})

	t.Run("not found returns an error", func(t *testing.T) {
		_, err := r.resolveCustomResourceGVR(schema.GroupVersionKind{Group: "example.org", Version: "v1", Kind: "Gadget"})
		assert.Error(t, err)
	})

	t.Run("group mismatch returns an error", func(t *testing.T) {
		// Same Kind as a registered CRD, but a different group - must not resolve.
		_, err := r.resolveCustomResourceGVR(schema.GroupVersionKind{Group: "other.org", Version: "v1", Kind: "Widget"})
		assert.Error(t, err)
	})
}

func newUnstructured(apiVersion, kind, namespace, name string) *unstructured.Unstructured {
	obj := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": apiVersion,
			"kind":       kind,
			"metadata": map[string]interface{}{
				"name": name,
			},
		},
	}
	if namespace != "" {
		obj.Object["metadata"].(map[string]interface{})["namespace"] = namespace
	}
	return obj
}

func TestGetClient(t *testing.T) {
	crdRegistry := newFakeCRDRegistry(t, widgetCRD())
	dynamicClient := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme())
	r := NewResourceResolver(dynamicClient, crdRegistry)

	t.Run("resolvable kind returns a namespaceable client", func(t *testing.T) {
		client, err := r.GetClient("example.org/v1", "Widget")
		require.NoError(t, err)
		assert.NotNil(t, client)
	})

	t.Run("unresolvable kind returns an error", func(t *testing.T) {
		_, err := r.GetClient("example.org/v1", "Unknown")
		assert.Error(t, err)
	})
}

func TestResolveUnstructuredResources(t *testing.T) {
	crdRegistry := newFakeCRDRegistry(t, widgetCRD())

	t.Run("namespaced path", func(t *testing.T) {
		widget := newUnstructured("example.org/v1", "Widget", "team-a", "w1")
		dynamicClient := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme(), widget)
		r := NewResourceResolver(dynamicClient, crdRegistry)

		got, err := r.ResolveUnstructuredResources(context.Background(), "example.org/v1", "Widget", "team-a", "w1")
		require.NoError(t, err)
		assert.Equal(t, "w1", got.GetName())
		assert.Equal(t, "team-a", got.GetNamespace())
	})

	t.Run("cluster-scoped path (namespace empty)", func(t *testing.T) {
		node := newUnstructured("v1", "Node", "", "node-1")
		dynamicClient := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme(), node)
		r := NewResourceResolver(dynamicClient, crdRegistry)

		got, err := r.ResolveUnstructuredResources(context.Background(), "v1", "Node", "", "node-1")
		require.NoError(t, err)
		assert.Equal(t, "node-1", got.GetName())
		assert.Empty(t, got.GetNamespace())
	})
}
