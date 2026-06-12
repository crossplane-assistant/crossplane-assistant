import React from 'react';
import { useSchema, parseApiVersion } from '../queries/useSchemaQueries';
import { SchemaNode } from './SchemaNode';
import { AlertTriangle, RefreshCw, BookOpen, Layers } from 'lucide-react';

interface SchemaBrowserProps {
  apiVersion: string;
  kind: string;
}

export const SchemaBrowser: React.FC<SchemaBrowserProps> = ({ apiVersion, kind }) => {
  const { data, isLoading, error, refetch } = useSchema(apiVersion, kind);
  const { group, version } = parseApiVersion(apiVersion);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 animate-pulse">
          Resolving OpenAPI Schema...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-red-150 rounded-xl bg-red-50/40 shadow-xs max-w-md mx-auto my-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-extrabold text-slate-800">Schema Not Found</h4>
            <p className="text-xs text-slate-500 leading-normal">
              The API schema for <code className="font-semibold text-slate-700">{kind}</code> ({version}) could not be resolved from your local cluster or external registry.
            </p>
            <p className="text-[10px] text-slate-400 italic">
              Reason: {(error as Error).message}
            </p>
            <div className="pt-2">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const properties = data?.properties;
  const description = data?.description;

  if (!properties || Object.keys(properties).length === 0) {
    return (
      <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center space-y-2">
        <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
        <h4 className="text-xs font-bold text-slate-600">Empty Schema Definition</h4>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-normal">
          This resource does not expose any schema validation properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schema Header Metadata Banner */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px] shadow-xs select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">API Coordinates</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          {group && (
            <>
              <span className="bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{group}</span>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">{version}</span>
          <span className="text-slate-300">/</span>
          <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">{kind}</span>
        </div>
      </div>

      {/* Top Level Schema Description */}
      {description && (
        <div className="text-xs text-slate-600 bg-blue-50/20 border-l-2 border-blue-500 p-3 rounded-r-lg leading-relaxed text-justify">
          <p className="font-semibold text-slate-800 mb-0.5 select-none">Resource Overview:</p>
          {description}
        </div>
      )}

      {/* Interactive Tree Section */}
      <div className="border border-slate-150 rounded-xl bg-white p-4 shadow-xs space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 select-none">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Properties Tree</span>
          <span className="text-[10px] text-slate-400">Click folders to expand</span>
        </div>
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {Object.entries(properties).map(([name, propSchema]: [string, any]) => (
            <SchemaNode
              key={name}
              name={name}
              schema={propSchema}
              isRequired={data.required?.includes(name)}
              depth={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
