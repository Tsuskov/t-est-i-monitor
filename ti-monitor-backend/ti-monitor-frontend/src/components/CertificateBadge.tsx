import React from 'react';
import type { CertSeverity } from '../types';

interface CertificateBadgeProps {
  daysRemaining: number;
  severity: CertSeverity;
}

export const CertificateBadge: React.FC<CertificateBadgeProps> = ({ daysRemaining, severity }) => {
  const getBgColor = (sev: CertSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-900 text-red-200';
      case 'warning':
        return 'bg-yellow-900 text-yellow-200';
      case 'ok':
        return 'bg-green-900 text-green-200';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const getIcon = (sev: CertSeverity) => {
    switch (sev) {
      case 'critical':
        return '⚠️';
      case 'warning':
        return '⏱️';
      case 'ok':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getBgColor(severity)}`}>
      <span>{getIcon(severity)}</span>
      <span>{daysRemaining}d</span>
    </div>
  );
};
