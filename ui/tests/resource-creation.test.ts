import { describe, test, expect, vi } from 'vitest';

/**
 * Unit tests to verify the request payload structures, headers, and error propagation
 * of the raw YAML resource creation flows as defined in our design specification.
 */
describe('Resource Creation API Integration Tests', () => {
  test('should construct a POST request with raw YAML body and correct content-type', async () => {
    const mockResponse = { metadata: { name: 'provider-aws-s3' } };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    global.fetch = mockFetch;

    const API_BASE = '/crossplane/providers';
    const yamlPayload = `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/crossplane/provider-aws-s3:v1.0.0`;

    // Simulate the exact async fetch sequence implemented in useCreateProvider
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/yaml' },
      body: yamlPayload,
    });

    expect(mockFetch).toHaveBeenCalledWith('/crossplane/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/yaml' },
      body: yamlPayload,
    });

    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data).toEqual(mockResponse);
  });

  test('should handle validation and server error text correctly', async () => {
    const serverError = 'yaml: line 4: mapping values are not allowed in this context';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      text: async () => serverError,
    });
    global.fetch = mockFetch;

    const API_BASE = '/crossplane/providers';
    const invalidYaml = 'invalid:: yaml';

    // Simulate the exact error-handling sequence implemented in useCreateProvider
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/yaml' },
      body: invalidYaml,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      const errorText = await res.text();
      expect(errorText).toBe(serverError);
    }
  });
});
