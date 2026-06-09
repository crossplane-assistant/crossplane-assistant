package providerrevision

import (
	"context"
	xpv1 "github.com/crossplane/crossplane/apis/pkg/v1"
	xpv1cli "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/pkg/v1"

	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/watch"

	mwatch "k8s.io/apimachinery/pkg/watch"
)

type Registry struct {
	indexer     cache.Store
	indexerCtrl cache.Controller
	crdWatch    mwatch.Interface
	crdChan     <-chan struct{}

	providerRevisionItf xpv1cli.ProviderRevisionInterface
}

func NewRegistry(prItf xpv1cli.ProviderRevisionInterface) *Registry {
	registry := &Registry{
		providerRevisionItf: prItf,
	}
	registry.init()
	return registry
}

func (c *Registry) init() {

	lw := &cache.ListWatch{
		ListFunc: func(options metav1.ListOptions) (runtime.Object, error) {
			return c.providerRevisionItf.List(context.Background(), options)
		},
		WatchFunc: func(options metav1.ListOptions) (mwatch.Interface, error) {
			return c.providerRevisionItf.Watch(context.Background(), options)
		},
	}

	// https://pkg.go.dev/k8s.io/client-go/tools/watch#NewIndexerInformerWatcher
	c.indexer, c.indexerCtrl, c.crdWatch, c.crdChan = watch.NewIndexerInformerWatcher(lw, &v1.CustomResourceDefinition{})
}

func (c *Registry) ListActive() []*xpv1.ProviderRevision {
	providerRevisions := c.indexer.List()

	res := make([]*xpv1.ProviderRevision, 0)
	for _, item := range providerRevisions {
		pr := item.(*xpv1.ProviderRevision)

		if pr.Spec.DesiredState == xpv1.PackageRevisionActive {
			res = append(res, pr)
		}
	}
	return res
}
