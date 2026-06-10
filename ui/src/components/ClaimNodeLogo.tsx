import React, { useState } from 'react';
import { getLogoUrl } from './LogoViewer';

interface ClaimNodeLogoProps {
  apiVersion?: string;
  kind?: string;
}

const COLOR_THEMES = [
  { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { bg: 'bg-violet-50 border-violet-200 text-violet-700' },
  { bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  { bg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
  { bg: 'bg-pink-50 border-pink-200 text-pink-700' },
  { bg: 'bg-rose-50 border-rose-200 text-rose-700' },
  { bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { bg: 'bg-teal-50 border-teal-200 text-teal-700' },
  { bg: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { bg: 'bg-sky-50 border-sky-200 text-sky-700' },
];

function getThemeByKind(kind: string): { bg: string } {
  let hash = 0;
  for (let i = 0; i < kind.length; i++) {
    hash = kind.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_THEMES.length;
  return COLOR_THEMES[index];
}

function getInitials(kind: string): string {
  if (!kind) return '';
  const initials = kind.replace(/[^A-Z]+/g, '');
  return initials || kind.charAt(0).toUpperCase();
}

function getFontSizeClass(length: number): string {
  if (length <= 1) return 'text-sm font-semibold';
  if (length === 2) return 'text-xs font-semibold';
  if (length === 3) return 'text-[10px] font-bold';
  return 'text-[8px] font-extrabold';
}

export const ClaimNodeLogo: React.FC<ClaimNodeLogoProps> = ({
  apiVersion = '',
  kind = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const logoUrl = getLogoUrl(apiVersion, kind);
  const isGeneric = logoUrl.endsWith('generic.png');

  const initials = getInitials(kind);
  const theme = getThemeByKind(kind || apiVersion);
  const fontSizeClass = getFontSizeClass(initials.length);

  if (isGeneric || imgError) {
    return (
      <div
        className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm select-none transition-all ${theme.bg}`}
        title={`${kind} (${apiVersion})`}
      >
        <span className={fontSizeClass}>{initials}</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
      <img
        src={logoUrl}
        alt={kind}
        className="w-full h-full object-contain"
        onError={() => setImgError(true)}
      />
    </div>
  );
};
