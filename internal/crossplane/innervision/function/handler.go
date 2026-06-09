package function

import (
	"io"
	"net/http"

	xpapiv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"

	"github.com/gin-gonic/gin"
)

func NewHandler(functionService FunctionsService) *Handler {
	return &Handler{
		functionService: functionService,
	}
}

type Handler struct {
	functionService FunctionsService
}

func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()
	providers, err := h.functionService.List(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, providers.Items)
}

// GetFunction provide the composition by name
func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()
	name := c.Param("name")

	composition, err := h.functionService.Get(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()
	var fnc xpapiv1.Function
	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &fnc); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	res, err := h.functionService.Create(ctx, &fnc)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var fnc xpapiv1.Function

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &fnc); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	res, err := h.functionService.Update(ctx, &fnc)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	name := c.Param("name")
	err := h.functionService.Delete(ctx, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
