package dependency

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIndex(t *testing.T) {

	tcs := []string{
		"spec.forProvider.manifest.metadata.labels[\"app.kubernetes.io/managed-by\"]",
		"spec.forProvider.vars[5].value",
		"status.resources.secret-id",
	}

	indexer := NewPathIndexer()

	var attachedItem any = "dummy item"

	for _, tc := range tcs {
		err := indexer.Index(tc, attachedItem)

		if err != nil {
			t.Errorf("Error indexing path %s: %s", tc, err)
		}
	}

	_ = indexer.Print(os.Stdout)

	for _, tc := range tcs {
		node := indexer.Lookup(tc, &LookupOptions{
			ResolvePrefixed: true,
		})

		if node == nil {
			t.Errorf("Indexed item with path %s not found", tc)
		}
	}
}

func TestPartialIndexing(t *testing.T) {

	indexContent := []string{
		"status.resources.status",
	}

	testcases := []struct {
		path     string
		expected string
	}{
		{
			path:     "status.resources.status.timestamp",
			expected: "status.resources.status",
		},
	}

	indexer := NewPathIndexer()

	for _, ic := range indexContent {
		err := indexer.Index(ic, ic)
		if err != nil {
			t.Errorf("Error indexing path %s: %s", ic, err)
		}
	}

	_ = indexer.Print(os.Stdout)

	for _, tc := range testcases {
		node := indexer.Lookup(tc.path, &LookupOptions{
			ResolvePrefixed: true,
		})

		if node == nil {
			assert.Failf(t, "fail to resolve partial content", "Indexed item with path %s not found", tc.path)
			continue
		}

		if node.attachedItems[0] != tc.expected {
			assert.Failf(t, "fail to resolve partial content", "Expected %s but got %s", tc.expected, node.attachedItems[0])
		}
	}
}
