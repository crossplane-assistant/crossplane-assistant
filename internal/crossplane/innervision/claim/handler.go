package claim

import (
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"io"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewHandler(claimService *Service) *Handler {
	return &Handler{
		claimService: claimService,
	}
}

type Handler struct {
	claimService *Service
}

// Get give a claim by its reference
func (h *Handler) Get(c *gin.Context) {

	ctx := c.Request.Context()

	strRef := c.Param("ref")
	ref := unstruct.UnserializeResourceRef(strRef)

	claim, err := h.claimService.Get(ctx, ref)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, claim)

}

// List the claims present in the cluster
func (h *Handler) List(c *gin.Context) {

	ctx := c.Request.Context()

	opts := &ListOpt{
		Kinds:             c.QueryArray("kind"),
		HideManagedFields: c.DefaultQuery("hideManagedFields", "false") == "true",
	}

	claims, err := h.claimService.List(ctx, opts)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, claims)

}

func (h *Handler) GetClaimResourcesTree(c *gin.Context) {

	strRef := c.Param("ref")
	ref := unstruct.UnserializeResourceRef(strRef)

	graph, err := h.claimService.GetResourcesTree(c, ref)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, graph)
}

func (h *Handler) Create(c *gin.Context) {

	ctx := c.Request.Context()

	var comp unstructured.Unstructured

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &comp); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.claimService.Create(ctx, &comp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Update(c *gin.Context) {

	ctx := c.Request.Context()

	var comp unstructured.Unstructured

	yamlData, err := io.ReadAll(c.Request.Body)

	if err := yaml2.Unmarshal(yamlData, &comp); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	composition, err := h.claimService.Update(ctx, &comp)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, composition)
}

func (h *Handler) Delete(c *gin.Context) {

	ctx := c.Request.Context()

	strRef := c.Param("ref")
	ref := unstruct.UnserializeResourceRef(strRef)

	err := h.claimService.Delete(ctx, ref)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusAccepted)
}
