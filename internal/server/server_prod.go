//go:build !dev
// +build !dev

package server

// setupDevMiddleware is a no-op in production builds
func (a *ApiServer) setupDevMiddleware() {
	// No CORS middleware in production - frontend and API served from same origin
}
