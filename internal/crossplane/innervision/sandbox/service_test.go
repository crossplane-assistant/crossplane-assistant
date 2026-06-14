package sandbox

import (
	"context"
	"os/exec"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRenderService(t *testing.T) {
	svc := NewService()
	ctx := context.Background()

	// Check if crossplane is available on this machine
	_, err := exec.LookPath("crossplane")
	if err != nil {
		t.Skip("crossplane CLI not available on system, skipping render integration test")
	}

	dummyClaim := `apiVersion: database.example/v1alpha1
kind: PostgreSQLInstance
metadata:
  name: test-db
spec:
  parameters:
    storageGB: 20`

	dummyComposition := `apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: test-composition
spec:
  compositeTypeRef:
    apiVersion: database.example/v1alpha1
    kind: PostgreSQLInstance
  resources: []`

	res := svc.Render(ctx, dummyClaim, dummyComposition)
	assert.True(t, res.CliAvailable)
	
	// Since there is no active local function-runner or complete composition definition,
	// rendering might report error in stderr, but the execution itself should succeed.
	assert.NotEmpty(t, res.Stderr)
	assert.Contains(t, strings.ToLower(res.Stderr), "error")
}

func TestRenderPipelineService(t *testing.T) {
	svc := NewService()
	ctx := context.Background()

	// Check if crossplane is available on this machine
	_, err := exec.LookPath("crossplane")
	if err != nil {
		t.Skip("crossplane CLI not available on system, skipping render integration test")
	}

	dummyClaim := `apiVersion: database.example/v1alpha1
kind: PostgreSQLInstance
metadata:
  name: test-db
spec:
  parameters:
    storageGB: 20`

	pipelineComposition := `apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: test-pipeline-composition
spec:
  compositeTypeRef:
    apiVersion: database.example/v1alpha1
    kind: PostgreSQLInstance
  mode: Pipeline
  pipeline:
    - step: patch-and-transform
      functionRef:
        name: function-patch-and-transform`

	res := svc.Render(ctx, dummyClaim, pipelineComposition)
	assert.True(t, res.CliAvailable)
	
	// Because of auto-detected functions, the rendering command will execute with the generated functions.yaml.
	// Since function execution requires a running Docker engine by default or connection to the function container,
	// the rendering command is expected to fail with connection or Docker daemon errors,
	// but it should NOT fail with "functions argument is required when not in a project"!
	assert.NotEmpty(t, res.Stderr)
	assert.NotContains(t, res.Stderr, "functions argument is required when not in a project")
}
