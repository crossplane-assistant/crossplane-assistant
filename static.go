//go:build !dev
// +build !dev

package main

import (
	"embed"
	"io/fs"
)

//go:embed ui/dist/crossplane-assistant-ui
var staticAssets embed.FS

// GetStaticFS returns a filesystem rooted at the crossplane-assistant-ui/ directory
// containing the embedded Angular application assets.
func GetStaticFS() (fs.FS, error) {
	return fs.Sub(staticAssets, "ui/dist/crossplane-assistant-ui")
}
