package server

import (
	_ "github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/client"
	k8sv1alpha1 "github.com/ldassonville/crossplane-assistant/internal/crossplane/client/kubernetes/v1alpha1"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/composition"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/compositionrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/event"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/function"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/managedresource"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/provider"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/providerrevision"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/unstruct"
	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/xrd"
	"github.com/ldassonville/crossplane-assistant/internal/kube/resource"
	"github.com/ldassonville/crossplane-assistant/internal/utils/kubernetes"
	"github.com/pkg/errors"
	extensioncs "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	clik8s "k8s.io/client-go/kubernetes"
)

type ApiServer struct {
	e *gin.Engine
}

// Start launch the kubeAssistant server
func (a *ApiServer) Start() error {

	gin.SetMode(gin.ReleaseMode)
	a.e = gin.Default()
	a.e.UseRawPath = true
	a.e.Use(gin.Recovery())

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	a.e.Use(cors.New(config))

	restConfig, err := kubernetes.GetkubeConfig()
	if err != nil {
		return errors.Wrap(err, "fail to get kubeconfig")
	}

	xplaneClientset, err := client.NewForConfig(restConfig)
	if err != nil {
		return errors.Wrap(err, "fail to create crossplane client")
	}

	dynamicClient, err := kubernetes.KubernetesDynamicClient()
	if err != nil {
		return errors.Wrap(err, "fail to create dynamic client")
	}

	// Crossplane kubernetes plugin client
	xK8sClient, err := k8sv1alpha1.NewForConfig(restConfig)
	if err != nil {
		return errors.Wrap(err, "fail to create crossplane kubernetes client")
	}

	k8sClientSet, err := extensioncs.NewForConfig(restConfig)
	if err != nil {
		return err
	}

	crdClient := k8sClientSet.ApiextensionsV1().CustomResourceDefinitions()
	discoveryClient := k8sClientSet.Discovery()
	xrdClient := xplaneClientset.ApiExtensionsV1().CompositeResourceDefinitions()
	compositionClient := xplaneClientset.ApiExtensionsV1().Compositions()
	compositionRevisionClient := xplaneClientset.ApiExtensionsV1().CompositionRevisions()
	providerClient := xplaneClientset.PkgV1().Providers()
	providerRevisionClient := xplaneClientset.PkgV1().ProviderRevisions()
	functionClient := xplaneClientset.PkgV1().Functions()

	crdRegistry := resource.NewCRDRegistry(crdClient)
	providerRevisionRegistry := providerrevision.NewRegistry(providerRevisionClient)

	resourceResolver := unstruct.NewResourceResolver(dynamicClient, crdRegistry)

	k8sClient, err := clik8s.NewForConfig(restConfig)
	if err != nil {
		return err
	}
	eventServices := event.NewService(k8sClient)
	eventHandler := event.NewHandler(eventServices)
	a.e.Handle("GET", "/events/:ref", eventHandler.GetResourcesEvents)

	claimService := claim.NewClaimService(xrdClient, crdClient, crdRegistry, discoveryClient, dynamicClient, xK8sClient, resourceResolver)
	claimHandler := claim.NewHandler(claimService)
	a.e.Handle("GET", "/crossplane/claims", claimHandler.List)
	a.e.Handle("GET", "/crossplane/claims/:ref", claimHandler.Get)
	a.e.Handle("GET", "/crossplane/claims/:ref/tree", claimHandler.GetClaimResourcesTree)
	a.e.Handle("POST", "/crossplane/claims", claimHandler.Create)
	a.e.Handle("PUT", "/crossplane/claims/:name", claimHandler.Update)
	a.e.Handle("DELETE", "/crossplane/claims/:ref", claimHandler.Delete)

	compositionRevisionService := compositionrevision.NewService(compositionRevisionClient)
	compositionRevisionHandler := compositionrevision.NewHandler(compositionRevisionService)
	a.e.Handle("GET", "/crossplane/compositionrevisions", compositionRevisionHandler.ListCompositionRevisions)
	a.e.Handle("GET", "/crossplane/compositionrevisions/:name", compositionRevisionHandler.GetCompositionRevision)

	compositionService := composition.NewService(compositionClient)
	compositionHandler := composition.NewHandler(compositionService)
	a.e.Handle("GET", "/crossplane/compositions", compositionHandler.List)
	a.e.Handle("GET", "/crossplane/compositions/:name", compositionHandler.Get)
	a.e.Handle("GET", "/crossplane/compositions/:name/dependencies", compositionHandler.GetDependencies)
	a.e.Handle("POST", "/crossplane/compositions", compositionHandler.Create)
	a.e.Handle("PUT", "/crossplane/compositions/:name", compositionHandler.Update)
	a.e.Handle("DELETE", "/crossplane/compositions/:name", compositionHandler.Delete)

	providerService := provider.NewService(providerClient)
	providerHandler := provider.NewHandler(providerService)
	a.e.Handle("GET", "/crossplane/providers", providerHandler.List)
	a.e.Handle("GET", "/crossplane/providers/:name", providerHandler.Get)
	a.e.Handle("POST", "/crossplane/providers", providerHandler.Create)
	a.e.Handle("PUT", "/crossplane/providers/:name", providerHandler.Update)
	a.e.Handle("DELETE", "/crossplane/providers/:name", providerHandler.Delete)

	providerRevisionService := providerrevision.NewService(providerRevisionClient)
	providerRevisionHandler := providerrevision.NewHandler(providerRevisionService)
	a.e.Handle("GET", "/crossplane/providers/:name/revisions", providerRevisionHandler.ListByProvider)

	functionService := function.NewService(functionClient)
	functionHandler := function.NewHandler(functionService)
	a.e.Handle("GET", "/crossplane/functions", functionHandler.List)
	a.e.Handle("GET", "/crossplane/functions/:name", functionHandler.Get)
	a.e.Handle("POST", "/crossplane/functions", functionHandler.Create)
	a.e.Handle("PUT", "/crossplane/functions/:name", functionHandler.Update)
	a.e.Handle("DELETE", "/crossplane/functions/:name", functionHandler.Delete)

	xrdService := xrd.NewService(xrdClient)
	xrdHandler := xrd.NewHandler(xrdService)
	a.e.Handle("GET", "/crossplane/xrds", xrdHandler.List)
	a.e.Handle("GET", "/crossplane/xrds/:name", xrdHandler.Get)
	a.e.Handle("POST", "/crossplane/xrds", xrdHandler.Create)
	a.e.Handle("PUT", "/crossplane/xrds/:name", xrdHandler.Update)
	a.e.Handle("DELETE", "/crossplane/xrds/:name", xrdHandler.Delete)

	managedResourceService := managedresource.NewService(resourceResolver, providerRevisionRegistry, crdRegistry)
	managedResourceHandler := managedresource.NewHandler(managedResourceService)
	a.e.Handle("GET", "/crossplane/managedresources/:ref", managedResourceHandler.List)
	a.e.Handle("GET", "/crossplane/managedresources/:ref/:name", managedResourceHandler.Get)
	a.e.Handle("PUT", "/crossplane/managedresources/:ref/:name", managedResourceHandler.Update)
	a.e.Handle("GET", "/crossplane/managedresources/kinds", managedResourceHandler.ListKind)
	a.e.Handle("POST", "/crossplane/managedresources", managedResourceHandler.Create)
	a.e.Handle("PUT", "/crossplane/managedresources", managedResourceHandler.Update)
	a.e.Handle("DELETE", "/crossplane/managedresources/:ref/:name", managedResourceHandler.Delete)
	if err := a.e.Run(":8080"); err != nil {
		return errors.Wrap(err, "fail to start api server")
	}
	return nil
}
