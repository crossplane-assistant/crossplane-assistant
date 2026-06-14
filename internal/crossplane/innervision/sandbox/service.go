package sandbox

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

type RenderResult struct {
	CliAvailable bool   `json:"cli_available"`
	Stdout       string `json:"stdout,omitempty"`
	Stderr       string `json:"stderr,omitempty"`
	Error        string `json:"error,omitempty"`
}

type partialComposition struct {
	Spec struct {
		Mode     string `yaml:"mode"`
		Pipeline []struct {
			Step        string `yaml:"step"`
			FunctionRef struct {
				Name string `yaml:"name"`
			} `yaml:"functionRef"`
		} `yaml:"pipeline"`
	} `yaml:"spec"`
}

var functionPackageCatalog = map[string]string{
	"function-patch-and-transform": "xpkg.upbound.io/crossplane-contrib/function-patch-and-transform:v0.3.0",
	"function-auto-ready":          "xpkg.upbound.io/crossplane-contrib/function-auto-ready:v0.2.1",
	"function-go-templating":       "xpkg.upbound.io/crossplane-contrib/function-go-templating:v0.4.1",
	"function-kusion":              "xpkg.upbound.io/kusionstack/function-kusion:v0.1.0",
}

func (s *Service) Render(ctx context.Context, claimYaml, compositionYaml string) RenderResult {
	// Check if crossplane CLI is available
	cliPath, err := exec.LookPath("crossplane")
	if err != nil {
		return RenderResult{
			CliAvailable: false,
			Error:        "Crossplane CLI is not available in PATH. Please install it to use the sandbox rendering feature.",
		}
	}

	// Create temp dir
	tmpDir, err := os.MkdirTemp("", "crossplane-sandbox-")
	if err != nil {
		return RenderResult{
			CliAvailable: true,
			Error:        fmt.Sprintf("Failed to create temp directory: %v", err),
		}
	}
	defer os.RemoveAll(tmpDir)

	claimPath := filepath.Join(tmpDir, "claim.yaml")
	if err := os.WriteFile(claimPath, []byte(claimYaml), 0644); err != nil {
		return RenderResult{
			CliAvailable: true,
			Error:        fmt.Sprintf("Failed to write claim.yaml: %v", err),
		}
	}

	compositionPath := filepath.Join(tmpDir, "composition.yaml")
	if err := os.WriteFile(compositionPath, []byte(compositionYaml), 0644); err != nil {
		return RenderResult{
			CliAvailable: true,
			Error:        fmt.Sprintf("Failed to write composition.yaml: %v", err),
		}
	}

	// Auto-detect and write functions.yaml if using Pipeline mode
	var functionsPath string
	var pComp partialComposition
	if err := yaml.Unmarshal([]byte(compositionYaml), &pComp); err == nil {
		if strings.ToLower(pComp.Spec.Mode) == "pipeline" && len(pComp.Spec.Pipeline) > 0 {
			// Extract unique function names
			funcSet := make(map[string]bool)
			var uniqueFunctions []string
			for _, step := range pComp.Spec.Pipeline {
				name := step.FunctionRef.Name
				if name != "" && !funcSet[name] {
					funcSet[name] = true
					uniqueFunctions = append(uniqueFunctions, name)
				}
			}

			if len(uniqueFunctions) > 0 {
				var functionsYamlBuilder strings.Builder
				for i, funcName := range uniqueFunctions {
					pkg, ok := functionPackageCatalog[funcName]
					if !ok {
						pkg = "xpkg.upbound.io/crossplane-contrib/" + funcName + ":latest"
					}

					if i > 0 {
						functionsYamlBuilder.WriteString("---\n")
					}
					functionsYamlBuilder.WriteString(fmt.Sprintf(`apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: %s
spec:
  package: %s
`, funcName, pkg))
				}

				fPath := filepath.Join(tmpDir, "functions.yaml")
				if err := os.WriteFile(fPath, []byte(functionsYamlBuilder.String()), 0644); err == nil {
					functionsPath = fPath
				}
			}
		}
	}

	// Try running with modern command first: crossplane composition render
	var cmd *exec.Cmd
	if functionsPath != "" {
		cmd = exec.CommandContext(ctx, cliPath, "composition", "render", claimPath, compositionPath, functionsPath)
	} else {
		cmd = exec.CommandContext(ctx, cliPath, "composition", "render", claimPath, compositionPath)
	}
	
	stdout, errCmd := cmd.Output()
	var stderr string
	
	isUnknownCommand := false
	if errCmd != nil {
		if exitErr, ok := errCmd.(*exec.ExitError); ok {
			stderr = string(exitErr.Stderr)
			errLower := strings.ToLower(stderr)
			// Check if the CLI threw a command-not-found / unexpected argument error
			if strings.Contains(errLower, "unexpected argument") || 
				strings.Contains(errLower, "unknown command") || 
				strings.Contains(errLower, "unexpected command") {
				isUnknownCommand = true
			}
		} else {
			stderr = errCmd.Error()
		}
	}

	// Fallback to legacy command if the modern command was unrecognized
	if isUnknownCommand {
		var cmdBeta *exec.Cmd
		if functionsPath != "" {
			cmdBeta = exec.CommandContext(ctx, cliPath, "beta", "render", claimPath, compositionPath, functionsPath)
		} else {
			cmdBeta = exec.CommandContext(ctx, cliPath, "beta", "render", claimPath, compositionPath)
		}
		
		stdoutBeta, errCmdBeta := cmdBeta.Output()
		if errCmdBeta != nil {
			if exitErr, ok := errCmdBeta.(*exec.ExitError); ok {
				stderr = string(exitErr.Stderr)
			} else {
				stderr = errCmdBeta.Error()
			}
			stdout = nil
		} else {
			stdout = stdoutBeta
			stderr = ""
		}
	}

	return RenderResult{
		CliAvailable: true,
		Stdout:       string(stdout),
		Stderr:       stderr,
	}
}
