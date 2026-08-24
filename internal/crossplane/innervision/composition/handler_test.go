package composition_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/gin-gonic/gin"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition/dependency"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func newHandlerTestContext(method, body, name string) (*gin.Context, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(method, "/", strings.NewReader(body))
	if name != "" {
		c.Params = gin.Params{{Key: "name", Value: name}}
	}
	return c, rec
}

func TestHandler_List(t *testing.T) {
	t.Run("returns the composition items", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().List(mock.Anything).Return(&v1.CompositionList{
			Items: []v1.Composition{{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}},
		}, nil)

		h := composition.NewHandler(m)
		c, rec := newHandlerTestContext(http.MethodGet, "", "")
		h.List(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "comp-1")
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().List(mock.Anything).Return(nil, errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodGet, "", "")
		h.List(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Get(t *testing.T) {
	t.Run("returns the composition", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Get(mock.Anything, "comp-1").Return(&v1.Composition{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}, nil)

		h := composition.NewHandler(m)
		c, rec := newHandlerTestContext(http.MethodGet, "", "comp-1")
		h.Get(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "comp-1")
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Get(mock.Anything, "missing").Return(nil, errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodGet, "", "missing")
		h.Get(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_GetDependencies(t *testing.T) {
	t.Run("returns the dependency graph", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().GetDependencies(mock.Anything, "comp-1").Return(&dependency.ResourceGraph{}, nil)

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodGet, "", "comp-1")
		h.GetDependencies(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().GetDependencies(mock.Anything, "comp-1").Return(nil, errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodGet, "", "comp-1")
		h.GetDependencies(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Create(t *testing.T) {
	t.Run("delegates to the service", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Create(mock.Anything, mock.Anything).Return(&v1.Composition{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}, nil)

		h := composition.NewHandler(m)
		c, rec := newHandlerTestContext(http.MethodPost, "apiVersion: apiextensions.crossplane.io/v1\nkind: Composition\n", "")
		h.Create(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "comp-1")
	})

	t.Run("invalid YAML body maps to 400", func(t *testing.T) {
		m := mocks.NewCompositionService(t)

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodPost, "not: [valid: yaml", "")
		h.Create(c)

		assert.Equal(t, http.StatusBadRequest, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Create(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodPost, "apiVersion: apiextensions.crossplane.io/v1\nkind: Composition\n", "")
		h.Create(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Update(t *testing.T) {
	t.Run("delegates to the service", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Update(mock.Anything, mock.Anything).Return(&v1.Composition{ObjectMeta: metav1.ObjectMeta{Name: "comp-1"}}, nil)

		h := composition.NewHandler(m)
		c, rec := newHandlerTestContext(http.MethodPut, "apiVersion: apiextensions.crossplane.io/v1\nkind: Composition\n", "comp-1")
		h.Update(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "comp-1")
	})

	t.Run("invalid YAML body maps to 400", func(t *testing.T) {
		m := mocks.NewCompositionService(t)

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodPut, "not: [valid: yaml", "comp-1")
		h.Update(c)

		assert.Equal(t, http.StatusBadRequest, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Update(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodPut, "apiVersion: apiextensions.crossplane.io/v1\nkind: Composition\n", "comp-1")
		h.Update(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Delete(t *testing.T) {
	t.Run("delegates to the service and returns 202", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Delete(mock.Anything, "comp-1").Return(nil)

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodDelete, "", "comp-1")
		h.Delete(c)

		assert.Equal(t, http.StatusAccepted, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewCompositionService(t)
		m.EXPECT().Delete(mock.Anything, "comp-1").Return(errors.New("boom"))

		h := composition.NewHandler(m)
		c, _ := newHandlerTestContext(http.MethodDelete, "", "comp-1")
		h.Delete(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}
