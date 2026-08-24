import { describe, test, expect } from 'vitest';
import { ClaimTreeNode } from '../src/types';

// Business logic functions isolated for mathematical unit testing
export function calculateTimelineMetrics(
  node: ClaimTreeNode,
  startTimeMs: number,
  totalDurationMs: number,
  nowMs: number = Date.now()
) {
  const manifest = node.manifest;
  if (!manifest || !manifest.metadata?.creationTimestamp) {
    return null;
  }

  const created = new Date(manifest.metadata.creationTimestamp).getTime();
  const readyCond = manifest.status?.conditions?.find((c: any) => c.type === 'Ready');
  const isReady = readyCond?.status === 'True';
  const readyTime = isReady && readyCond?.lastTransitionTime ? new Date(readyCond.lastTransitionTime).getTime() : undefined;

  const waitDuration = created - startTimeMs;
  const activeDuration = (readyTime || nowMs) - created;

  const waitWidth = (waitDuration / totalDurationMs) * 100;
  const activeWidth = (activeDuration / totalDurationMs) * 100;
  const startOffset = ((created - startTimeMs) / totalDurationMs) * 100;

  return {
    isReady,
    waitDuration,
    activeDuration,
    waitWidth,
    activeWidth,
    startOffset,
  };
}

describe('Reconciliation Gantt Timeline math validation', () => {
  const mockClaimStartTime = new Date('2026-06-13T12:00:00Z').getTime();
  const mockNowTime = new Date('2026-06-13T12:10:00Z').getTime(); // 10 minutes later
  const mockTotalDuration = 10 * 60 * 1000; // 10 minutes in ms

  test('calculates wait/active durations and percentages for a node that became Ready', () => {
    // Node created after 2 minutes, Ready after 5 minutes (total 7 minutes since claim start)
    const mockNode1: ClaimTreeNode = {
      kind: 'RDSInstance',
      version: 'v1beta1',
      name: 'test-db',
      metaKind: 'Resource',
      manifest: {
        metadata: {
          name: 'test-db',
          creationTimestamp: '2026-06-13T12:02:00Z', // +2 minutes offset
        },
        status: {
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: '2026-06-13T12:07:00Z', // +5 minutes active duration
            },
          ],
        },
      },
    };

    const metrics1 = calculateTimelineMetrics(mockNode1, mockClaimStartTime, mockTotalDuration, mockNowTime);

    expect(metrics1).not.toBeNull();

    // Wait duration: 2 minutes = 120,000 ms
    expect(metrics1!.waitDuration).toBe(120000);

    // Active provisioning duration: 5 minutes = 300,000 ms
    expect(metrics1!.activeDuration).toBe(300000);

    // Percentages
    const expectedWaitWidth = (120000 / mockTotalDuration) * 100; // 20%
    const expectedActiveWidth = (300000 / mockTotalDuration) * 100; // 50%
    const expectedStartOffset = (120000 / mockTotalDuration) * 100; // 20%

    expect(Math.abs(metrics1!.waitWidth - expectedWaitWidth)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(metrics1!.activeWidth - expectedActiveWidth)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(metrics1!.startOffset - expectedStartOffset)).toBeLessThanOrEqual(0.001);
  });

  test('calculates active duration up to "now" for a node that is not Ready yet', () => {
    // Node created after 1 minute, NOT Ready yet (active duration should calculate up to "now")
    const mockNode2: ClaimTreeNode = {
      kind: 'Subnet',
      version: 'v1beta1',
      name: 'test-subnet',
      metaKind: 'Resource',
      manifest: {
        metadata: {
          name: 'test-subnet',
          creationTimestamp: '2026-06-13T12:01:00Z', // +1 minute offset
        },
        status: {
          conditions: [
            {
              type: 'Ready',
              status: 'False',
            },
          ],
        },
      },
    };

    const metrics2 = calculateTimelineMetrics(mockNode2, mockClaimStartTime, mockTotalDuration, mockNowTime);

    expect(metrics2).not.toBeNull();

    // Wait duration: 1 minute = 60,000 ms
    expect(metrics2!.waitDuration).toBe(60000);

    // Active provisioning duration calculated up to mockNowTime: (12:10 - 12:01) = 9 minutes = 540,000 ms
    expect(metrics2!.activeDuration).toBe(540000);
  });
});
