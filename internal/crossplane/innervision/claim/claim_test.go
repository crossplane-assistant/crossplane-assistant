package claim_test

import (
	"context"
	"testing"
	"time"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	extv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsfake "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	dynamicfake "k8s.io/client-go/dynamic/fake"
)

// fakeXRDClient is a small hand-written test double for
// compositionv1.CompositeResourceDefinitionsInterface. That interface is not
// in .mockery.yaml's scope (only the interfaces this change's tests actually
// need are mockery-generated), so it is faked directly here, the same way
// managedresource_test.go already fakes other hand-rolled client-go-style
// interfaces.
type fakeXRDClient struct {
	list *v1.CompositeResourceDefinitionList
}

func (f *fakeXRDClient) Get(ctx context.Context, name string, options metav1.GetOptions) (*v1.CompositeResourceDefinition, error) {
	return nil, nil
}
func (f *fakeXRDClient) List(ctx context.Context, opts metav1.ListOptions) (*v1.CompositeResourceDefinitionList, error) {
	return f.list, nil
}
func (f *fakeXRDClient) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	return watch.NewFake(), nil
}
func (f *fakeXRDClient) Create(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.CreateOptions) (*v1.CompositeResourceDefinition, error) {
	return nil, nil
}
func (f *fakeXRDClient) Update(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (*v1.CompositeResourceDefinition, error) {
	return nil, nil
}
func (f *fakeXRDClient) UpdateStatus(ctx context.Context, node *v1.CompositeResourceDefinition, opts metav1.UpdateOptions) (*v1.CompositeResourceDefinition, error) {
	return nil, nil
}
func (f *fakeXRDClient) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return nil
}
func (f *fakeXRDClient) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	return nil
}

// widgetClaimXRD and widgetClaimCRD describe a single composite resource
// definition ("WidgetClaim" claims of composite "Widget") shared across the
// tests below.
func widgetClaimXRD() v1.CompositeResourceDefinition {
	return v1.CompositeResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{Name: "widgets.example.org"},
		Spec: v1.CompositeResourceDefinitionSpec{
			Group: "example.org",
			Names: extv1.CustomResourceDefinitionNames{Kind: "Widget", Plural: "widgets"},
			ClaimNames: &extv1.CustomResourceDefinitionNames{
				Kind:   "WidgetClaim",
				Plural: "widgetclaims",
			},
		},
	}
}

func widgetClaimCRD() *extv1.CustomResourceDefinition {
	return &extv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{Name: "widgetclaims.example.org"},
		Spec: extv1.CustomResourceDefinitionSpec{
			Group: "example.org",
			Names: extv1.CustomResourceDefinitionNames{
				Kind:   "WidgetClaim",
				Plural: "widgetclaims",
			},
			Versions: []extv1.CustomResourceDefinitionVersion{{Name: "v1"}},
		},
	}
}

func newFakeCRDRegistry(t *testing.T, crds ...*extv1.CustomResourceDefinition) *resource.CRDRegistry {
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

func newWidgetClaim(namespace, name string) *unstructured.Unstructured {
	obj := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "example.org/v1",
			"kind":       "WidgetClaim",
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
		},
	}
	return obj
}

func newClaimService(t *testing.T, xrdList *v1.CompositeResourceDefinitionList, dynamicObjs ...runtime.Object) *claim.Service {
	t.Helper()
	crdRegistry := newFakeCRDRegistry(t, widgetClaimCRD())
	dynamicClient := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme(), dynamicObjs...)
	resourceResolver := unstruct.NewResourceResolver(dynamicClient, crdRegistry)

	return claim.NewClaimService(
		&fakeXRDClient{list: xrdList},
		nil, // crdClient: unused by Service's methods
		crdRegistry,
		nil, // discoveryClient: unused by Service's methods
		dynamicClient,
		nil, // xK8sProviderClient: not exercised by List/Get
		resourceResolver,
	)
}

func TestService_List(t *testing.T) {
	xrd := widgetClaimXRD()
	xrdList := &v1.CompositeResourceDefinitionList{Items: []v1.CompositeResourceDefinition{xrd}}

	t.Run("nil opts returns the unfiltered list without panicking", func(t *testing.T) {
		svc := newClaimService(t, xrdList, newWidgetClaim("team-a", "w1"), newWidgetClaim("team-a", "w2"))

		res, err := svc.List(context.Background(), nil)
		require.NoError(t, err)
		assert.Len(t, res, 2)
	})

	t.Run("non-nil opts with matching Kinds filter includes the resources", func(t *testing.T) {
		svc := newClaimService(t, xrdList, newWidgetClaim("team-a", "w1"))

		res, err := svc.List(context.Background(), &claim.ListOpt{Kinds: []string{"WidgetClaim"}})
		require.NoError(t, err)
		assert.Len(t, res, 1)
	})

	t.Run("non-nil opts with non-matching Kinds filter excludes the XRD", func(t *testing.T) {
		svc := newClaimService(t, xrdList, newWidgetClaim("team-a", "w1"))

		res, err := svc.List(context.Background(), &claim.ListOpt{Kinds: []string{"SomethingElse"}})
		require.NoError(t, err)
		assert.Empty(t, res)
	})

	t.Run("HideManagedFields clears managed fields from the results", func(t *testing.T) {
		widget := newWidgetClaim("team-a", "w1")
		widget.SetManagedFields([]metav1.ManagedFieldsEntry{{Manager: "kubectl"}})
		svc := newClaimService(t, xrdList, widget)

		res, err := svc.List(context.Background(), &claim.ListOpt{HideManagedFields: true})
		require.NoError(t, err)
		require.Len(t, res, 1)
		assert.Empty(t, res[0].GetManagedFields())
	})
}

func TestService_Get(t *testing.T) {
	xrd := widgetClaimXRD()
	xrdList := &v1.CompositeResourceDefinitionList{Items: []v1.CompositeResourceDefinition{xrd}}

	svc := newClaimService(t, xrdList, newWidgetClaim("team-a", "w1"))

	got, err := svc.Get(context.Background(), &unstruct.ResourceRef{
		APIVersion: "example.org/v1",
		Kind:       "WidgetClaim",
		Namespace:  "team-a",
		Name:       "w1",
	})
	require.NoError(t, err)
	assert.Equal(t, "w1", got.GetName())
	assert.Equal(t, "team-a", got.GetNamespace())
}
