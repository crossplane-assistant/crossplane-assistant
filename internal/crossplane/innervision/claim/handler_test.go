package claim_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/crossplane/crossplane-runtime/pkg/resource/unstructured/claim"
	"github.com/gin-gonic/gin"
	innerclaim "github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func newTestContext(method, body string, ref string) (*gin.Context, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(method, "/", strings.NewReader(body))
	if ref != "" {
		c.Params = gin.Params{{Key: "ref", Value: ref}}
	}
	return c, rec
}

func newNamedUnstructured(name string) *unstructured.Unstructured {
	u := &unstructured.Unstructured{}
	u.SetName(name)
	return u
}

func TestHandler_Get(t *testing.T) {
	t.Run("delegates to the service and returns the claim", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		want := &claim.Unstructured{Unstructured: *newNamedUnstructured("my-pod")}
		m.EXPECT().Get(mock.Anything, mock.Anything).Return(want, nil)

		h := innerclaim.NewHandler(m)
		c, rec := newTestContext(http.MethodGet, "", "v1:Pod:my-pod:default")
		h.Get(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "my-pod")
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Get(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodGet, "", "v1:Pod:my-pod:default")
		h.Get(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Create(t *testing.T) {
	t.Run("delegates to the service and returns the created resource", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Create(mock.Anything, mock.Anything).Return(newNamedUnstructured("created-pod"), nil)

		h := innerclaim.NewHandler(m)
		c, rec := newTestContext(http.MethodPost, "apiVersion: v1\nkind: Pod\n", "")
		h.Create(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "created-pod")
	})

	t.Run("invalid YAML body maps to 400", func(t *testing.T) {
		m := mocks.NewClaimService(t)

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodPost, "not: [valid: yaml", "")
		h.Create(c)

		assert.Equal(t, http.StatusBadRequest, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Create(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodPost, "apiVersion: v1\nkind: Pod\n", "")
		h.Create(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Update(t *testing.T) {
	t.Run("delegates to the service and returns the updated resource", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Update(mock.Anything, mock.Anything).Return(newNamedUnstructured("updated-pod"), nil)

		h := innerclaim.NewHandler(m)
		c, rec := newTestContext(http.MethodPut, "apiVersion: v1\nkind: Pod\n", "")
		h.Update(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "updated-pod")
	})

	t.Run("invalid YAML body maps to 400", func(t *testing.T) {
		m := mocks.NewClaimService(t)

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodPut, "not: [valid: yaml", "")
		h.Update(c)

		assert.Equal(t, http.StatusBadRequest, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Update(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodPut, "apiVersion: v1\nkind: Pod\n", "")
		h.Update(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}

func TestHandler_Delete(t *testing.T) {
	t.Run("delegates to the service and returns 202", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Delete(mock.Anything, mock.Anything).Return(nil)

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodDelete, "", "v1:Pod:my-pod:default")
		h.Delete(c)

		assert.Equal(t, http.StatusAccepted, c.Writer.Status())
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewClaimService(t)
		m.EXPECT().Delete(mock.Anything, mock.Anything).Return(errors.New("boom"))

		h := innerclaim.NewHandler(m)
		c, _ := newTestContext(http.MethodDelete, "", "v1:Pod:my-pod:default")
		h.Delete(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
	})
}
