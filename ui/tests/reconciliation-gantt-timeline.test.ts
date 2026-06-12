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

// Simple test runner for compilation and static verification
export function runMathTests() {
  console.log('Starting Reconciliation Gantt Timeline math validation tests...');

  const mockClaimStartTime = new Date('2026-06-13T12:00:00Z').getTime();
  const mockNowTime = new Date('2026-06-13T12:10:00Z').getTime(); // 10 minutes later
  const mockTotalDuration = 10 * 60 * 1000; // 10 minutes in ms

  // Test Case 1: Node created after 2 minutes, Ready after 5 minutes (total 7 minutes since claim start)
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

  if (!metrics1) {
    throw new Error('Test Case 1 failed: metrics came back null');
  }

  // Assert wait duration: 2 minutes = 120,000 ms
  if (metrics1.waitDuration !== 120000) {
    throw new Error(`Test Case 1 failed: Expected waitDuration 120000, got ${metrics1.waitDuration}`);
  }

  // Assert active provisioning duration: 5 minutes = 300,000 ms
  if (metrics1.activeDuration !== 300000) {
    throw new Error(`Test Case 1 failed: Expected activeDuration 300000, got ${metrics1.activeDuration}`);
  }

  // Assert percentages
  const expectedWaitWidth = (120000 / mockTotalDuration) * 100; // 20%
  const expectedActiveWidth = (300000 / mockTotalDuration) * 100; // 50%
  const expectedStartOffset = (120000 / mockTotalDuration) * 100; // 20%

  if (Math.abs(metrics1.waitWidth - expectedWaitWidth) > 0.001) {
    throw new Error(`Test Case 1 failed: Expected waitWidth ${expectedWaitWidth}%, got ${metrics1.waitWidth}%`);
  }

  if (Math.abs(metrics1.activeWidth - expectedActiveWidth) > 0.001) {
    throw new Error(`Test Case 1 failed: Expected activeWidth ${expectedActiveWidth}%, got ${metrics1.activeWidth}%`);
  }

  if (Math.abs(metrics1.startOffset - expectedStartOffset) > 0.001) {
    throw new Error(`Test Case 1 failed: Expected startOffset ${expectedStartOffset}%, got ${metrics1.startOffset}%`);
  }

  // Test Case 2: Node created after 1 minute, NOT Ready yet (active duration should calculate up to "now")
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

  if (!metrics2) {
    throw new Error('Test Case 2 failed: metrics came back null');
  }

  // Assert wait duration: 1 minute = 60,000 ms
  if (metrics2.waitDuration !== 60000) {
    throw new Error(`Test Case 2 failed: Expected waitDuration 60000, got ${metrics2.waitDuration}`);
  }

  // Assert active provisioning duration calculated up to mockNowTime: (12:10 - 12:01) = 9 minutes = 540,000 ms
  if (metrics2.activeDuration !== 540000) {
    throw new Error(`Test Case 2 failed: Expected activeDuration 540000, got ${metrics2.activeDuration}`);
  }

  console.log('✓ All Reconciliation Gantt Timeline math validation tests passed successfully!');
}
