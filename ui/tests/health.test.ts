import { describe, test, expect } from 'vitest';
import { isResourceHealthy } from '../src/utils/health';

describe('isResourceHealthy', () => {
  test('returns false for a null resource', () => {
    expect(isResourceHealthy(null)).toBe(false);
  });

  test('returns true for a resource with no conditions field (e.g. Compositions)', () => {
    const mockResource = {
      metadata: { name: 'test-composition' },
    };
    expect(isResourceHealthy(mockResource)).toBe(true);
  });

  test('returns true for a resource with an empty conditions array', () => {
    const mockResource = {
      metadata: { name: 'test-empty-conditions' },
      status: { conditions: [] },
    };
    expect(isResourceHealthy(mockResource)).toBe(true);
  });

  test('returns true for a resource with only non-critical conditions', () => {
    const mockResource = {
      metadata: { name: 'test-non-critical' },
      status: {
        conditions: [{ type: 'SomeOtherCondition', status: 'False' }],
      },
    };
    expect(isResourceHealthy(mockResource)).toBe(true);
  });

  test('returns true for a resource with Ready: True', () => {
    const mockResource = {
      metadata: { name: 'test-ready' },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
      },
    };
    expect(isResourceHealthy(mockResource)).toBe(true);
  });

  test('returns false for a resource with Ready: False', () => {
    const mockResource = {
      metadata: { name: 'test-unready' },
      status: {
        conditions: [{ type: 'Ready', status: 'False' }],
      },
    };
    expect(isResourceHealthy(mockResource)).toBe(false);
  });

  test('returns false when one of multiple critical conditions is failing', () => {
    const mockResource = {
      metadata: { name: 'test-mixed' },
      status: {
        conditions: [
          { type: 'Ready', status: 'True' },
          { type: 'Synced', status: 'False' },
        ],
      },
    };
    expect(isResourceHealthy(mockResource)).toBe(false);
  });

  test('returns true when all critical conditions are passing', () => {
    const mockResource = {
      metadata: { name: 'test-all-passing' },
      status: {
        conditions: [
          { type: 'Ready', status: 'True' },
          { type: 'Synced', status: 'True' },
          { type: 'Healthy', status: 'True' },
        ],
      },
    };
    expect(isResourceHealthy(mockResource)).toBe(true);
  });
});
