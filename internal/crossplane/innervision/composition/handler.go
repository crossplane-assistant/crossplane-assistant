package composition

import (
	"io"
	"net/http"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"

	"github.com/gin-gonic/gin"
)

func NewHandler(compositionService CompositionService) *Handler {
	return &Handler{
		compositionService: compositionService,
	}
}

type Handler struct {
	compositionService CompositionService
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()

	compositions, err := h.compositionService.List(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, compositions.Items)

}

// GetComposition provide the composition by name
func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")

	composition, err := h.compositionService.Get(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, composition)
}

func (h *Handler) GetDependencies(c *gin.Context) {

	ctx := c.Request.Context()
	name := c.Param("name")

	graph, err := h.compositionService.GetDependencies(ctx, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, graph)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()
	var comp v1.Composition
	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &comp); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.compositionService.Create(ctx, &comp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var comp v1.Composition

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &comp); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.compositionService.Update(ctx, &comp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")
	err := h.compositionService.Delete(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
