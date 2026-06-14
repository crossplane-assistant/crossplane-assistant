package diagnostic

import (
	"testing"

	"github.com/ldassonville/crossplane-assistant/internal/crossplane/innervision/claim"
)

func TestFilterLogLines(t *testing.T) {
	s := &Service{}

	logBlock := `2026-06-14T10:00:00Z INFO reconciling Instance/my-db-instance
2026-06-14T10:00:01Z ERROR cannot create DB: AccessDenied for my-db-instance
2026-06-14T10:00:02Z INFO reconciling Instance/another-db-instance
2026-06-14T10:00:03Z ERROR uid:12345-67890 connection timeout`

	t.Run("filter by name", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "my-db-instance", "")
		if len(lines) != 2 {
			t.Fatalf("expected 2 lines, got %d", len(lines))
		}
		if !stringsContains(lines[0], "my-db-instance") || !stringsContains(lines[1], "my-db-instance") {
			t.Errorf("incorrect lines returned: %v", lines)
		}
	})

	t.Run("filter by uid", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "non-existent", "12345-67890")
		if len(lines) != 1 {
			t.Fatalf("expected 1 line, got %d", len(lines))
		}
		if !stringsContains(lines[0], "12345-67890") {
			t.Errorf("incorrect line returned: %s", lines[0])
		}
	})

	t.Run("filter with no match", func(t *testing.T) {
		lines := s.FilterLogLines(logBlock, "missing-resource", "none")
		if len(lines) != 0 {
			t.Errorf("expected 0 lines, got %d: %v", len(lines), lines)
		}
	})
}

func TestIsNodeHealthy(t *testing.T) {
	s := &Service{}

	t.Run("empty conditions", func(t *testing.T) {
		if !s.IsNodeHealthy(nil) {
			t.Errorf("empty conditions should be considered healthy")
		}
	})

	t.Run("all critical conditions true", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "Ready", Status: "True"},
			{Type: "Synced", Status: "True"},
		}
		if !s.IsNodeHealthy(conditions) {
			t.Errorf("all true critical conditions should be healthy")
		}
	})

	t.Run("one critical condition false", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "Ready", Status: "False"},
			{Type: "Synced", Status: "True"},
		}
		if s.IsNodeHealthy(conditions) {
			t.Errorf("any false critical condition should be unhealthy")
		}
	})

	t.Run("no critical conditions present", func(t *testing.T) {
		conditions := []claim.Condition{
			{Type: "CustomCondition", Status: "True"},
		}
		if !s.IsNodeHealthy(conditions) {
			t.Errorf("no critical conditions should default to healthy")
		}
	})
}

func stringsContains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr || s[len(s)-len(substr):] == substr || containsInBetween(s, substr)
}

func containsInBetween(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
