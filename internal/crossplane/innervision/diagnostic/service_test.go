package diagnostic

import (
	"context"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"

	xpv1common "github.com/crossplane/crossplane-runtime/apis/common/v1"
	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1/mocks"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	claimmocks "github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim/mocks"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/event"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	extv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsfake "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	kubernetesfake "k8s.io/client-go/kubernetes/fake"
)

func TestFilterLogLines(t *testing.T) {
	s := &Service{}

	logBlock := `2026-06-14T10:00:00Z INFO reconciling Instance/my-db-instance
2026-06-14T10:00:01Z ERROR cannot create DB: AccessDenied for my-db-instance
2026-06-14T10:00:02Z INFO reconciling Instance/another-db-instance
2026-06-14T10:00:03Z ERROR uid:12345-67890 connection timeout`

	t.Run("filter by name", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "my-db-instance", "")
		assert.Len(t, lines, 2)
		assert.Contains(t, lines[0], "my-db-instance")
		assert.Contains(t, lines[1], "my-db-instance")
	})

	t.Run("filter by uid", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "non-existent", "12345-67890")
		assert.Len(t, lines, 1)
		assert.Contains(t, lines[0], "12345-67890")
	})

	t.Run("filter with no match", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "missing-resource", "none")
		assert.Empty(t, lines)
	})
}

func TestIsNodeHealthy(t *testing.T) {
	s := &Service{}

	t.Run("empty conditions", func(t *testing.T) {
		if !s.IsNodeHealthy(nil) {
			t.Errorf("empty conditions should be considered healthy")
		}
	})

	t.Run("all critical conditions true", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "Ready", Status: "True"},
			{Type: "Synced", Status: "True"},
		}
		if !s.IsNodeHealthy(conditions) {
			t.Errorf("all true critical conditions should be healthy")
		}
	})

	t.Run("one critical condition false", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "Ready", Status: "False"},
			{Type: "Synced", Status: "True"},
		}
		if s.IsNodeHealthy(conditions) {
			t.Errorf("any false critical condition should be unhealthy")
		}
	})

	t.Run("no critical conditions present", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "CustomCondition", Status: "True"},
		}
		if !s.IsNodeHealthy(conditions) {
			t.Errorf("no critical conditions should default to healthy")
		}
	})
}

func widgetDiagnosticCRD() *extv1.CustomResourceDefinition {
	return &extv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{Name: "widgets.example.org"},
		Spec: extv1.CustomResourceDefinitionSpec{
			Group: "example.org",
			Names: extv1.CustomResourceDefinitionNames{Kind: "Widget", Plural: "widgets"},
			Versions: []extv1.CustomResourceDefinitionVersion{
				{Name: "v1"},
			},
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

func TestFindProviderRevisionForMR(t *testing.T) {
	t.Run("CRD found and active revision found", func(t *testing.T) {
		crdRegistry := newFakeCRDRegistry(t, widgetDiagnosticCRD())

		prMock := mocks.NewProviderRevisionInterface(t)
		prMock.EXPECT().List(mock.Anything, mock.Anything).Return(&xpapiv1.ProviderRevisionList{
			Items: []xpapiv1.ProviderRevision{
				{
					ObjectMeta: metav1.ObjectMeta{Name: "provider-example-abcdef"},
					Spec: xpapiv1.ProviderRevisionSpec{
						PackageRevisionSpec: xpapiv1.PackageRevisionSpec{DesiredState: xpapiv1.PackageRevisionActive},
					},
					Status: xpapiv1.PackageRevisionStatus{
						ObjectRefs: []xpv1common.TypedReference{
							{Kind: "CustomResourceDefinition", Name: "widgets.example.org"},
						},
					},
				},
			},
		}, nil)
		prMock.EXPECT().Watch(mock.Anything, mock.Anything).Return(watch.NewFake(), nil)
		prRegistry := providerrevision.NewRegistry(prMock)
		time.Sleep(10 * time.Millisecond)

		svc := &Service{crdRegistry: crdRegistry, prRegistry: prRegistry}
		name, err := svc.FindProviderRevisionForMR("example.org/v1", "Widget")
		require.NoError(t, err)
		assert.Equal(t, "provider-example-abcdef", name)
	})

	t.Run("CRD not found returns an error without looking up a revision", func(t *testing.T) {
		crdRegistry := newFakeCRDRegistry(t) // no CRDs registered

		// prRegistry is left nil - FindProviderRevisionForMR must return before ever
		// dereferencing it when the CRD lookup fails.
		svc := &Service{crdRegistry: crdRegistry}
		_, err := svc.FindProviderRevisionForMR("example.org/v1", "Widget")
		assert.Error(t, err)
	})

	t.Run("CRD found but no matching active revision", func(t *testing.T) {
		crdRegistry := newFakeCRDRegistry(t, widgetDiagnosticCRD())

		prMock := mocks.NewProviderRevisionInterface(t)
		prMock.EXPECT().List(mock.Anything, mock.Anything).Return(&xpapiv1.ProviderRevisionList{
			Items: []xpapiv1.ProviderRevision{
				{
					ObjectMeta: metav1.ObjectMeta{Name: "provider-other-abcdef"},
					Spec: xpapiv1.ProviderRevisionSpec{
						PackageRevisionSpec: xpapiv1.PackageRevisionSpec{DesiredState: xpapiv1.PackageRevisionActive},
					},
					Status: xpapiv1.PackageRevisionStatus{
						ObjectRefs: []xpv1common.TypedReference{
							{Kind: "CustomResourceDefinition", Name: "unrelated.example.org"},
						},
					},
				},
			},
		}, nil)
		prMock.EXPECT().Watch(mock.Anything, mock.Anything).Return(watch.NewFake(), nil)
		prRegistry := providerrevision.NewRegistry(prMock)
		time.Sleep(10 * time.Millisecond)

		svc := &Service{crdRegistry: crdRegistry, prRegistry: prRegistry}
		_, err := svc.FindProviderRevisionForMR("example.org/v1", "Widget")
		assert.Error(t, err)
	})
}

func TestGetClaimDiagnostics(t *testing.T) {
	t1 := metav1.NewTime(time.Date(2026, 6, 14, 10, 0, 0, 0, time.UTC))
	t2 := metav1.NewTime(time.Date(2026, 6, 14, 10, 2, 0, 0, time.UTC)) // latest
	t3 := metav1.NewTime(time.Date(2026, 6, 14, 10, 1, 0, 0, time.UTC))

	tree := &claim.Tree{
		Root: &claim.Node{
			Kind: "WidgetClaim", Version: "example.org/v1", Name: "w1", Namespace: "ns-root",
			MetaKind:   "XRC",
			Conditions: []claim.Condition{{Type: "Ready", Status: "True"}},
			Children: []*claim.Node{
				{
					Kind: "Widget", Version: "example.org/v1", Name: "widget-1", Namespace: "ns-xr",
					MetaKind:   "XR",
					Conditions: []claim.Condition{{Type: "Ready", Status: "True"}, {Type: "Synced", Status: "True"}},
					Children: []*claim.Node{
						{
							Kind: "ConfigMap", Version: "v1", Name: "cm-1", Namespace: "ns-cm",
							MetaKind:   "Resource",
							Conditions: []claim.Condition{{Type: "Ready", Status: "False"}},
						},
					},
				},
			},
		},
	}

	claimSvc := claimmocks.NewClaimService(t)
	claimSvc.EXPECT().GetResourcesTree(mock.Anything, mock.Anything).Return(tree, nil)

	fakeClientSet := kubernetesfake.NewSimpleClientset(
		&corev1.Event{
			ObjectMeta:     metav1.ObjectMeta{Name: "ev-root", Namespace: "ns-root"},
			InvolvedObject: corev1.ObjectReference{Kind: "WidgetClaim", Name: "w1"},
			Message:        "root event",
			LastTimestamp:  t1,
		},
		&corev1.Event{
			ObjectMeta:     metav1.ObjectMeta{Name: "ev-xr", Namespace: "ns-xr"},
			InvolvedObject: corev1.ObjectReference{Kind: "Widget", Name: "widget-1"},
			Message:        "xr event (latest)",
			LastTimestamp:  t2,
		},
		&corev1.Event{
			ObjectMeta:     metav1.ObjectMeta{Name: "ev-cm", Namespace: "ns-cm"},
			InvolvedObject: corev1.ObjectReference{Kind: "ConfigMap", Name: "cm-1"},
			Message:        "cm event",
			LastTimestamp:  t3,
		},
	)

	svc := &Service{
		clientSet:    fakeClientSet,
		claimService: claimSvc,
		eventService: event.NewService(fakeClientSet),
		crdRegistry:  newFakeCRDRegistry(t), // empty: no CRD matches the ConfigMap resource node
	}

	resp, err := svc.GetClaimDiagnostics(context.Background(), &unstruct.ResourceRef{
		APIVersion: "example.org/v1", Kind: "WidgetClaim", Namespace: "ns-root", Name: "w1",
	})
	require.NoError(t, err)
	require.NotNil(t, resp)

	t.Run("every node's events are aggregated", func(t *testing.T) {
		require.Len(t, resp.Events, 3)
		messages := []string{resp.Events[0].Message, resp.Events[1].Message, resp.Events[2].Message}
		assert.ElementsMatch(t, []string{"root event", "xr event (latest)", "cm event"}, messages)
	})

	t.Run("events are sorted newest-first", func(t *testing.T) {
		require.Len(t, resp.Events, 3)
		assert.Equal(t, "xr event (latest)", resp.Events[0].Message) // t2, newest
		assert.Equal(t, "cm event", resp.Events[1].Message)          // t3
		assert.Equal(t, "root event", resp.Events[2].Message)        // t1, oldest
	})

	t.Run("each node's Status reflects IsNodeHealthy", func(t *testing.T) {
		require.NotNil(t, resp.Tree)
		root := resp.Tree.Root
		require.NotNil(t, root)
		assert.Equal(t, "Ready", root.Status)

		require.Len(t, root.Children, 1)
		xr := root.Children[0]
		assert.Equal(t, "Ready", xr.Status)

		require.Len(t, xr.Children, 1)
		resourceNode := xr.Children[0]
		assert.Equal(t, "Unready", resourceNode.Status)
	})
}
