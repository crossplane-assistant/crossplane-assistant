/**
 * Determines if a Kubernetes or Crossplane resource is healthy and ready.
 * It evaluates standard conditions (such as 'Ready', 'Healthy', 'Established', 'Synced')
 * present in the resource's `.status.conditions` array.
 */
export const isResourceHealthy = (resource: any): boolean => {
  if (!resource) return false;

  const conditions = resource?.status?.conditions || [];
  if (conditions.length === 0) {
    // If a resource has no conditions field (like Compositions or Functions), we assume it is healthy
    return true;
  }

  // Critical status conditions that indicate global health or readiness in Crossplane/Kubernetes
  const criticalTypes = ['Ready', 'Healthy', 'Established', 'Synced'];

  const criticalConditions = conditions.filter((cond: any) =>
    criticalTypes.includes(cond.type)
  );

  // If no critical conditions are found, but other conditions are present, default to true
  if (criticalConditions.length === 0) {
    return true;
  }

  // To be fully healthy, all critical conditions that are present MUST be 'True'
  return criticalConditions.every((cond: any) => cond.status === 'True');
};
