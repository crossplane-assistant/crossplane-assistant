package managedresource

import (
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/rs/zerolog/log"
	"io"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewHandler(managedResourceService ManagedResourceService) *Handler {
	return &Handler{
		managedResourceService: managedResourceService,
	}
}

type Handler struct {
	managedResourceService ManagedResourceService
}

func (h *Handler) ListKind(c *gin.Context) {

	ctx := c.Request.Context()

	kinds, err := h.managedResourceService.ListKind(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, kinds)
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()

	strRef := c.Param("ref")
	gvk, err := unstruct.UnmarshallGVK(strRef)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	providers, err := h.managedResourceService.List(ctx, *gvk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, providers.Items)
}

// Get provide the managed resource
func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()
	strRef := c.Param("ref")
	gvk, name, err := unstruct.UnmarshallGVKN(strRef)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.managedResourceService.Get(ctx, *gvk, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()
	yamlData, err := io.ReadAll(c.Request.Body)
	mr := unstructured.Unstructured{}

	if err := yaml2.Unmarshal(yamlData, &mr); err != nil {
		log.Err(err).Msg("failed to unmarshal managed resource yaml")
		c.JSON(http.StatusBadRequest, err)
		return
	}

	res, err := h.managedResourceService.Create(ctx, &mr)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var mr unstructured.Unstructured

	yamlData, err := io.ReadAll(c.Request.Body)
	if err := yaml2.Unmarshal(yamlData, &mr); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	res, err := h.managedResourceService.Update(ctx, &mr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")
	strRef := c.Param("ref")
	gvk, err := unstruct.UnmarshallGVK(strRef)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	if err := h.managedResourceService.Delete(ctx, *gvk, name); err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
