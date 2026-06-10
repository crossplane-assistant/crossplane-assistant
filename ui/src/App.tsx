import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Library, Link2, Boxes, Server, Box, Cpu } from 'lucide-react';
import { ListCompositions } from './components/ListCompositions';
import { ListClaims } from './components/ListClaims';
import { ClaimDetailsView } from './components/ClaimDetailsView';
import { ListXrds } from './components/ListXrds';
import { ListProviders } from './components/ListProviders';
import { ListFunctions } from './components/ListFunctions';
import { ListManagedResources } from './components/ListManagedResources';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Sidebar layout wrapper
const ExplorerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/explore/claims', label: 'Claim', icon: Library, title: 'Claim' },
    { path: '/explore/compositions', label: 'Composition', icon: Link2, title: 'Composition' },
    { path: '/explore/managed-resources', label: 'Managed Resource', icon: Boxes, title: 'Managed Resource' },
    { path: '/explore/xrds', label: 'XRD', icon: Server, title: 'XRD' },
    { path: '/explore/providers', label: 'Provider', icon: Box, title: 'Provider' },
    { path: '/explore/functions', label: 'Function', icon: Cpu, title: 'Function' },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img src="/src/assets/crossplane-assistant.svg" alt="logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">Crossplane Assistant</span>
        </div>
        <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Explorer</div>
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.title}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main page wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<Link to="/explore/xrds" className="text-blue-500 hover:underline">Go to Explorer</Link>} />
        <Route path="/explore/claims" element={<ListClaims />} />
        <Route path="/explore/claims/:ref" element={<ClaimDetailsView />} />
        {/* We route "/explore/compositions" to the real ListCompositions component */}
        <Route path="/explore/compositions" element={<ListCompositions />} />
        <Route path="/explore/managed-resources" element={<ListManagedResources />} />
        <Route path="/explore/xrds" element={<ListXrds />} />
        <Route path="/explore/providers" element={<ListProviders />} />
        <Route path="/explore/functions" element={<ListFunctions />} />
        <Route path="*" element={<div className="p-8 text-center text-red-500">Not Found</div>} />
      </Routes>
    </ExplorerLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
