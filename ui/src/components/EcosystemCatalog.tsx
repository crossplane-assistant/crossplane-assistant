import React, { useState, useEffect } from 'react';
import { Search, Star, BookOpen, Download, ExternalLink, Sparkles } from 'lucide-react';
import { CURATED_PRESETS, mergeEcosystemData, EcosystemItem, injectVersionIntoYaml, CURATED_VERSION_CACHE } from '../utils/ecosystemCatalog';

interface EcosystemCatalogProps {
  category: 'provider' | 'function';
  onInstall: (item: EcosystemItem) => void;
}

export const EcosystemCatalog: React.FC<EcosystemCatalogProps> = ({ category, onInstall }) => {
  const [items, setItems] = useState<EcosystemItem[]>(() =>
    CURATED_PRESETS.filter(item => item.category === category)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingItemId, setFetchingItemId] = useState<string | null>(null);
  const [liveVersions, setLiveVersions] = useState<Record<string, string>>(() => ({ ...CURATED_VERSION_CACHE }));

  const handleInstallClick = async (item: EcosystemItem) => {
    // If we have a cached version for this curated preset, bypass fetching and open instantly
    const cachedVersion = CURATED_VERSION_CACHE[item.id];
    if (cachedVersion) {
      const updatedItem: EcosystemItem = {
        ...item,
        defaultVersion: cachedVersion,
        yamlTemplate: injectVersionIntoYaml(item.yamlTemplate, cachedVersion),
      };
      onInstall(updatedItem);
      return;
    }

    if (!navigator.onLine) {
      onInstall(item);
      return;
    }

    setFetchingItemId(item.id);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds max

      const response = await fetch(
        `https://api.github.com/repos/crossplane-contrib/${item.id}/releases/latest`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const release = await response.json();
        if (release && release.tag_name) {
          CURATED_VERSION_CACHE[item.id] = release.tag_name;
          const updatedItem: EcosystemItem = {
            ...item,
            defaultVersion: release.tag_name,
            yamlTemplate: injectVersionIntoYaml(item.yamlTemplate, release.tag_name),
          };
          onInstall(updatedItem);
          return;
        }
      }
    } catch (err) {
      console.warn(`Dynamic version fetch failed for ${item.id}, using preset fallback:`, err);
    } finally {
      setFetchingItemId(null);
    }

    // Default fallback
    onInstall(item);
  };

  useEffect(() => {
    if (!navigator.onLine) {
      return;
    }

    let active = true;

    // Fetch dynamic versions for each curated item on current page in the background
    items.forEach(async (item) => {
      if (item.isCommunity) return;
      if (CURATED_VERSION_CACHE[item.id]) return; // Already cached!

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds max
        const res = await fetch(`https://api.github.com/repos/crossplane-contrib/${item.id}/releases/latest`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const release = await res.json();
          if (active && release && release.tag_name) {
            CURATED_VERSION_CACHE[item.id] = release.tag_name;
            setLiveVersions(prev => ({
              ...prev,
              [item.id]: release.tag_name,
            }));
          }
        }
      } catch (err) {
        // Silently ignore background version fetch errors to protect user experience
      }
    });

    return () => {
      active = false;
    };
  }, [items]);

  useEffect(() => {
    let active = true;

    const fetchEcosystem = async () => {
      if (!navigator.onLine) {
        return;
      }

      setIsLoading(true);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://api.github.com/orgs/crossplane-contrib/repos?per_page=100', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`GitHub API returned status ${response.status}`);
        }

        const data = await response.json();

        if (active && Array.isArray(data)) {
          const merged = mergeEcosystemData(CURATED_PRESETS, data);
          setItems(merged.filter(item => item.category === category));
        }
      } catch (err) {
        // Fall back gracefully with warning, swallowed silently as mandated
        console.warn('Ecosystem dynamic fetch skipped/failed, using offline presets:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchEcosystem();

    return () => {
      active = false;
    };
  }, [category]);

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.shortDesc.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder={`Search public ${category}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        />
      </div>

      {isLoading && (
        <div className="text-xs text-blue-500 animate-pulse font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Refreshing catalog from GitHub...
        </div>
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 flex-1 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-slate-800 text-sm font-mono truncate" title={item.name}>
                  {item.id}
                </h3>
                {item.stars !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-current" /> {item.stars}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {item.isCommunity ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                    Community
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                    <Sparkles className="w-3 h-3 text-green-500 fill-current" /> Curated Preset
                  </span>
                )}
                {item.isArchived && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ⚠️ Archived
                  </span>
                )}
                <span
                  key={liveVersions[item.id] || item.defaultVersion}
                  className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 animate-fadeIn transition-all duration-300"
                >
                  {liveVersions[item.id] || item.defaultVersion}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {item.shortDesc}
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 mt-auto">
              <a
                href={item.docUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> Read Docs <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                onClick={() => handleInstallClick(item)}
                disabled={fetchingItemId !== null}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs ${
                  fetchingItemId === item.id
                    ? 'bg-slate-400 text-white cursor-wait animate-pulse'
                    : item.isArchived
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {fetchingItemId === item.id ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    {item.isArchived ? 'Legacy Preset' : (item.isCommunity ? 'Auto-Config' : 'Use Preset')}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No matching ecosystem items found.
          </div>
        )}
      </div>
    </div>
  );
};
