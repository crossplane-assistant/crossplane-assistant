package event

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func NewHandler(eventService *Service) *Handler {
	return &Handler{
		eventService: eventService,
	}
}

type Handler struct {
	eventService *Service
}

func (h *Handler) GetResourcesEvents(c *gin.Context) {

	strRef := c.Param("ref")
	refParts := strings.Split(strRef, ":")

	ref := &ResourceRef{
		APIVersion: refParts[0],
		Kind:       refParts[1],
		Name:       refParts[2],
		Namespace:  refParts[3],
	}

	graph, err := h.eventService.ListResourceEvents(c, ref)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, graph)
}
