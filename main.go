package main

import (
	"fmt"
	"os"

	"github.com/ldassonville/crossplane-assistant/internal/server"
	"github.com/spf13/cobra"
)

var (
	Commit  = ""
	Version = "x.x.x"
	Date    = ""
)

func main() {
	Execute()
}

var rootCmd = &cobra.Command{
	Use:   "api",
	Short: "crossplane-assistant-api - Launch the crossplane-assistant api server",
	Long:  `crossplane-assistant-api`,
	Run: func(cmd *cobra.Command, args []string) {
		// Get embedded static filesystem
		staticFS, err := GetStaticFS()
		if err != nil {
			_, _ = fmt.Fprintf(os.Stderr, "Failed to load embedded static assets: %s\n", err)
			os.Exit(1)
		}

		apiServer := server.ApiServer{}
		err = apiServer.Start(staticFS)

		if err != nil {
			_, _ = fmt.Fprintf(os.Stderr, "Fail to start API server '%s'", err)
			os.Exit(1)
		}
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "There was an error while executing your CLI '%s'", err)
		os.Exit(1)
	}
}
