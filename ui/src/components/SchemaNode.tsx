import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface SchemaNodeProps {
  name: string;
  schema: any;
  isRequired?: boolean;
  depth?: number;
}

export const SchemaNode: React.FC<SchemaNodeProps> = ({
  name,
  schema,
  isRequired = false,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!schema) return null;

  const type = schema.type || 'object';
  const description = schema.description || '';
  const properties = schema.properties;
  const items = schema.items;
  const requiredFields = schema.required || [];

  // Determine if this property has children to render
  const isObjectWithProps = type === 'object' && properties && Object.keys(properties).length > 0;
  const isArrayWithProps = type === 'array' && items && items.type === 'object' && items.properties && Object.keys(items.properties).length > 0;
  const hasChildren = isObjectWithProps || isArrayWithProps;

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="font-mono text-[11px] leading-relaxed select-text" style={{ marginLeft: depth > 0 ? '14px' : '0px' }}>
      {/* Property Row */}
      <div 
        onClick={hasChildren ? toggleOpen : undefined}
        className={`flex items-start gap-1.5 py-1 px-1.5 rounded-md transition-colors ${
          hasChildren ? 'cursor-pointer hover:bg-slate-50' : ''
        }`}
      >
        {/* Expand / Collapse Chevron */}
        {hasChildren ? (
          <button 
            onClick={toggleOpen}
            className="mt-0.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded transition-colors focus:outline-none cursor-pointer"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-4.5" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {/* Property Name */}
            <span className="font-bold text-slate-800 text-xs tracking-tight">{name}</span>

            {/* Type Tag */}
            <span className="text-[10px] font-semibold px-1 py-0.2 bg-slate-100/80 border border-slate-200 text-slate-600 rounded">
              {type === 'array' && items?.type ? `array of ${items.type}` : type}
            </span>

            {/* Required Indicator */}
            {isRequired && (
              <span className="text-[9px] font-extrabold px-1 py-0.2 bg-red-50 border border-red-200 text-red-600 rounded-sm uppercase tracking-wide">
                required
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mt-1 font-sans text-xs text-slate-500 max-w-full leading-normal text-justify">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Recursive Children Renders */}
      {isOpen && (
        <div className="mt-0.5 pl-2 border-l border-dashed border-slate-200/60 space-y-1">
          {/* Object Properties */}
          {isObjectWithProps &&
            Object.entries(properties).map(([propName, propSchema]: [string, any]) => (
              <SchemaNode
                key={propName}
                name={propName}
                schema={propSchema}
                isRequired={requiredFields.includes(propName)}
                depth={depth + 1}
              />
            ))}

          {/* Array Items Properties */}
          {isArrayWithProps && (
            <div className="mt-1">
              <div className="text-[10px] text-slate-400 italic pl-5 mb-1 select-none">Array Items Schema:</div>
              {Object.entries(items.properties).map(([propName, propSchema]: [string, any]) => (
                <SchemaNode
                  key={propName}
                  name={propName}
                  schema={propSchema}
                  isRequired={(items.required || []).includes(propName)}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
