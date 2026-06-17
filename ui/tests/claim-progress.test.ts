import { describe, test, expect } from 'vitest';
import { getProgressStats } from '../src/components/ClaimGraph';
import { ClaimTreeNode } from '../src/types';

describe('Claim Progress Bar Calculation Tests', () => {
  test('returns 0% and 0/0 when node is null or undefined', () => {
    const stats1 = getProgressStats(null);
    expect(stats1).toEqual({ total: 0, ready: 0, percentage: 0 });

    const stats2 = getProgressStats(undefined);
    expect(stats2).toEqual({ total: 0, ready: 0, percentage: 0 });
  });

  test('calculates correct progress for a single non-ready root node', () => {
    const rootNode: ClaimTreeNode = {
      kind: 'DatabaseClaim',
      version: 'v1alpha1',
      name: 'my-db',
      metaKind: 'Claim',
      conditions: [
        { type: 'Ready', status: 'False', reason: 'Reconciling' }
      ]
    };

    const stats = getProgressStats(rootNode);
    expect(stats).toEqual({ total: 1, ready: 0, percentage: 0 });
  });

  test('calculates correct progress for a single ready root node', () => {
    const rootNode: ClaimTreeNode = {
      kind: 'DatabaseClaim',
      version: 'v1alpha1',
      name: 'my-db',
      metaKind: 'Claim',
      conditions: [
        { type: 'Ready', status: 'True' }
      ]
    };

    const stats = getProgressStats(rootNode);
    expect(stats).toEqual({ total: 1, ready: 1, percentage: 100 });
  });

  test('traverses children and calculates correct overall progress', () => {
    // 1 Claim (Ready)
    //   - 1 XR (Ready)
    //     - MR1 (Ready)
    //     - MR2 (Not Ready)
    // Total = 4 resources, Ready = 3 resources -> 75%
    const claimTree: ClaimTreeNode = {
      kind: 'DatabaseClaim',
      version: 'v1alpha1',
      name: 'my-db',
      metaKind: 'Claim',
      conditions: [{ type: 'Ready', status: 'True' }],
      children: [
        {
          kind: 'CompositeDatabase',
          version: 'v1alpha1',
          name: 'my-db-xr',
          metaKind: 'Composite',
          conditions: [{ type: 'Ready', status: 'True' }],
          children: [
            {
              kind: 'RDSInstance',
              version: 'v1beta1',
              name: 'rds-mr',
              metaKind: 'Resource',
              conditions: [{ type: 'Ready', status: 'True' }]
            },
            {
              kind: 'SubnetGroup',
              version: 'v1beta1',
              name: 'subnet-mr',
              metaKind: 'Resource',
              conditions: [{ type: 'Ready', status: 'False' }]
            }
          ]
        }
      ]
    };

    const stats = getProgressStats(claimTree);
    expect(stats).toEqual({ total: 4, ready: 3, percentage: 75 });
  });

  test('uses status.conditions from manifest when manifest is present', () => {
    const rootNode: ClaimTreeNode = {
      kind: 'DatabaseClaim',
      version: 'v1alpha1',
      name: 'my-db',
      metaKind: 'Claim',
      manifest: {
        status: {
          conditions: [
            { type: 'Ready', status: 'True' }
          ]
        }
      }
    };

    const stats = getProgressStats(rootNode);
    expect(stats).toEqual({ total: 1, ready: 1, percentage: 100 });
  });
});
