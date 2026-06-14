package managedresource

import (
	"context"
	"testing"
	"time"

	xpv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	xpv1common "github.com/crossplane/crossplane-runtime/apis/common/v1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/stretchr/testify/assert"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	apiextensionsfake "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
)

type mockProviderRevisionInterface struct {
	listResult *xpv1.ProviderRevisionList
}

func (m *mockProviderRevisionInterface) Get(ctx context.Context, name string, options metav1.GetOptions) (*xpv1.ProviderRevision, error) {
	return nil, nil
}
func (m *mockProviderRevisionInterface) List(ctx context.Context, opts metav1.ListOptions) (*xpv1.ProviderRevisionList, error) {
	return m.listResult, nil
}
func (m *mockProviderRevisionInterface) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	return watch.NewFake(), nil
}
func (m *mockProviderRevisionInterface) Create(ctx context.Context, node *xpv1.ProviderRevision, opts metav1.CreateOptions) (*xpv1.ProviderRevision, error) {
	return nil, nil
}
func (m *mockProviderRevisionInterface) Update(ctx context.Context, node *xpv1.ProviderRevision, opts metav1.UpdateOptions) (*xpv1.ProviderRevision, error) {
	return nil, nil
}
func (m *mockProviderRevisionInterface) UpdateStatus(ctx context.Context, node *xpv1.ProviderRevision, opts metav1.UpdateOptions) (*xpv1.ProviderRevision, error) {
	return nil, nil
}
func (m *mockProviderRevisionInterface) Delete(ctx context.Context, name string, opts metav1.DeleteOptions) error {
	return nil
}
func (m *mockProviderRevisionInterface) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	return nil
}

func TestListKind(t *testing.T) {
	// 1. Setup Mock ProviderRevision
	prList := &xpv1.ProviderRevisionList{
		Items: []xpv1.ProviderRevision{
			{
				ObjectMeta: metav1.ObjectMeta{
					Name: "provider-gcp-pubsub-744b85af1c13",
					Labels: map[string]string{
						"pkg.crossplane.io/package": "provider-gcp-pubsub",
					},
				},
				Spec: xpv1.ProviderRevisionSpec{
					PackageRevisionSpec: xpv1.PackageRevisionSpec{
						DesiredState: xpv1.PackageRevisionActive,
					},
				},
				Status: xpv1.PackageRevisionStatus{
					ObjectRefs: []xpv1common.TypedReference{
						{
							APIVersion: "apiextensions.crossplane.io/v1alpha1",
							Kind:       "ManagedResourceDefinition",
							Name:       "topics.pubsub.gcp.m.upbound.io",
						},
						{
							APIVersion: "apiextensions.k8s.io/v1",
							Kind:       "CustomResourceDefinition",
							Name:       "clusterproviderconfigs.gcp.m.upbound.io",
						},
						{
							APIVersion: "apiextensions.crossplane.io/v1alpha1",
							Kind:       "ManagedResourceDefinition",
							Name:       "missing.pubsub.gcp.m.upbound.io", // To test nil-pointer safety (this CRD won't exist in registry)
						},
					},
				},
			},
		},
	}

	mockPrItf := &mockProviderRevisionInterface{listResult: prList}
	prRegistry := providerrevision.NewRegistry(mockPrItf)

	// 2. Setup Mock CRDRegistry with fake client
	crdTopic := &v1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "topics.pubsub.gcp.m.upbound.io",
		},
		Spec: v1.CustomResourceDefinitionSpec{
			Group: "pubsub.gcp.m.upbound.io",
			Names: v1.CustomResourceDefinitionNames{
				Kind:   "Topic",
				Plural: "topics",
			},
			Versions: []v1.CustomResourceDefinitionVersion{
				{
					Name: "v1beta1",
				},
			},
		},
	}

	crdClusterConfig := &v1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "clusterproviderconfigs.gcp.m.upbound.io",
		},
		Spec: v1.CustomResourceDefinitionSpec{
			Group: "gcp.m.upbound.io",
			Names: v1.CustomResourceDefinitionNames{
				Kind:   "ClusterProviderConfig",
				Plural: "clusterproviderconfigs",
			},
			Versions: []v1.CustomResourceDefinitionVersion{
				{
					Name: "v1beta1",
				},
			},
		},
	}

	fakeExtensions := apiextensionsfake.NewSimpleClientset(crdTopic, crdClusterConfig)
	crdClient := fakeExtensions.ApiextensionsV1().CustomResourceDefinitions()
	crdRegistry := resource.NewCRDRegistry(crdClient)

	// Give cache informers a tiny moment to sync
	time.Sleep(10 * time.Millisecond)

	// Create service
	svc := NewService(nil, prRegistry, crdRegistry)

	// Invoke ListKind
	kinds, err := svc.ListKind(context.Background())
	assert.NoError(t, err)

	// Verify results
	// - Topic (ManagedResourceDefinition) MUST be found
	// - ClusterProviderConfig MUST be excluded
	// - missing.pubsub.gcp.m.upbound.io (nil CRD) MUST be skipped gracefully
	assert.Len(t, kinds, 1)
	assert.Equal(t, "Topic", kinds[0].Kind)
	assert.Equal(t, "pubsub.gcp.m.upbound.io", kinds[0].Group)
	assert.Equal(t, "v1beta1", kinds[0].Version)
	assert.Equal(t, "provider-gcp-pubsub", kinds[0].Provider)
	assert.Equal(t, "topics.pubsub.gcp.m.upbound.io", kinds[0].Resource)
}
