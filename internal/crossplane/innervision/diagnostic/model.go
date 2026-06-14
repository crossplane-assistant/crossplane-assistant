package diagnostic

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type DiagnosticResponse struct {
	Tree   *DiagnosticTree       `json:"tree"`
	Events []AggregatedEvent     `json:"events"`
	Logs   []ResourceProviderLog `json:"logs"`
}

type DiagnosticTree struct {
	Root *DiagnosticNode `json:"root"`
}

type DiagnosticNode struct {
	Kind       string            `json:"kind"`
	APIVersion string            `json:"apiVersion"`
	Name       string            `json:"name"`
	Namespace  string            `json:"namespace,omitempty"`
	UID        string            `json:"uid,omitempty"`
	Status     string            `json:"status"` // "Ready" or "Unready"
	Conditions []ConditionInfo   `json:"conditions,omitempty"`
	MetaKind   string            `json:"metaKind"` // "XRC", "XR", "Resource", "Manifest" etc.
	Children   []*DiagnosticNode `json:"children,omitempty"`
}

type ConditionInfo struct {
	Type    string `json:"type"`
	Status  string `json:"status"`
	Reason  string `json:"reason,omitempty"`
	Message string `json:"message,omitempty"`
}

type AggregatedEvent struct {
	ResourceName string      `json:"resourceName"`
	ResourceKind string      `json:"resourceKind"`
	Type         string      `json:"type"`
	Reason       string      `json:"reason"`
	Message      string      `json:"message"`
	Count        int32       `json:"count"`
	Timestamp    metav1.Time `json:"timestamp"`
}

type ResourceProviderLog struct {
	ResourceName string   `json:"resourceName"`
	ResourceKind string   `json:"resourceKind"`
	ProviderName string   `json:"providerName"`
	PodName      string   `json:"podName"`
	Namespace    string   `json:"namespace"`
	Lines        []string `json:"lines"`
}
