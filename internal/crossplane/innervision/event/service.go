package event

import (
	"context"
	"sort"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func NewService(
	clientSet kubernetes.Interface,

) *Service {

	return &Service{
		clientSet: clientSet,
	}
}

type Service struct {
	clientSet kubernetes.Interface
}

func (s *Service) ListResourceEvents(ctx context.Context, ref *ResourceRef) (*v1.EventList, error) {

	events, err := s.clientSet.CoreV1().
		Events(ref.Namespace).
		List(
			context.TODO(),
			metav1.ListOptions{FieldSelector: "involvedObject.name=" + ref.Name, TypeMeta: metav1.TypeMeta{Kind: ref.Kind}})

	sort.Slice(events.Items, func(i, j int) bool {
		return events.Items[j].LastTimestamp.Before(&events.Items[i].LastTimestamp)
	})

	return events, err
}
