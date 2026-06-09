package providerrevision

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewHandler(providerRevisionService ProviderRevisionService) *Handler {
	return &Handler{
		providerRevisionService: providerRevisionService,
	}
}

type Handler struct {
	providerRevisionService ProviderRevisionService
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()
	providers, err := h.providerRevisionService.List(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, providers.Items)
}

// Get provide the composition by name
func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()
	name := c.Param("name")

	composition, err := h.providerRevisionService.Get(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

// ListByProvider provider revision by name
func (h *Handler) ListByProvider(c *gin.Context) {

	ctx := c.Request.Context()
	provider := c.Param("name")

	revisions, err := h.providerRevisionService.ListByProvider(ctx, provider)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, revisions)
}
