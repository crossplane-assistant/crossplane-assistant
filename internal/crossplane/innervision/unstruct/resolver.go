package unstruct

import (
	"context"
	"errors"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"slices"
	"strings"
)

// List of native kubernetes groups (that doesn't require a CRD)
var k8sNativeGroups = []string{"", "app", "batch", "extensions", "autoscaling", "policy",
	"admissionregistration.k8s.io", "apiextensions.k8s.io", "apiregistration.k8s.io", "authentication.k8s.io",
	"authorization.k8s.io", "certificates.k8s.io", "coordination.k8s.io", "discovery.k8s.io", "events.k8s.io",
	"external.metrics.k8s.io", "externaldns.k8s.io", "flowcontrol.apiserver.k8s.io", "metrics.k8s.io",
	"networking.k8s.io", "node.k8s.io", "rbac.authorization.k8s.io", "scheduling.k8s.io", "snapshot.storage.k8s.io",
	"storage.k8s.io", "rbac.authorization.k8s.io"}

func NewResourceResolver(
	dynamicClient *dynamic.DynamicClient,
	crdRegistry *resource.CRDRegistry,
) *ResourceResolver {

	return &ResourceResolver{
		crdRegistry:   crdRegistry,
		dynamicClient: dynamicClient,
	}
}

type ResourceResolver struct {
	dynamicClient *dynamic.DynamicClient
	crdRegistry   *resource.CRDRegistry
}

func (s *ResourceResolver) GetClient(
	apiVersion string,
	kind string,
) (dynamic.NamespaceableResourceInterface, error) {

	gvr, err := s.resolveGVR(apiVersion, kind)
	if err != nil {
		return nil, err
	}

	return s.dynamicClient.Resource(gvr), nil
}

func (s *ResourceResolver) GetClientByGVK(
	gvk schema.GroupVersionKind,
) (dynamic.NamespaceableResourceInterface, error) {

	gvr, err := s.resolveGVRByGVK(gvk)
	if err != nil {
		return nil, err
	}
	return s.dynamicClient.Resource(gvr), nil
}

// ResolveUnstructuredResources resolve a generic kubernetes resource
// and return the unstructured object
func (s *ResourceResolver) ResolveUnstructuredResources(
	ctx context.Context,
	apiVersion string,
	kind string,
	namespace string,
	name string,
) (*unstructured.Unstructured, error) {

	gvr, err := s.resolveGVR(apiVersion, kind)
	if err != nil {
		return nil, err
	}

	clientResource := s.dynamicClient.Resource(gvr)
	if namespace == "" {
		return clientResource.Get(ctx, name, metav1.GetOptions{})
	}
	return clientResource.Namespace(namespace).Get(ctx, name, metav1.GetOptions{})
}

func (s *ResourceResolver) resolveGVRByGVK(gvk schema.GroupVersionKind) (schema.GroupVersionResource, error) {
	// It's a native kubernetes resource
	if s.isK8SNativeGroup(gvk.Group) {
		return s.resolveNativeGVR(gvk)
	}
	return s.resolveCustomResourceGVR(gvk)
}

func (s *ResourceResolver) resolveGVR(apiVersion string, kind string) (schema.GroupVersionResource, error) {

	gv, err := schema.ParseGroupVersion(apiVersion)
	if err != nil {
		return schema.GroupVersionResource{}, err
	}

	gvk := schema.GroupVersionKind{
		Group:   gv.Group,
		Version: gv.Version,
		Kind:    kind,
	}
	return s.resolveGVRByGVK(gvk)
}

// isK8SNativeGroup check if the group is a native kubernetes group
// return true if the group is a native kubernetes group
func (s *ResourceResolver) isK8SNativeGroup(group string) bool {
	return slices.Contains(k8sNativeGroups, group)
}

// resolveNativeGVR the GroupVersionResources for a given GroupVersion and Kind
// for native kubernetes resources (not CRD)
func (s *ResourceResolver) resolveNativeGVR(gvk schema.GroupVersionKind) (gvr schema.GroupVersionResource, err error) {

	// TODO : replace this simple logic by apidiscovery.k8s.io

	resourceName := strings.ToLower(gvk.Kind + "s")
	if gvk.Kind == "ComponentStatus" {
		resourceName = strings.ToLower(gvk.Kind + "es")
	}

	gvr = schema.GroupVersionResource{
		Group:    gvk.Group,
		Version:  gvk.Version,
		Resource: resourceName,
	}
	return gvr, nil

}

// resolveCustomResourceGVR the GroupVersionResources for a given GroupVersion and Kind
// it will fetch the CRD matching the kind and group and return the GroupVersionResource associated
func (s *ResourceResolver) resolveCustomResourceGVR(gvk schema.GroupVersionKind) (gvr schema.GroupVersionResource, err error) {

	crdList := s.crdRegistry.List()
	var resolvedCRD = &v1.CustomResourceDefinition{}

	for _, crd := range crdList {
		if crd.Spec.Names.Kind == gvk.Kind && crd.Spec.Group == gvk.Group {
			resolvedCRD = crd
			break
		}
	}

	// Unable to resolve crd
	if resolvedCRD.Name == "" {
		return gvr, errors.New("unable to resolve crd")
	}

	gvr = schema.GroupVersionResource{
		Group:    gvk.Group,
		Version:  gvk.Version,
		Resource: resolvedCRD.Spec.Names.Plural,
	}

	return gvr, nil
}
