package telemetry

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	telemetryService *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		telemetryService: service,
	}
}

func (h *Handler) GetAverageReadyDuration(c *gin.Context) {
	ctx := c.Request.Context()

	apiVersion := c.Query("apiVersion")
	kind := c.Query("kind")

	if apiVersion == "" || kind == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing apiVersion or kind query parameters"})
		return
	}

	response, err := h.telemetryService.GetAverageReadyDuration(ctx, apiVersion, kind)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
