/**
 * Extracts the package version tag or shortened digest from a Crossplane package image identifier.
 * 
 * Examples:
 * - 'xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.3.0' -> 'v0.3.0'
 * - 'provider-kubernetes:v1.0.0@sha256:abc1234...' -> 'v1.0.0'
 * - 'provider-kubernetes@sha256:abc1234...' -> 'abc1234'
 * - 'provider-kubernetes' -> 'latest'
 * - undefined / '' -> 'Unknown'
 */
export const getPackageVersion = (packageImage?: string): string => {
  if (!packageImage) return 'Unknown';

  // Separate the base image + tag from the digest if '@' is present
  let imagePart = packageImage;
  let digestPart = '';
  if (packageImage.includes('@')) {
    const parts = packageImage.split('@');
    imagePart = parts[0];
    digestPart = parts[1];
  }

  // Find the tag in the image part
  const colonIndex = imagePart.lastIndexOf(':');
  if (colonIndex !== -1) {
    const tag = imagePart.substring(colonIndex + 1);
    if (tag) return tag;
  }

  // If no tag is present but we have a digest, return a shortened digest
  if (digestPart) {
    if (digestPart.startsWith('sha256:')) {
      return digestPart.substring(7, 15); // First 8 chars of hash
    }
    return digestPart.substring(0, 8);
  }

  return 'latest';
};
