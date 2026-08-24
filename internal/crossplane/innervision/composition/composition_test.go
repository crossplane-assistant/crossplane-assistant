package composition_test

import (
	"context"
	"errors"
	"testing"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/client/apiextentions/v1/mocks"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestService_List(t *testing.T) {
	t.Run("stamps APIVersion and Kind on every item", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().List(mock.Anything, mock.Anything).Return(&v1.CompositionList{
			Items: []v1.Composition{
				{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}},
				{ObjectMeta: metav1.ObjectMeta{Name: "comp-2"}},
			},
		}, nil)

		svc := composition.NewService(client)
		res, err := svc.List(context.Background())

		require.NoError(t, err)
		require.Len(t, res.Items, 2)
		for _, item := range res.Items {
			assert.Equal(t, "apiextensions.crossplane.io/v1", item.APIVersion)
			assert.Equal(t, "Composition", item.Kind)
		}
	})

	t.Run("propagates a client error unchanged", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().List(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		svc := composition.NewService(client)
		_, err := svc.List(context.Background())

		assert.EqualError(t, err, "boom")
	})
}

func TestService_Get(t *testing.T) {
	t.Run("stamps APIVersion and Kind", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Get(mock.Anything, "comp-1", mock.Anything).Return(&v1.Composition{
			ObjectMeta: metav1.ObjectMeta{Name: "comp-1"},
		}, nil)

		svc := composition.NewService(client)
		res, err := svc.Get(context.Background(), "comp-1")

		require.NoError(t, err)
		assert.Equal(t, "apiextensions.crossplane.io/v1", res.APIVersion)
		assert.Equal(t, "Composition", res.Kind)
	})

	t.Run("propagates a client error unchanged", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Get(mock.Anything, "missing", mock.Anything).Return(nil, errors.New("not found"))

		svc := composition.NewService(client)
		_, err := svc.Get(context.Background(), "missing")

		assert.EqualError(t, err, "not found")
	})
}

func TestService_GetDependencies(t *testing.T) {
	t.Run("successfully analyses the composition's patches", func(t *testing.T) {
		name := "res-1"
		fromPath := "status.atProvider.id"
		toPath := "spec.forProvider.id"
		comp := &v1.Composition{
			ObjectMeta: metav1.ObjectMeta{Name: "comp-1"},
			Spec: v1.CompositionSpec{
				Resources: []v1.ComposedTemplate{
					{
						Name: &name,
						Patches: []v1.Patch{
							{
								Type:          v1.PatchTypeToCompositeFieldPath,
								FromFieldPath: &fromPath,
								ToFieldPath:   &toPath,
							},
						},
					},
				},
			},
		}

		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Get(mock.Anything, "comp-1", mock.Anything).Return(comp, nil)

		svc := composition.NewService(client)
		graph, err := svc.GetDependencies(context.Background(), "comp-1")

		require.NoError(t, err)
		require.NotNil(t, graph)
		assert.Len(t, graph.Resources, 1)
	})

	// dependency.Analyser.Load and GetResourceGraph currently have no reachable
	// error path (patch-indexing failures are only logged, never returned) -
	// so the only error GetDependencies can actually propagate today is one
	// from the composition client itself.
	t.Run("propagates a client error unchanged, with no partial graph", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Get(mock.Anything, "missing", mock.Anything).Return(nil, errors.New("not found"))

		svc := composition.NewService(client)
		graph, err := svc.GetDependencies(context.Background(), "missing")

		assert.EqualError(t, err, "not found")
		assert.Nil(t, graph)
	})
}

func TestService_Create(t *testing.T) {
	client := mocks.NewCompositionInterface(t)
	in := &v1.Composition{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}
	client.EXPECT().Create(mock.Anything, in, mock.Anything).Return(in, nil)

	svc := composition.NewService(client)
	res, err := svc.Create(context.Background(), in)

	require.NoError(t, err)
	assert.Equal(t, "comp-1", res.Name)
}

func TestService_Update(t *testing.T) {
	client := mocks.NewCompositionInterface(t)
	in := &v1.Composition{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}
	client.EXPECT().Update(mock.Anything, in, mock.Anything).Return(in, nil)

	svc := composition.NewService(client)
	res, err := svc.Update(context.Background(), in)

	require.NoError(t, err)
	assert.Equal(t, "comp-1", res.Name)
}

func TestService_Delete(t *testing.T) {
	t.Run("delegates to the client", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Delete(mock.Anything, "comp-1", mock.Anything).Return(nil)

		svc := composition.NewService(client)
		err := svc.Delete(context.Background(), "comp-1")

		assert.NoError(t, err)
	})

	t.Run("propagates a client error unchanged", func(t *testing.T) {
		client := mocks.NewCompositionInterface(t)
		client.EXPECT().Delete(mock.Anything, "comp-1", mock.Anything).Return(errors.New("boom"))

		svc := composition.NewService(client)
		err := svc.Delete(context.Background(), "comp-1")

		assert.EqualError(t, err, "boom")
	})
}
