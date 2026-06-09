//go:build dev
// +build dev

package main

import (
	"io/fs"
	"os"
)

// GetStaticFS returns nil in dev mode - frontend should be served by ng serve
func GetStaticFS() (fs.FS, error) {
	// Return a dummy FS - in dev mode, static files won't be served by the backend
	return os.DirFS("."), nil
}
