import React from 'react';

interface LogoViewerProps {
  apiVersion?: string;
  kind?: string;
}

export const getLogoUrl = (apiVersion: string = '', kind: string = ''): string => {
  const apiLower = apiVersion.toLowerCase();
  const kindLower = kind.toLowerCase();

  if (apiLower.startsWith('kubernetes.crossplane.io') || kindLower === 'object') {
    return '/src/assets/logo/kubernetes.png';
  }
  if (apiLower.startsWith('tf.crossplane.io') || apiLower.includes('terraform')) {
    return '/src/assets/logo/terraform.png';
  }
  if (apiLower.includes('postgresql')) {
    return '/src/assets/logo/postgresql.png';
  }
  if (apiLower.includes('mongodb')) {
    return '/src/assets/logo/mongodb.png';
  }
  if (apiLower.includes('gcp') || apiLower.includes('google')) {
    return '/src/assets/logo/gcp.png';
  }
  if (apiLower.includes('cloudflare')) {
    return '/src/assets/logo/cloudflare.png';
  }
  if (apiLower.includes('aiven')) {
    return '/src/assets/logo/aiven.png';
  }
  if (apiLower.includes('external-secrets')) {
    return '/src/assets/logo/external-secrets.png';
  }
  if (apiLower.includes('external-dns')) {
    return '/src/assets/logo/external-dns.png';
  }
  return '/src/assets/logo/generic.png';
};

export const LogoViewer: React.FC<LogoViewerProps> = ({ apiVersion = '', kind = '' }) => {
  const logoUrl = getLogoUrl(apiVersion, kind);

  return (
    <img
      src={logoUrl}
      alt={`${kind} logo`}
      className="w-full h-full object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/src/assets/logo/generic.png';
      }}
    />
  );
};
