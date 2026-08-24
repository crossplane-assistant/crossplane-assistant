package diagnostic

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
)

type Handler struct {
	service DiagnosticService
}

func NewHandler(service DiagnosticService) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) GetClaimDiagnostics(c *gin.Context) {
	strRef := c.Param("ref")
	ref := unstruct.UnserializeResourceRef(strRef)

	resp, err := h.service.GetClaimDiagnostics(c.Request.Context(), ref)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
