package xrd

import (
	"io"
	"net/http"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/gin-gonic/gin"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"
)

func NewHandler(xrdService *Service) *Handler {
	return &Handler{
		xrdService: xrdService,
	}
}

type Handler struct {
	xrdService *Service
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()

	compositions, err := h.xrdService.List(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, compositions.Items)
}

func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()

	id := c.Param("id")

	composition, err := h.xrdService.Get(ctx, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()

	var xrd v1.CompositeResourceDefinition

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &xrd); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.xrdService.Create(ctx, &xrd)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var xrd v1.CompositeResourceDefinition

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &xrd); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.xrdService.Update(ctx, &xrd)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")
	err := h.xrdService.Delete(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
