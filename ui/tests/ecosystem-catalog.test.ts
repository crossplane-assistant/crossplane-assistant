import { CURATED_PRESETS, mergeEcosystemData } from '../src/utils/ecosystemCatalog';

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
});
