package telemetry

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
)

// MockClientResolver is a mock implementation of ClientResolver.
type MockClientResolver struct {
	GetClientFunc func(apiVersion string, kind string) (dynamic.NamespaceableResourceInterface, error)
}

func (m *MockClientResolver) GetClient(apiVersion string, kind string) (dynamic.NamespaceableResourceInterface, error) {
	return m.GetClientFunc(apiVersion, kind)
}

// MockNamespaceableClient is a mock implementation of dynamic.NamespaceableResourceInterface.
type MockNamespaceableClient struct {
	ListFunc func(ctx context.Context, opts metav1.ListOptions) (*unstructured.UnstructuredList, error)
}

func (m *MockNamespaceableClient) List(ctx context.Context, opts metav1.ListOptions) (*unstructured.UnstructuredList, error) {
	return m.ListFunc(ctx, opts)
}

func (m *MockNamespaceableClient) Namespace(ns string) dynamic.ResourceInterface {
	return m
}

func (m *MockNamespaceableClient) Create(ctx context.Context, obj *unstructured.Unstructured, opts metav1.CreateOptions, subresources ...string) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Update(ctx context.Context, obj *unstructured.Unstructured, opts metav1.UpdateOptions, subresources ...string) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) UpdateStatus(ctx context.Context, obj *unstructured.Unstructured, opts metav1.UpdateOptions) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Delete(ctx context.Context, name string, opts metav1.DeleteOptions, subresources ...string) error {
	panic("not implemented")
}

func (m *MockNamespaceableClient) DeleteCollection(ctx context.Context, opts metav1.DeleteOptions, listOpts metav1.ListOptions) error {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Get(ctx context.Context, name string, opts metav1.GetOptions, subresources ...string) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Watch(ctx context.Context, opts metav1.ListOptions) (watch.Interface, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Patch(ctx context.Context, name string, pt types.PatchType, data []byte, opts metav1.PatchOptions, subresources ...string) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) Apply(ctx context.Context, name string, obj *unstructured.Unstructured, opts metav1.ApplyOptions, subresources ...string) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func (m *MockNamespaceableClient) ApplyStatus(ctx context.Context, name string, obj *unstructured.Unstructured, opts metav1.ApplyOptions) (*unstructured.Unstructured, error) {
	panic("not implemented")
}

func createUnstructured(creationStr, readyStr string, isReady bool) unstructured.Unstructured {
	obj := unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "database.aws.upbound.io/v1beta1",
			"kind":       "RDSInstance",
			"metadata": map[string]interface{}{
				"name":              "test-instance",
				"creationTimestamp": creationStr,
			},
		},
	}

	if isReady {
		obj.Object["status"] = map[string]interface{}{
			"conditions": []interface{}{
				map[string]interface{}{
					"type":               "Ready",
					"status":             "True",
					"lastTransitionTime": readyStr,
				},
			},
		}
	} else {
		// Non-ready condition
		obj.Object["status"] = map[string]interface{}{
			"conditions": []interface{}{
				map[string]interface{}{
					"type":               "Ready",
					"status":             "False",
					"lastTransitionTime": readyStr,
				},
			},
		}
	}

	return obj
}

func TestGetAverageReadyDuration(t *testing.T) {
	t.Run("calculates correct average on multiple ready resources and ignores unready", func(t *testing.T) {
		// Obj 1: 120s duration
		obj1 := createUnstructured("2026-06-13T12:00:00Z", "2026-06-13T12:02:00Z", true)
		// Obj 2: 300s duration
		obj2 := createUnstructured("2026-06-13T12:00:00Z", "2026-06-13T12:05:00Z", true)
		// Obj 3: non-ready, should be ignored
		obj3 := createUnstructured("2026-06-13T12:00:00Z", "2026-06-13T12:10:00Z", false)

		mockList := &unstructured.UnstructuredList{
			Items: []unstructured.Unstructured{obj1, obj2, obj3},
		}

		mockClient := &MockNamespaceableClient{
			ListFunc: func(ctx context.Context, opts metav1.ListOptions) (*unstructured.UnstructuredList, error) {
				return mockList, nil
			},
		}

		mockResolver := &MockClientResolver{
			GetClientFunc: func(apiVersion string, kind string) (dynamic.NamespaceableResourceInterface, error) {
				return mockClient, nil
			},
		}

		svc := NewService(mockResolver)
		ctx := context.Background()

		resp, err := svc.GetAverageReadyDuration(ctx, "database.aws.upbound.io/v1beta1", "RDSInstance")

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, "database.aws.upbound.io/v1beta1", resp.APIVersion)
		assert.Equal(t, "RDSInstance", resp.Kind)
		// Average = (120s + 300s) / 2 = 210s
		assert.Equal(t, float64(210), resp.AverageSeconds)
		assert.Equal(t, int64(2), resp.SampleSize)
	})

	t.Run("returns zero average when no resources are ready", func(t *testing.T) {
		obj := createUnstructured("2026-06-13T12:00:00Z", "2026-06-13T12:10:00Z", false)

		mockList := &unstructured.UnstructuredList{
			Items: []unstructured.Unstructured{obj},
		}

		mockClient := &MockNamespaceableClient{
			ListFunc: func(ctx context.Context, opts metav1.ListOptions) (*unstructured.UnstructuredList, error) {
				return mockList, nil
			},
		}

		mockResolver := &MockClientResolver{
			GetClientFunc: func(apiVersion string, kind string) (dynamic.NamespaceableResourceInterface, error) {
				return mockClient, nil
			},
		}

		svc := NewService(mockResolver)
		ctx := context.Background()

		resp, err := svc.GetAverageReadyDuration(ctx, "database.aws.upbound.io/v1beta1", "RDSInstance")

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, float64(0), resp.AverageSeconds)
		assert.Equal(t, int64(0), resp.SampleSize)
	})
}

// Required to satisfy compiling for runtime.Object when using mock structs
func (m *MockNamespaceableClient) GetObjectKind() schema.ObjectKind {
	panic("not implemented")
}

func (m *MockNamespaceableClient) DeepCopyObject() runtime.Object {
	panic("not implemented")
}
