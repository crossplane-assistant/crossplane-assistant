import React, { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';

interface ResourcePanelProps {
  resourceType: string;
  resource: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resourceType, resource, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden mb-4 transition-all duration-200 hover:border-slate-300"
    >
      <Collapsible.Trigger asChild>
        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center gap-4">
            <img
              className="w-9 h-9 object-contain"
              src={`/src/assets/logo/${resourceType}.png`}
              alt={resourceType}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/logo/generic.png';
              }}
            />
            <div>
              <div className="font-semibold text-slate-800 text-sm">Name: {resource.name || resource.metadata?.name}</div>
              <div className="text-xs text-slate-500">ApiVersion: {resource.base?.apiVersion || resource.apiVersion}</div>
              <div className="text-xs text-slate-500">Kind: {resource.base?.kind || resource.kind}</div>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
        <div className="p-4 border-t border-slate-100 bg-white">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
