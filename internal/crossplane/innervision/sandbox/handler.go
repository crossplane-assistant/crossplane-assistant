package sandbox

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

type RenderRequest struct {
	Claim       string `json:"claim"`
	Composition string `json:"composition"`
}

func (h *Handler) Render(c *gin.Context) {
	var req RenderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Claim == "" || req.Composition == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "claim and composition are required"})
		return
	}

	res := h.service.Render(c.Request.Context(), req.Claim, req.Composition)
	
	// We return 200 even if there's an error from the render command, so the frontend can display it in the sandbox
	c.JSON(http.StatusOK, res)
}
