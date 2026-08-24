package diagnostic_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/diagnostic"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/diagnostic/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func newTestContext(ref string) (*gin.Context, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	c.Params = gin.Params{{Key: "ref", Value: ref}}
	return c, rec
}

func TestHandler_GetClaimDiagnostics(t *testing.T) {
	t.Run("returns the diagnostics response", func(t *testing.T) {
		m := mocks.NewDiagnosticService(t)
		m.EXPECT().GetClaimDiagnostics(mock.Anything, mock.Anything).Return(&diagnostic.DiagnosticResponse{
			Tree: &diagnostic.DiagnosticTree{Root: &diagnostic.DiagnosticNode{Name: "w1"}},
		}, nil)

		h := diagnostic.NewHandler(m)
		c, rec := newTestContext("example.org/v1:WidgetClaim:w1:team-a")
		h.GetClaimDiagnostics(c)

		assert.Equal(t, http.StatusOK, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "w1")
	})

	t.Run("maps a service error to 500", func(t *testing.T) {
		m := mocks.NewDiagnosticService(t)
		m.EXPECT().GetClaimDiagnostics(mock.Anything, mock.Anything).Return(nil, errors.New("boom"))

		h := diagnostic.NewHandler(m)
		c, rec := newTestContext("example.org/v1:WidgetClaim:w1:team-a")
		h.GetClaimDiagnostics(c)

		assert.Equal(t, http.StatusInternalServerError, c.Writer.Status())
		assert.Contains(t, rec.Body.String(), "boom")
	})
}
