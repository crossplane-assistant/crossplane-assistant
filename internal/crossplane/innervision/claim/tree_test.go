package claim_test

import (
	"context"
	"fmt"
	"testing"

	objectv1alpha1 "github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	k8sv1alpha1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/kubernetes/v1alpha1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	extv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	dynamicfake "k8s.io/client-go/dynamic/fake"
)

// fakeObjectInterface is a small hand-written test double for
// k8sv1alpha1.ObjectInterface, keyed by object name.
type fakeObjectInterface struct {
	objects map[string]*objectv1alpha1.Object
}

func (f *fakeObjectInterface) Get(ctx context.Context, name string, options metav1.GetOptions) (*objectv1alpha1.Object, error) {
	obj, ok := f.objects[name]
	if !ok {
		return nil, fmt.Errorf("object %q not found", name)
	}
	return obj, nil
}
func (f *fakeObjectInterface) List(ctx context.Context, opts metav1.ListOptions) (*objectv1alpha1.ObjectList, error) {
	return &objectv1alpha1.ObjectList{}, nil
}
func (f *fakeObjectInterface) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	return watch.NewFake(), nil
}
func (f *fakeObjectInterface) Create(ctx context.Context, node *objectv1alpha1.Object, opts metav1.CreateOptions) (*objectv1alpha1.Object, error) {
	return nil, nil
}
func (f *fakeObjectInterface) Update(ctx context.Context, node *objectv1alpha1.Object, opts metav1.UpdateOptions) (*objectv1alpha1.Object, error) {
	return nil, nil
}
func (f *fakeObjectInterface) UpdateStatus(ctx context.Context, node *objectv1alpha1.Object, opts metav1.UpdateOptions) (*objectv1alpha1.Object, error) {
	return nil, nil
}
func (f *fakeObjectInterface) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return nil
}
func (f *fakeObjectInterface) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	return nil
}

// fakeKubernetesProviderClient implements claim.KubernetesProviderClient.
type fakeKubernetesProviderClient struct {
	objects map[string]*objectv1alpha1.Object
}

func (f *fakeKubernetesProviderClient) Objects() k8sv1alpha1.ObjectInterface {
	return &fakeObjectInterface{objects: f.objects}
}

func widgetCompositeCRD() *extv1.CustomResourceDefinition {
	return &extv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{Name: "widgets.example.org"},
		Spec: extv1.CustomResourceDefinitionSpec{
			Group: "example.org",
			Names: extv1.CustomResourceDefinitionNames{
				Kind:   "Widget",
				Plural: "widgets",
			},
			Versions: []extv1.CustomResourceDefinitionVersion{{Name: "v1"}},
		},
	}
}

func newWidgetClaimWithRef(namespace, name string, resourceRef map[string]interface{}) *unstructured.Unstructured {
	obj := newWidgetClaim(namespace, name)
	if resourceRef != nil {
		obj.Object["spec"] = map[string]interface{}{"resourceRef": resourceRef}
	}
	return obj
}

func newConfigMap(namespace, name string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "ConfigMap",
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
		},
	}
}

func newTreeClaimService(t *testing.T, xK8sProviderClient claim.KubernetesProviderClient, dynamicObjs ...runtime.Object) *claim.Service {
	t.Helper()
	crdRegistry := newFakeCRDRegistry(t, widgetClaimCRD(), widgetCompositeCRD())
	dynamicClient := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme(), dynamicObjs...)
	resourceResolver := unstruct.NewResourceResolver(dynamicClient, crdRegistry)

	return claim.NewClaimService(
		&fakeXRDClient{list: &v1.CompositeResourceDefinitionList{}},
		nil,
		crdRegistry,
		nil,
		dynamicClient,
		xK8sProviderClient,
		resourceResolver,
	)
}

func TestService_GetResourcesTree(t *testing.T) {
	t.Run("claim with no composite reference returns just the root node", func(t *testing.T) {
		claimObj := newWidgetClaimWithRef("team-a", "w1", nil)
		svc := newTreeClaimService(t, nil, claimObj)

		tree, err := svc.GetResourcesTree(context.Background(), &unstruct.ResourceRef{
			APIVersion: "example.org/v1", Kind: "WidgetClaim", Namespace: "team-a", Name: "w1",
		})
		require.NoError(t, err)
		require.NotNil(t, tree.Root)
		assert.Equal(t, "XRC", tree.Root.MetaKind)
		assert.Empty(t, tree.Root.Children)
	})

	t.Run("claim -> composite -> plain managed resource", func(t *testing.T) {
		claimObj := newWidgetClaimWithRef("team-a", "w1", map[string]interface{}{
			"apiVersion": "example.org/v1",
			"kind":       "Widget",
			"name":       "widget-1",
		})
		compositeObj := &unstructured.Unstructured{
			Object: map[string]interface{}{
				"apiVersion": "example.org/v1",
				"kind":       "Widget",
				"metadata":   map[string]interface{}{"name": "widget-1"},
				"spec": map[string]interface{}{
					"resourceRefs": []interface{}{
						map[string]interface{}{
							"apiVersion": "v1",
							"kind":       "ConfigMap",
							"name":       "cm-1",
							"namespace":  "ns-1",
						},
					},
				},
			},
		}
		cm := newConfigMap("ns-1", "cm-1")

		svc := newTreeClaimService(t, nil, claimObj, compositeObj, cm)

		tree, err := svc.GetResourcesTree(context.Background(), &unstruct.ResourceRef{
			APIVersion: "example.org/v1", Kind: "WidgetClaim", Namespace: "team-a", Name: "w1",
		})
		require.NoError(t, err)
		require.Len(t, tree.Root.Children, 1)

		compositeNode := tree.Root.Children[0]
		assert.Equal(t, "XR", compositeNode.MetaKind)
		assert.Equal(t, "Widget", compositeNode.Kind)
		require.Len(t, compositeNode.Children, 1)

		resourceNode := compositeNode.Children[0]
		assert.Equal(t, "Resource", resourceNode.MetaKind)
		assert.Equal(t, "ConfigMap", resourceNode.Kind)
		assert.Equal(t, "cm-1", resourceNode.Name)
	})

	t.Run("claim -> composite -> kubernetes.crossplane.io Object resource", func(t *testing.T) {
		claimObj := newWidgetClaimWithRef("team-a", "w1", map[string]interface{}{
			"apiVersion": "example.org/v1",
			"kind":       "Widget",
			"name":       "widget-1",
		})
		compositeObj := &unstructured.Unstructured{
			Object: map[string]interface{}{
				"apiVersion": "example.org/v1",
				"kind":       "Widget",
				"metadata":   map[string]interface{}{"name": "widget-1"},
				"spec": map[string]interface{}{
					"resourceRefs": []interface{}{
						map[string]interface{}{
							"apiVersion": "kubernetes.crossplane.io/v1alpha1",
							"kind":       "Object",
							"name":       "obj-1",
						},
					},
				},
			},
		}
		wrappedManifest := newConfigMap("ns-2", "cm-2")

		providerObject := &objectv1alpha1.Object{
			ObjectMeta: metav1.ObjectMeta{Name: "obj-1"},
			Status: objectv1alpha1.ObjectStatus{
				AtProvider: objectv1alpha1.ObjectObservation{
					Manifest: runtime.RawExtension{
						Raw: []byte(`{"apiVersion":"v1","kind":"ConfigMap","metadata":{"name":"cm-2","namespace":"ns-2"}}`),
					},
				},
			},
		}
		xK8sProviderClient := &fakeKubernetesProviderClient{objects: map[string]*objectv1alpha1.Object{
			"obj-1": providerObject,
		}}

		svc := newTreeClaimService(t, xK8sProviderClient, claimObj, compositeObj, wrappedManifest)

		tree, err := svc.GetResourcesTree(context.Background(), &unstruct.ResourceRef{
			APIVersion: "example.org/v1", Kind: "WidgetClaim", Namespace: "team-a", Name: "w1",
		})
		require.NoError(t, err)
		require.Len(t, tree.Root.Children, 1)

		compositeNode := tree.Root.Children[0]
		require.Len(t, compositeNode.Children, 1)

		objectNode := compositeNode.Children[0]
		assert.Equal(t, "Resource", objectNode.MetaKind)
		assert.Equal(t, "Object", objectNode.Kind)
		require.Len(t, objectNode.Children, 1)

		manifestNode := objectNode.Children[0]
		assert.Equal(t, "Manifest", manifestNode.MetaKind)
		assert.Equal(t, "ConfigMap", manifestNode.Kind)
		assert.Equal(t, "cm-2", manifestNode.Name)
		assert.Equal(t, "ns-2", manifestNode.Namespace)
	})
}
