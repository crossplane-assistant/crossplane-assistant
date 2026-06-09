package unstruct

import (
	"fmt"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"strings"
)

type ResourceRef struct {
	APIVersion string `json:"apiVersion"`
	Kind       string `json:"kind"`
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
}

func UnmarshallGK(strRef string) (*schema.GroupKind, error) {

	segments := strings.Split(strRef, ":")
	if len(segments) != 2 {
		return nil, fmt.Errorf("invalid GK string: %s", strRef)
	}
	group := segments[0]
	kind := segments[1]

	return &schema.GroupKind{
		Group: group,
		Kind:  kind,
	}, nil
}

func UnmarshallGVK(strRef string) (*schema.GroupVersionKind, error) {

	segments := strings.Split(strRef, ":")
	if len(segments) != 2 {
		return nil, fmt.Errorf("invalid GVK string: %s", strRef)
	}
	apiVersion := segments[0]
	kind := segments[1]

	gv, err := schema.ParseGroupVersion(apiVersion)
	if err != nil {
		return nil, err
	}

	return &schema.GroupVersionKind{
		Group:   gv.Group,
		Version: gv.Version,
		Kind:    kind,
	}, nil
}
func UnmarshallGVKN(strRef string) (*schema.GroupVersionKind, string, error) {

	segments := strings.Split(strRef, ":")
	if len(segments) != 3 {
		return nil, "", fmt.Errorf("invalid GVK string: %s", strRef)
	}
	apiVersion := segments[0]
	kind := segments[1]
	name := segments[2]

	gv, err := schema.ParseGroupVersion(apiVersion)
	if err != nil {
		return nil, "", err
	}

	return &schema.GroupVersionKind{
		Group:   gv.Group,
		Version: gv.Version,
		Kind:    kind,
	}, name, nil
}

func UnserializeResourceRef(strRef string) *ResourceRef {
	refParts := strings.Split(strRef, ":")

	return &ResourceRef{
		APIVersion: refParts[0],
		Kind:       refParts[1],
		Name:       refParts[2],
		Namespace:  refParts[3],
	}
}
