import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { Search, Trash2, X, BookOpen } from 'lucide-react';

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

interface ResourceListViewProps<T> {
  title: string;
  description: string;
  docLink?: { label: string; url: string };
  data: T[];
  isLoading: boolean;
  error: Error | null;
  columns: Column<T>[];
  getRowName: (item: T) => string;
  onDelete?: (item: T) => Promise<void>;
  createButton?: React.ReactNode;
  renderDetailView?: (item: T) => React.ReactNode;
  filterFn?: (item: T, searchTerm: string) => boolean;
  headerRightArea?: React.ReactNode; // Optional dropdown/selectors in table header
}

export function ResourceListView<T>({
  title,
  description,
  docLink,
  data,
  isLoading,
  error,
  columns,
  getRowName,
  onDelete,
  createButton,
  renderDetailView,
  filterFn,
  headerRightArea,
}: ResourceListViewProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [activeTab, setActiveTab] = useState<string>('view');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Escape key listener to close sliding details drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDelete = (item: T) => {
    const name = getRowName(item);
    if (confirm(`Are you sure you want to delete ${name}?`) && onDelete) {
      onDelete(item).then(() => {
        setSelectedItem(null);
      }).catch((err) => {
        alert(`Delete failed: ${err.message}`);
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-semibold">Loading {title}...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg">Error Loading {title}</h3>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  const safeData = data || [];
  const filteredData = filterFn
    ? safeData.filter((item) => filterFn(item, searchTerm))
    : safeData.filter((item) => {
        const name = getRowName(item).toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            {description}{' '}
            {docLink && (
              <a
                href={docLink.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1 font-medium"
              >
                {docLink.label} <BookOpen className="w-3.5 h-3.5" />
              </a>
            )}
          </p>
        </div>
        {createButton}
      </div>

      {/* Filter and Table container */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="relative max-w-md flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </div>
          {headerRightArea}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className="p-4">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.map((item, idx) => {
                const name = getRowName(item);
                const isSelected = selectedItem && getRowName(selectedItem) === name;
                return (
                  <tr
                    key={name || idx}
                    onClick={() => {
                      setSelectedItem(item);
                      setActiveTab(renderDetailView ? 'view' : 'manifest');
                    }}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-4">{col.render(item)}</td>
                    ))}
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-slate-400 italic bg-slate-50/50">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sliding detail drawer */}
      {selectedItem && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 animate-fadeIn"
            onClick={() => setSelectedItem(null)}
          />
          <div className="fixed inset-y-0 right-0 w-[650px] bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-slideIn">
          {/* Header */}
          <div className="p-6 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-800 text-lg font-mono">
                {getRowName(selectedItem)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {onDelete && (
                <button
                  onClick={() => handleDelete(selectedItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Tabs.List className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6">
              {renderDetailView && (
                <Tabs.Trigger
                  value="view"
                  className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
                >
                  View
                </Tabs.Trigger>
              )}
              <Tabs.Trigger
                value="manifest"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
              >
                Manifest
              </Tabs.Trigger>
              <Tabs.Trigger
                value="event"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
              >
                Event
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tabs content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderDetailView && (
                <Tabs.Content value="view" className="animate-fadeIn">
                  {renderDetailView(selectedItem)}
                </Tabs.Content>
              )}

              <Tabs.Content value="manifest" className="h-[450px] border border-slate-200 rounded-lg overflow-hidden shadow-inner">
                <MonacoEditor
                  height="100%"
                  language="yaml"
                  theme="vs-light"
                  value={stringify(selectedItem)}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </Tabs.Content>

              <Tabs.Content value="event" className="animate-fadeIn space-y-4">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Resource Events</div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 italic text-center text-xs">
                  No recent events for this resource.
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
        </>
      )}
    </div>
  );
}
