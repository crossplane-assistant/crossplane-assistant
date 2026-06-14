import { getPackageVersion } from '../src/utils/package';

describe('Package Version Utilities', () => {
  test('getPackageVersion extracts standard tags', () => {
    expect(getPackageVersion('xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.3.0')).toBe('v0.3.0');
    expect(getPackageVersion('xpkg.upbound.io/crossplane/function-patch-and-transform:v0.2.0')).toBe('v0.2.0');
    expect(getPackageVersion('crossplane/provider-aws:latest')).toBe('latest');
  });

  test('getPackageVersion extracts tags when digests are present', () => {
    expect(getPackageVersion('provider-kubernetes:v1.0.0@sha256:abc12347890')).toBe('v1.0.0');
    expect(getPackageVersion('xpkg.upbound.io/upbound/provider-aws-s3:v1.2.3@sha256:4f1a23b')).toBe('v1.2.3');
  });

  test('getPackageVersion returns shortened hash for digest-only images', () => {
    expect(getPackageVersion('provider-kubernetes@sha256:abc12347890')).toBe('abc12347');
    expect(getPackageVersion('provider-kubernetes@sha256:12345')).toBe('12345');
  });

  test('getPackageVersion defaults to latest when no tag or digest is present', () => {
    expect(getPackageVersion('provider-kubernetes')).toBe('latest');
    expect(getPackageVersion('xpkg.upbound.io/crossplane-contrib/provider-kubernetes')).toBe('latest');
  });

  test('getPackageVersion returns Unknown for empty or undefined inputs', () => {
    expect(getPackageVersion(undefined)).toBe('Unknown');
    expect(getPackageVersion('')).toBe('Unknown');
  });
});
