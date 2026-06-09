package provider

import (
	"io"
	"net/http"

	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"

	"github.com/gin-gonic/gin"
)

func NewHandler(providerService ProviderService) *Handler {
	return &Handler{
		providerService: providerService,
	}
}

type Handler struct {
	providerService ProviderService
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()
	providers, err := h.providerService.List(ctx)

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

	composition, err := h.providerService.Get(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()
	var comp xpapiv1.Provider
	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &comp); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	provider, err := h.providerService.Create(ctx, &comp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, provider)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var provider xpapiv1.Provider

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &provider); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	res, err := h.providerService.Update(ctx, &provider)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")
	err := h.providerService.Delete(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
