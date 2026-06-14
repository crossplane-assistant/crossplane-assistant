import { isResourceHealthy } from '../src/utils/health';

/**
 * Self-contained unit tests to verify the correctness of the
 * isResourceHealthy utility across multiple Kubernetes and Crossplane mock states.
 */
export function runHealthTests() {
  console.log('Starting health evaluation utility tests...');

  // Test Case 1: Null or undefined resource
  if (isResourceHealthy(null) !== false) {
    throw new Error('Test Case 1 failed: Expected false for null resource');
  }

  // Test Case 2: Resource with no conditions field (should be considered healthy/ready, e.g. Compositions)
  const mockResource2 = {
    metadata: { name: 'test-composition' },
  };
  if (isResourceHealthy(mockResource2) !== true) {
    throw new Error('Test Case 2 failed: Expected true for resource without conditions');
  }

  // Test Case 3: Resource with empty conditions array
  const mockResource3 = {
    metadata: { name: 'test-empty-conditions' },
    status: { conditions: [] }
  };
  if (isResourceHealthy(mockResource3) !== true) {
    throw new Error('Test Case 3 failed: Expected true for resource with empty conditions');
  }

  // Test Case 4: Resource with non-critical conditions (should be ignored and return true)
  const mockResource4 = {
    metadata: { name: 'test-non-critical' },
    status: {
      conditions: [
        { type: 'SomeOtherCondition', status: 'False' }
      ]
    }
  };
  if (isResourceHealthy(mockResource4) !== true) {
    throw new Error('Test Case 4 failed: Expected true for resource with non-critical conditions');
  }

  // Test Case 5: Resource with 'Ready' condition as 'True' (healthy)
  const mockResource5 = {
    metadata: { name: 'test-ready' },
    status: {
      conditions: [
        { type: 'Ready', status: 'True' }
      ]
    }
  };
  if (isResourceHealthy(mockResource5) !== true) {
    throw new Error('Test Case 5 failed: Expected true for resource with Ready: True');
  }

  // Test Case 6: Resource with 'Ready' condition as 'False' (unhealthy)
  const mockResource6 = {
    metadata: { name: 'test-unready' },
    status: {
      conditions: [
        { type: 'Ready', status: 'False' }
      ]
    }
  };
  if (isResourceHealthy(mockResource6) !== false) {
    throw new Error('Test Case 6 failed: Expected false for resource with Ready: False');
  }

  // Test Case 7: Multiple critical conditions, one failing (unhealthy)
  const mockResource7 = {
    metadata: { name: 'test-mixed' },
    status: {
      conditions: [
        { type: 'Ready', status: 'True' },
        { type: 'Synced', status: 'False' }
      ]
    }
  };
  if (isResourceHealthy(mockResource7) !== false) {
    throw new Error('Test Case 7 failed: Expected false when Synced is False');
  }

  // Test Case 8: Multiple critical conditions, all passing (healthy)
  const mockResource8 = {
    metadata: { name: 'test-all-passing' },
    status: {
      conditions: [
        { type: 'Ready', status: 'True' },
        { type: 'Synced', status: 'True' },
        { type: 'Healthy', status: 'True' }
      ]
    }
  };
  if (isResourceHealthy(mockResource8) !== true) {
    throw new Error('Test Case 8 failed: Expected true when all critical conditions are True');
  }

  console.log('✓ All health evaluation utility tests passed successfully!');
}
