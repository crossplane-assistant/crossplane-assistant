package server

import (
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/crossplane-contrib/provider-kubernetes/apis/object/v1alpha1"
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
func (a *ApiServer) Start(staticFS fs.FS) error {

	gin.SetMode(gin.ReleaseMode)
	a.e = gin.Default()
	a.e.UseRawPath = true
	a.e.Use(gin.Recovery())

	// Setup development middleware (CORS) if running in dev mode
	a.setupDevMiddleware()

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

	// Setup static file serving (must be after API routes for proper precedence)
	a.setupStaticRoutes(staticFS)

	// Get port from environment variable, default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := a.e.Run(":" + port); err != nil {
		return errors.Wrap(err, "fail to start api server")
	}
	return nil
}

// setupStaticRoutes configures static file serving with SPA fallback
func (a *ApiServer) setupStaticRoutes(staticFS fs.FS) {
	// Serve static files with custom handler for SPA fallback
	a.e.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Try to open the file from embedded filesystem
		file, err := staticFS.Open(strings.TrimPrefix(path, "/"))
		if err == nil {
			file.Close()
			// File exists, serve it with appropriate cache headers
			a.serveStaticFile(c, staticFS, path)
			return
		}

		// File doesn't exist - check if it's an explicit file request
		ext := filepath.Ext(path)
		if ext != "" && (ext == ".js" || ext == ".css" || ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".svg" || ext == ".woff" || ext == ".woff2" || ext == ".ttf" || ext == ".ico") {
			// Explicit file request that doesn't exist - return 404
			c.Status(http.StatusNotFound)
			return
		}

		// Not a file request - serve index.html for SPA routing
		a.serveStaticFile(c, staticFS, "/index.html")
	})
}

// serveStaticFile serves a file from the embedded filesystem with appropriate cache headers
func (a *ApiServer) serveStaticFile(c *gin.Context, staticFS fs.FS, path string) {
	path = strings.TrimPrefix(path, "/")

	file, err := staticFS.Open(path)
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	defer file.Close()

	// Get file info for content type detection
	stat, err := file.Stat()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	// Set cache headers based on file type
	if path == "index.html" || strings.HasSuffix(path, "/index.html") {
		// No cache for index.html to ensure latest version
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
	} else {
		// Long-term cache for content-hashed assets
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	}

	// Serve the file
	http.ServeContent(c.Writer, c.Request, path, stat.ModTime(), file.(io.ReadSeeker))
}
