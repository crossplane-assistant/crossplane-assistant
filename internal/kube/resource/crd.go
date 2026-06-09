package resource

import (
	"context"

	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	crdv1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/watch"

	mwatch "k8s.io/apimachinery/pkg/watch"
)

type CRDRegistry struct {
	indexer     cache.Store
	indexerCtrl cache.Controller
	crdWatch    mwatch.Interface
	crdChan     <-chan struct{}

	crdItf crdv1.CustomResourceDefinitionInterface
}

func NewCRDRegistry(crdItf crdv1.CustomResourceDefinitionInterface) *CRDRegistry {
	registry := &CRDRegistry{
		crdItf: crdItf,
	}
	registry.init(context.Background())
	return registry
}

func (c *CRDRegistry) init(ctx context.Context) {

	lw := &cache.ListWatch{
		ListFunc: func(options metav1.ListOptions) (runtime.Object, error) {
			return c.crdItf.List(context.Background(), options)
		},
		WatchFunc: func(options metav1.ListOptions) (mwatch.Interface, error) {
			return c.crdItf.Watch(context.Background(), options)
		},
	}

	// https://pkg.go.dev/k8s.io/client-go/tools/watch#NewIndexerInformerWatcher
	c.indexer, c.indexerCtrl, c.crdWatch, c.crdChan = watch.NewIndexerInformerWatcher(lw, &v1.CustomResourceDefinition{})

}

func (c *CRDRegistry) Get(name string) (*v1.CustomResourceDefinition, error) {
	crd, exist, err := c.indexer.GetByKey(name)

	if err != nil {
		return nil, err
	}
	if exist {
		return crd.(*v1.CustomResourceDefinition), nil
	}
	return nil, nil
}

func (c *CRDRegistry) List() []*v1.CustomResourceDefinition {
	crds := c.indexer.List()

	var res []*v1.CustomResourceDefinition
	for _, crd := range crds {
		res = append(res, crd.(*v1.CustomResourceDefinition))
	}
	return res
}
