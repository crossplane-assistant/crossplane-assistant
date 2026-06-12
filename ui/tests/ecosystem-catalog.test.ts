import { CURATED_PRESETS, mergeEcosystemData, injectVersionIntoYaml } from '../src/utils/ecosystemCatalog';

describe('Ecosystem Catalog Utilities', () => {
  test('mergeEcosystemData handles offline fallback (empty gitHubRepos)', () => {
    const result = mergeEcosystemData(CURATED_PRESETS, []);
    expect(result.length).toBe(CURATED_PRESETS.length);
    expect(result.every(item => item.isCommunity === false)).toBe(true);
  });

  test('mergeEcosystemData handles live enrichment of curated items', () => {
    const mockGithub = [
      {
        name: 'function-go-templating',
        stargazers_count: 150,
        description: 'Enriched description'
      }
    ];
    const result = mergeEcosystemData(CURATED_PRESETS, mockGithub);
    const goTemplating = result.find(item => item.id === 'function-go-templating');
    
    expect(goTemplating).toBeDefined();
    expect(goTemplating?.stars).toBe(150);
    expect(goTemplating?.isCommunity).toBe(false);
  });

  test('mergeEcosystemData automatically generates community items', () => {
    const mockGithub = [
      {
        name: 'function-new-and-shiny',
        stargazers_count: 5,
        description: 'A new shiny function'
      },
      {
        name: 'provider-gcp-gcs',
        stargazers_count: 24,
        description: 'GCS Provider'
      }
    ];
    const result = mergeEcosystemData(CURATED_PRESETS, mockGithub);
    
    const newShiny = result.find(item => item.id === 'function-new-and-shiny');
    expect(newShiny).toBeDefined();
    expect(newShiny?.isCommunity).toBe(true);
    expect(newShiny?.category).toBe('function');
    expect(newShiny?.yamlTemplate).toContain('kind: Function');

    const gcpGcs = result.find(item => item.id === 'provider-gcp-gcs');
    expect(gcpGcs).toBeDefined();
    expect(gcpGcs?.isCommunity).toBe(true);
    expect(gcpGcs?.category).toBe('provider');
    expect(gcpGcs?.yamlTemplate).toContain('kind: Provider');
  });

  test('mergeEcosystemData filters out archived or deprecated community repositories', () => {
    const mockGithub = [
      {
        name: 'function-cue-archived', // archived suffix name
        stargazers_count: 12,
        archived: true,
      },
      {
        name: 'function-deprecated-engine', // deprecated name
        stargazers_count: 5,
        description: 'No longer maintained',
      },
      {
        name: 'provider-dead-community',
        stargazers_count: 3,
        description: 'DEPRECATED: Use provider-helm instead' // deprecated description
      },
      {
        name: 'function-active-community', // active community
        stargazers_count: 45,
        archived: false,
        description: 'Active CUE interpreter'
      }
    ];

    const result = mergeEcosystemData(CURATED_PRESETS, mockGithub);

    // Filtered items should NOT be present
    expect(result.find(item => item.id === 'function-cue-archived')).toBeUndefined();
    expect(result.find(item => item.id === 'function-deprecated-engine')).toBeUndefined();
    expect(result.find(item => item.id === 'provider-dead-community')).toBeUndefined();

    // Active community item SHOULD be present
    expect(result.find(item => item.id === 'function-active-community')).toBeDefined();
  });

  test('mergeEcosystemData badges archived curated items rather than hiding them', () => {
    const mockGithub = [
      {
        name: 'function-go-templating', // Curated item, archived on github
        stargazers_count: 220,
        archived: true,
      }
    ];

    const result = mergeEcosystemData(CURATED_PRESETS, mockGithub);
    const goTemplating = result.find(item => item.id === 'function-go-templating');

    // Should still be present because it is curated
    expect(goTemplating).toBeDefined();
    // But should be flagged as archived
    expect(goTemplating?.isArchived).toBe(true);
  });

  test('injectVersionIntoYaml correctly substitutes package versions', () => {
    const defaultYaml = `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-go-templating
spec:
  package: xpkg.upbound.io/crossplane-contrib/function-go-templating:v0.4.0`;

    const freshYaml = injectVersionIntoYaml(defaultYaml, 'v0.6.2');
    expect(freshYaml).toContain('package: xpkg.upbound.io/crossplane-contrib/function-go-templating:v0.6.2');
    expect(freshYaml).not.toContain(':v0.4.0');
  });
});
