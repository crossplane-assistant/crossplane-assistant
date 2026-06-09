package compositionrevision

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewHandler(compositionService *Service) *Handler {
	return &Handler{
		compositionRevisionService: compositionService,
	}
}

type Handler struct {
	compositionRevisionService *Service
}

// ListCompositionRevisions is a Rest API handler to list all the composition revisions
func (h *Handler) ListCompositionRevisions(c *gin.Context) {

	ctx := c.Request.Context()

	compositions, err := h.compositionRevisionService.List(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, compositions.Items)
}

// GetCompositionRevision is a Rest API handler to get a composition revision by its name
func (h *Handler) GetCompositionRevision(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")

	composition, err := h.compositionRevisionService.Get(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}
