import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Library, Link2, Boxes, Server, Box, Cpu, Activity, Layers, CheckCircle2 } from 'lucide-react';
import { ListCompositions } from './components/ListCompositions';
import { ListClaims } from './components/ListClaims';
import { ClaimDetailsView } from './components/ClaimDetailsView';
import { ListXrds } from './components/ListXrds';
import { ListProviders } from './components/ListProviders';
import { ListFunctions } from './components/ListFunctions';
import { ListManagedResources } from './components/ListManagedResources';

import { useClaims } from './queries/useClaimQueries';
import { useCompositions } from './queries/useCompositionQueries';
import { useXrds } from './queries/useXrdQueries';
import { useProviders } from './queries/useProviderQueries';
import { useFunctions } from './queries/useFunctionQueries';
import { useManagedResourceKinds } from './queries/useManagedResourceQueries';

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
          <img src="/src/assets/crossplane-assistant.png" alt="logo" className="w-8 h-8" />
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

interface StatCardProps {
  title: string;
  count: number | undefined;
  readyCount: number;
  color: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  icon: React.ComponentType<any>;
  link: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  readyCount,
  color,
  icon: Icon,
  link,
  description,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
      text: 'text-blue-600',
      darkText: 'text-blue-800',
      bar: 'bg-blue-500',
      ring: 'hover:ring-blue-500/10 hover:shadow-blue-100/50',
      iconBg: 'bg-blue-100/80 text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
      text: 'text-purple-600',
      darkText: 'text-purple-800',
      bar: 'bg-purple-500',
      ring: 'hover:ring-purple-500/10 hover:shadow-purple-100/50',
      iconBg: 'bg-purple-100/80 text-purple-600',
    },
    emerald: {
      bg: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200',
      text: 'text-emerald-600',
      darkText: 'text-emerald-800',
      bar: 'bg-emerald-500',
      ring: 'hover:ring-emerald-500/10 hover:shadow-emerald-100/50',
      iconBg: 'bg-emerald-100/80 text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/50 border-amber-100 hover:border-amber-200',
      text: 'text-amber-600',
      darkText: 'text-amber-800',
      bar: 'bg-amber-500',
      ring: 'hover:ring-amber-500/10 hover:shadow-amber-100/50',
      iconBg: 'bg-amber-100/80 text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50/50 border-rose-100 hover:border-rose-200',
      text: 'text-rose-600',
      darkText: 'text-rose-800',
      bar: 'bg-rose-500',
      ring: 'hover:ring-rose-500/10 hover:shadow-rose-100/50',
      iconBg: 'bg-rose-100/80 text-rose-600',
    },
  };

  const c = colorMap[color];
  const hasData = count !== undefined && count !== null;
  const total = count || 0;
  const ratio = total > 0 ? Math.round((readyCount / total) * 100) : 100;

  return (
    <Link
      to={link}
      className={`block p-6 rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.ring} focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-2xl font-black ${c.darkText} font-mono`}>
          {hasData ? total : '...'}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 leading-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">{description}</p>
        </div>

        {hasData && total > 0 ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {readyCount} Ready / Active
              </span>
              <span>{ratio}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`${c.bar} h-full rounded-full transition-all duration-500`}
                style={{ width: `${ratio}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-1.5 pt-1 border-t border-slate-50">
            No active resources in cluster
          </div>
        )}
      </div>
    </Link>
  );
};

const DashboardLanding: React.FC = () => {
  const { data: claims } = useClaims();
  const { data: compositions } = useCompositions();
  const { data: xrds } = useXrds();
  const { data: providers } = useProviders();
  const { data: functions } = useFunctions();
  const { data: mrKinds } = useManagedResourceKinds();

  // Calculate metrics
  const claimsReady = claims?.filter((c: any) =>
    c.status?.conditions?.some((cond: any) => cond.type === 'Ready' && cond.status === 'True')
  ).length || 0;

  const xrdsReady = xrds?.filter((x: any) =>
    x.status?.conditions?.some((cond: any) => cond.type === 'Established' && cond.status === 'True')
  ).length || 0;

  const providersReady = providers?.filter((p: any) =>
    p.status?.conditions?.some((cond: any) => cond.type === 'Healthy' && cond.status === 'True')
  ).length || 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none select-none">
          <img src="/src/assets/crossplane-assistant.png" alt="logo" className="w-96 h-90" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-blue-500/30">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Control Plane Copilot
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Bienvenue sur Crossplane Assistant !
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Visualisez, inspectez et pilotez vos topologies de ressources composites en temps réel.
            Explorez les abstractions Kubernetes de votre cluster d'un seul coup d'œil.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" /> État Général du Plan de Contrôle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Claims"
            count={claims?.length}
            readyCount={claimsReady}
            color="blue"
            icon={Library}
            link="/explore/claims"
            description="Demandes d'infrastructure Kubernetes crées en libre-service."
          />
          <StatCard
            title="Compositions"
            count={compositions?.length}
            readyCount={compositions?.length || 0}
            color="purple"
            icon={Link2}
            link="/explore/compositions"
            description="Recettes décrivant l'assemblage de ressources cloud réelles."
          />
          <StatCard
            title="Composite Resource Definitions (XRDs)"
            count={xrds?.length}
            readyCount={xrdsReady}
            color="amber"
            icon={Server}
            link="/explore/xrds"
            description="Schémas d'API définissant de nouveaux types de ressources d'infra."
          />
          <StatCard
            title="Providers"
            count={providers?.length}
            readyCount={providersReady}
            color="rose"
            icon={Box}
            link="/explore/providers"
            description="Extensions étendant l'API K8s pour piloter des APIs externes (AWS, GCP, ...)"
          />
          <StatCard
            title="Functions"
            count={functions?.length}
            readyCount={functions?.length || 0}
            color="blue"
            icon={Cpu}
            link="/explore/functions"
            description="Algorithmes de composition de ressources dynamiques (ex: go-templating)."
          />
          <StatCard
            title="Managed Resource Kinds"
            count={mrKinds?.length}
            readyCount={mrKinds?.length || 0}
            color="emerald"
            icon={Boxes}
            link="/explore/managed-resources"
            description="Types de ressources d'infrastructure cloud individuelles gérées."
          />
        </div>
      </div>

      {/* Conceptual Pipeline Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" /> Pipeline Conceptuel Crossplane
          </h2>
          <p className="text-xs text-slate-500">
            Découvrez comment vos requêtes de haut niveau (Claims) sont transformées en ressources cloud réelles via les abstractions de la plateforme.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch pt-4">
          {/* Step 1: Claim */}
          <div className="p-5 border border-blue-100 bg-blue-50/20 rounded-2xl flex flex-col justify-between space-y-3 relative hover:border-blue-200 transition-colors">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Étape 1: Demande</span>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Library className="w-4 h-4 text-blue-500" /> Claim (XRC)
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                Définie par le développeur applicatif : "Je souhaite obtenir une base de données PostgreSQL de taille standard."
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-600 bg-blue-100/50 p-1.5 rounded text-center">
              my-db (claim)
            </div>
          </div>

          {/* Step 2: XRD */}
          <div className="p-5 border border-purple-100 bg-purple-50/20 rounded-2xl flex flex-col justify-between space-y-3 relative hover:border-purple-200 transition-colors">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-500 tracking-wider">Étape 2: Définition</span>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-500" /> XRD
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                Définit l'API et le contrat : les propriétés autorisées (ex: stockage, région) et génère la CRD personnalisée.
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-600 bg-purple-100/50 p-1.5 rounded text-center">
              XPostgreSQLInstance
            </div>
          </div>

          {/* Step 3: Composition */}
          <div className="p-5 border border-purple-100 bg-purple-50/20 rounded-2xl flex flex-col justify-between space-y-3 relative hover:border-purple-200 transition-colors">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-500 tracking-wider">Étape 3: Recette</span>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-purple-500" /> Composition
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                Définit comment assembler les vrais composants : RDS PostgreSQL, groupes de sécurité, politiques IAM, etc.
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-600 bg-purple-100/50 p-1.5 rounded text-center">
              postgres-aws-prod
            </div>
          </div>

          {/* Step 4: Managed Resource */}
          <div className="p-5 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex flex-col justify-between space-y-3 relative hover:border-emerald-200 transition-colors">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Étape 4: Cloud réel</span>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-500" /> Managed Resources (MRs)
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                Les objets Kubernetes unitaires gérés par les Providers (ex: AWS RDS instance) représentant les ressources physiques.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-600 bg-emerald-100/50 p-1.5 rounded text-center">
              RDSInstance (AWS)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<DashboardLanding />} />
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
