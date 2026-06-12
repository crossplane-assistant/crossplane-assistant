package schema

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetSchema handles requests for OpenAPI v3 validation schemas
func (h *Handler) GetSchema(c *gin.Context) {
	group := c.Query("group")
	version := c.Query("version")
	kind := c.Query("kind")

	if version == "" || kind == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "version and kind query parameters are required"})
		return
	}

	schema, err := h.service.GetSchema(c.Request.Context(), group, version, kind)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schema)
}
