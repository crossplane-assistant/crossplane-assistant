export interface EcosystemItem {
  id: string; // e.g. 'function-go-templating' or 'provider-kubernetes'
  name: string;
  category: 'provider' | 'function';
  shortDesc: string;
  packageImage: string;
  defaultVersion: string;
  docUrl: string;
  yamlTemplate: string;
  stars?: number;
  isCommunity?: boolean;
  isArchived?: boolean;
}

export const CURATED_VERSION_CACHE: Record<string, string> = {};

export const CURATED_PRESETS: EcosystemItem[] = [
  // Curated Functions
  {
    id: 'function-patch-and-transform',
    name: 'Patch and Transform Function',
    category: 'function',
    shortDesc: 'The standard Crossplane function to compose resources using path-based patch & transform rules.',
    packageImage: 'xpkg.upbound.io/crossplane/function-patch-and-transform',
    defaultVersion: 'v0.3.0',
    docUrl: 'https://github.com/crossplane-contrib/function-patch-and-transform',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-patch-and-transform
spec:
  package: xpkg.upbound.io/crossplane/function-patch-and-transform:v0.3.0
`
  },
  {
    id: 'function-go-templating',
    name: 'Go Templating Function',
    category: 'function',
    shortDesc: 'Compose Crossplane resources using the powerful Go text/template syntax. Great for iteration and conditional logic.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/function-go-templating',
    defaultVersion: 'v0.4.0',
    docUrl: 'https://github.com/crossplane-contrib/function-go-templating',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-go-templating
spec:
  package: xpkg.upbound.io/crossplane-contrib/function-go-templating:v0.4.0
`
  },
  {
    id: 'function-cel-filter',
    name: 'CEL Filter Function',
    category: 'function',
    shortDesc: 'Validate, filter, or transform resources in Composition Functions using Common Expression Language (CEL).',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/function-cel-filter',
    defaultVersion: 'v0.1.0',
    docUrl: 'https://github.com/crossplane-contrib/function-cel-filter',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-cel-filter
spec:
  package: xpkg.upbound.io/crossplane-contrib/function-cel-filter:v0.1.0
`
  },
  {
    id: 'function-extra-resources',
    name: 'Extra Resources Function',
    category: 'function',
    shortDesc: 'Fetch additional resources from the Kubernetes API server during Composition execution to guide provisioning.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/function-extra-resources',
    defaultVersion: 'v0.2.0',
    docUrl: 'https://github.com/crossplane-contrib/function-extra-resources',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-extra-resources
spec:
  package: xpkg.upbound.io/crossplane-contrib/function-extra-resources:v0.2.0
`
  },
  {
    id: 'function-auto-ready',
    name: 'Auto Ready Function',
    category: 'function',
    shortDesc: 'Automatically detect and set readiness status on composed resources based on standard status fields.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/function-auto-ready',
    defaultVersion: 'v0.1.0',
    docUrl: 'https://github.com/crossplane-contrib/function-auto-ready',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-auto-ready
spec:
  package: xpkg.upbound.io/crossplane-contrib/function-auto-ready:v0.1.0
`
  },

  // Curated Providers
  {
    id: 'provider-kubernetes',
    name: 'Kubernetes Provider',
    category: 'provider',
    shortDesc: 'Provision, manage, and interact with raw Kubernetes resources (ConfigMaps, Deployments, CRDs) via Crossplane.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/provider-kubernetes',
    defaultVersion: 'v0.3.0',
    docUrl: 'https://github.com/crossplane-contrib/provider-kubernetes',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-kubernetes
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.3.0
`
  },
  {
    id: 'provider-helm',
    name: 'Helm Provider',
    category: 'provider',
    shortDesc: 'Manage and install Helm Charts and Releases declaratively within your Crossplane cluster compositions.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/provider-helm',
    defaultVersion: 'v0.19.0',
    docUrl: 'https://github.com/crossplane-contrib/provider-helm',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-helm
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-helm:v0.19.0
`
  },
  {
    id: 'provider-sql',
    name: 'SQL Provider',
    category: 'provider',
    shortDesc: 'Manage databases, schemas, users, and grants inside SQL database engines (PostgreSQL, MySQL, MSSQL).',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/provider-sql',
    defaultVersion: 'v0.9.0',
    docUrl: 'https://github.com/crossplane-contrib/provider-sql',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-sql
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-sql:v0.9.0
`
  },
  {
    id: 'provider-http',
    name: 'HTTP Provider',
    category: 'provider',
    shortDesc: 'Make HTTP requests (GET, POST, PUT, DELETE) dynamically during Crossplane composition reconciliation.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/provider-http',
    defaultVersion: 'v0.8.0',
    docUrl: 'https://github.com/crossplane-contrib/provider-http',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-http
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-http:v0.8.0
`
  },
  {
    id: 'provider-terraform',
    name: 'Terraform Provider',
    category: 'provider',
    shortDesc: 'Orchestrate existing Terraform workspaces and deploy Terraform modules as native Kubernetes/Crossplane resources.',
    packageImage: 'xpkg.upbound.io/crossplane-contrib/provider-terraform',
    defaultVersion: 'v0.15.0',
    docUrl: 'https://github.com/crossplane-contrib/provider-terraform',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-terraform
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-terraform:v0.15.0
`
  },
  {
    id: 'provider-aws-s3',
    name: 'AWS S3 Provider',
    category: 'provider',
    shortDesc: 'Official Upbound AWS S3 provider. Manage S3 buckets, object policies, and replication configurations.',
    packageImage: 'xpkg.upbound.io/upbound/provider-aws-s3',
    defaultVersion: 'v1.0.0',
    docUrl: 'https://marketplace.upbound.io/providers/upbound/provider-aws-s3',
    yamlTemplate: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.0.0
`
  }
];

export function formatLabel(repoName: string): string {
  const parts = repoName.split('-');
  const isFunction = parts[0] === 'function';
  const isProvider = parts[0] === 'provider';

  const words = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  if (isFunction) {
    return `${words.join(' ')} Function`;
  }
  if (isProvider) {
    return `${words.join(' ')} Provider`;
  }
  return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function generateDefaultYaml(category: 'provider' | 'function', name: string): string {
  const kind = category === 'provider' ? 'Provider' : 'Function';
  return `apiVersion: pkg.crossplane.io/v1
kind: ${kind}
metadata:
  name: ${name}
spec:
  package: xpkg.upbound.io/crossplane-contrib/${name}:latest
`;
}

export function isDeprecatedOrArchived(repo: any): boolean {
  if (repo.archived || repo.disabled) {
    return true;
  }

  const nameLower = repo.name.toLowerCase();
  if (nameLower.endsWith('-archived') || nameLower.includes('-deprecated')) {
    return true;
  }

  if (repo.description) {
    const descLower = repo.description.toLowerCase();
    if (
      descLower.includes('deprecated') ||
      descLower.includes('no longer maintained') ||
      descLower.includes('superseded by')
    ) {
      return true;
    }
  }

  return false;
}

export function mergeEcosystemData(
  localPresets: EcosystemItem[],
  gitHubRepos: any[]
): EcosystemItem[] {
  // If no internet or empty array, return curated local items with isCommunity = false
  if (!gitHubRepos || gitHubRepos.length === 0) {
    return localPresets.map(preset => ({ ...preset, isCommunity: false }));
  }

  const mergedList: EcosystemItem[] = [];
  const processedRepoNames = new Set<string>();

  // 1. Process curated items, enrich with live stars and descriptions if found
  for (const preset of localPresets) {
    const matchedRepo = gitHubRepos.find(r => r.name === preset.id);
    if (matchedRepo) {
      processedRepoNames.add(matchedRepo.name);
      mergedList.push({
        ...preset,
        stars: matchedRepo.stargazers_count,
        shortDesc: preset.shortDesc || matchedRepo.description,
        isCommunity: false,
        isArchived: preset.isArchived || isDeprecatedOrArchived(matchedRepo),
      });
    } else {
      mergedList.push({ ...preset, isCommunity: false });
    }
  }

  // 2. Process non-curated community items from github repos starting with function- or provider-
  for (const repo of gitHubRepos) {
    if (processedRepoNames.has(repo.name)) continue;
    if (isDeprecatedOrArchived(repo)) continue; // Filter out community archived/deprecated packages!

    let category: 'provider' | 'function' | null = null;
    if (repo.name.startsWith('function-')) {
      category = 'function';
    } else if (repo.name.startsWith('provider-')) {
      category = 'provider';
    }

    if (category) {
      mergedList.push({
        id: repo.name,
        name: formatLabel(repo.name),
        category,
        shortDesc: repo.description || `Community ${category} package from crossplane-contrib.`,
        packageImage: `xpkg.upbound.io/crossplane-contrib/${repo.name}`,
        defaultVersion: 'latest',
        docUrl: repo.html_url,
        stars: repo.stargazers_count,
        isCommunity: true,
        yamlTemplate: generateDefaultYaml(category, repo.name),
      });
    }
  }

  return mergedList;
}

export function injectVersionIntoYaml(yaml: string, version: string): string {
  return yaml.replace(/(package:\s+[\w\.\-\/]+:)([\w\.\-\+]+)/g, `$1${version}`);
}
