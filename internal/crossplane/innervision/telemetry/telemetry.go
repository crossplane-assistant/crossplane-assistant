package telemetry

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/client-go/dynamic"
)

// ClientResolver defines the interface for retrieving dynamic namespaceable resource clients.
type ClientResolver interface {
	GetClient(apiVersion string, kind string) (dynamic.NamespaceableResourceInterface, error)
}

type Service struct {
	resourceResolver ClientResolver
}

type AverageDurationResponse struct {
	APIVersion     string  `json:"apiVersion"`
	Kind           string  `json:"kind"`
	AverageSeconds float64 `json:"averageSeconds"`
	SampleSize     int64   `json:"sampleSize"`
}

func NewService(resolver ClientResolver) *Service {
	return &Service{
		resourceResolver: resolver,
	}
}

// GetAverageReadyDuration lists all active instances of a resource kind and calculates their average time-to-ready.
func (s *Service) GetAverageReadyDuration(ctx context.Context, apiVersion, kind string) (*AverageDurationResponse, error) {
	client, err := s.resourceResolver.GetClient(apiVersion, kind)
	if err != nil {
		log.Err(err).Msgf("Failed to resolve dynamic client for apiVersion %s kind %s", apiVersion, kind)
		return nil, err
	}

	// We limit the search size to 50 for performance safety on very large clusters
	listOptions := metav1.ListOptions{
		Limit: 50,
	}

	list, err := client.List(ctx, listOptions)
	if err != nil {
		log.Err(err).Msgf("Failed to list resources for apiVersion %s kind %s", apiVersion, kind)
		return nil, err
	}

	var totalDuration time.Duration
	var readyCount int64

	for _, item := range list.Items {
		creationTime := item.GetCreationTimestamp().Time
		if creationTime.IsZero() {
			continue
		}

		conditions, found, err := unstructured.NestedSlice(item.Object, "status", "conditions")
		if err != nil || !found {
			continue
		}

		for _, condInterface := range conditions {
			cond, ok := condInterface.(map[string]interface{})
			if !ok {
				continue
			}

			// Extract transition time for the Ready=True condition
			if cond["type"] == "Ready" && cond["status"] == "True" {
				lastTransitionStr, ok := cond["lastTransitionTime"].(string)
				if !ok {
					continue
				}

				lastTransitionTime, err := time.Parse(time.RFC3339, lastTransitionStr)
				if err != nil {
					continue
				}

				duration := lastTransitionTime.Sub(creationTime)
				if duration >= 0 {
					totalDuration += duration
					readyCount++
				}
				break
			}
		}
	}

	var avgSeconds float64
	if readyCount > 0 {
		avgSeconds = totalDuration.Seconds() / float64(readyCount)
	}

	return &AverageDurationResponse{
		APIVersion:     apiVersion,
		Kind:           kind,
		AverageSeconds: avgSeconds,
		SampleSize:     readyCount,
	}, nil
}
