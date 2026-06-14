package diagnostic

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"sort"
	"strings"

	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/event"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/rs/zerolog/log"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes"
)

type Service struct {
	clientSet    kubernetes.Interface
	claimService *claim.Service
	eventService *event.Service
	crdRegistry  *resource.CRDRegistry
	prRegistry   *providerrevision.Registry
}

func NewService(
	clientSet kubernetes.Interface,
	claimService *claim.Service,
	eventService *event.Service,
	crdRegistry *resource.CRDRegistry,
	prRegistry *providerrevision.Registry,
) *Service {
	return &Service{
		clientSet:    clientSet,
		claimService: claimService,
		eventService: eventService,
		crdRegistry:  crdRegistry,
		prRegistry:   prRegistry,
	}
}

func (s *Service) GetClaimDiagnostics(ctx context.Context, ref *unstruct.ResourceRef) (*DiagnosticResponse, error) {
	// Step 1: Get the resource tree
	tree, err := s.claimService.GetResourcesTree(ctx, ref)
	if err != nil {
		return nil, err
	}

	// Step 2: Traverse the tree to collect all nodes
	var nodes []*claim.Node
	var traverse func(n *claim.Node)
	traverse = func(n *claim.Node) {
		if n == nil {
			return
		}
		nodes = append(nodes, n)
		for _, child := range n.Children {
			traverse(child)
		}
	}
	traverse(tree.Root)

	// Step 3: Fetch events for all resources in the tree
	var aggregatedEvents []AggregatedEvent
	for _, node := range nodes {
		eventRef := &event.ResourceRef{
			APIVersion: node.Version,
			Kind:       node.Kind,
			Name:       node.Name,
			Namespace:  node.Namespace,
		}
		eventList, err := s.eventService.ListResourceEvents(ctx, eventRef)
		if err != nil {
			log.Warn().Err(err).Msgf("Failed to list events for resource %s", node.Name)
			continue
		}
		if eventList != nil {
			for _, ev := range eventList.Items {
				aggregatedEvents = append(aggregatedEvents, AggregatedEvent{
					ResourceName: node.Name,
					ResourceKind: node.Kind,
					Type:         ev.Type,
					Reason:       ev.Reason,
					Message:      ev.Message,
					Count:        ev.Count,
					Timestamp:    ev.LastTimestamp,
				})
			}
		}
	}

	// Sort events chronologically descending (newest first)
	sort.Slice(aggregatedEvents, func(i, j int) bool {
		return aggregatedEvents[j].Timestamp.Before(&aggregatedEvents[i].Timestamp)
	})

	// Step 4: Fetch logs for Managed Resources (MetaKind == "Resource" or "Object")
	var providerLogs []ResourceProviderLog
	for _, node := range nodes {
		if node.MetaKind != "Resource" && node.MetaKind != "Object" {
			continue
		}

		revisionName, err := s.FindProviderRevisionForMR(node.Version, node.Kind)
		if err != nil {
			log.Debug().Err(err).Msgf("Could not map GVK to provider revision for %s", node.Name)
			continue
		}

		pods, err := s.clientSet.CoreV1().Pods("").List(ctx, metav1.ListOptions{
			LabelSelector: "pkg.crossplane.io/revision=" + revisionName,
		})
		if err != nil || len(pods.Items) == 0 {
			log.Debug().Err(err).Msgf("No active pods found for provider revision %s", revisionName)
			continue
		}

		// Choose the first running pod
		pod := pods.Items[0]

		var containerName string
		if len(pod.Spec.Containers) > 0 {
			containerName = pod.Spec.Containers[0].Name
		}

		tailLines := int64(500)
		req := s.clientSet.CoreV1().Pods(pod.Namespace).GetLogs(pod.Name, &v1.PodLogOptions{
			Container: containerName,
			TailLines: &tailLines,
		})

		stream, err := req.Stream(ctx)
		if err != nil {
			log.Warn().Err(err).Msgf("Failed to open log stream for pod %s", pod.Name)
			continue
		}

		buf := new(bytes.Buffer)
		_, _ = io.Copy(buf, stream)
		stream.Close()

		filteredLines := s.FilterLogLines(buf.String(), node.Name, node.Uid)

		providerLogs = append(providerLogs, ResourceProviderLog{
			ResourceName: node.Name,
			ResourceKind: node.Kind,
			ProviderName: revisionName,
			PodName:      pod.Name,
			Namespace:    pod.Namespace,
			Lines:        filteredLines,
		})
	}

	// Step 5: Convert claim tree into diagnostic tree
	var mapNode func(n *claim.Node) *DiagnosticNode
	mapNode = func(n *claim.Node) *DiagnosticNode {
		if n == nil {
			return nil
		}

		var conditions []ConditionInfo
		for _, c := range n.Conditions {
			conditions = append(conditions, ConditionInfo{
				Type:    c.Type,
				Status:  c.Status,
				Reason:  c.Reason,
				Message: c.Message,
			})
		}

		status := "Ready"
		if !s.IsNodeHealthy(n.Conditions) {
			status = "Unready"
		}

		dn := &DiagnosticNode{
			Kind:       n.Kind,
			APIVersion: n.Version,
			Name:       n.Name,
			Namespace:  n.Namespace,
			UID:        n.Uid,
			Status:     status,
			Conditions: conditions,
			MetaKind:   n.MetaKind,
		}

		for _, child := range n.Children {
			mappedChild := mapNode(child)
			if mappedChild != nil {
				dn.Children = append(dn.Children, mappedChild)
			}
		}

		return dn
	}

	diagnosticTree := &DiagnosticTree{
		Root: mapNode(tree.Root),
	}

	return &DiagnosticResponse{
		Tree:   diagnosticTree,
		Events: aggregatedEvents,
		Logs:   providerLogs,
	}, nil
}

func (s *Service) FindProviderRevisionForMR(apiVersion, kind string) (string, error) {
	gv, err := schema.ParseGroupVersion(apiVersion)
	if err != nil {
		return "", err
	}
	group := gv.Group

	crds := s.crdRegistry.List()
	var crdName string
	for _, crd := range crds {
		if crd.Spec.Group == group && crd.Spec.Names.Kind == kind {
			crdName = crd.Name
			break
		}
	}

	if crdName == "" {
		return "", fmt.Errorf("crd not found for group %s and kind %s", group, kind)
	}

	revisions := s.prRegistry.ListActive()
	for _, revision := range revisions {
		for _, obj := range revision.GetObjects() {
			if obj.Kind == "CustomResourceDefinition" && obj.Name == crdName {
				return revision.Name, nil
			}
		}
	}

	return "", fmt.Errorf("active provider revision not found for crd %s", crdName)
}

func (s *Service) FilterLogLines(logBlock string, name string, uid string) []string {
	lines := strings.Split(logBlock, "\n")
	var filtered []string

	keywords := []string{strings.ToLower(name)}
	if uid != "" {
		keywords = append(keywords, strings.ToLower(uid))
	}

	for _, line := range lines {
		if line == "" {
			continue
		}
		lineLower := strings.ToLower(line)
		match := false
		for _, kw := range keywords {
			if strings.Contains(lineLower, kw) {
				match = true
				break
			}
		}
		if match {
			filtered = append(filtered, line)
		}
	}
	return filtered
}

func (s *Service) IsNodeHealthy(conditions []claim.Condition) bool {
	if len(conditions) == 0 {
		return true
	}
	criticalTypes := map[string]bool{
		"Ready":       true,
		"Healthy":     true,
		"Established": true,
		"Synced":      true,
	}

	hasCritical := false
	for _, c := range conditions {
		if criticalTypes[c.Type] {
			hasCritical = true
			if c.Status != "True" {
				return false
			}
		}
	}
	return hasCritical || true
}
