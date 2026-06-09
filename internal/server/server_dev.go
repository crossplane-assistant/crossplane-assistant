//go:build dev
// +build dev

package server

import (
	"github.com/gin-contrib/cors"
)

// setupDevMiddleware adds CORS middleware for development mode
// This allows the Angular dev server on :4200 to make requests to the API
func (a *ApiServer) setupDevMiddleware() {
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	a.e.Use(cors.New(config))
}
