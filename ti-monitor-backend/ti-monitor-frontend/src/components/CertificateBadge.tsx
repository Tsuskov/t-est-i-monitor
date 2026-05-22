import React from 'react';
import type { CertSeverity } from '../types';

interface CertificateBadgeProps {
  daysRemaining: number;
  severity: CertSeverity;
}

export const CertificateBadge: React.FC<CertificateBadgeProps> = ({ daysRemaining, severity }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  const getBgColor = (sev: CertSeverity) => {
    if (sev === 'critical') {
      return isDark
        ? 'bg-orange-900 text-orange-100'
        : 'bg-orange-100 text-orange-900';
    }
    if (sev === 'warning') {
      return isDark
        ? 'bg-orange-800 text-orange-100'
        : 'bg-orange-50 text-orange-800';
    }
    if (sev === 'ok') {
      return isDark
        ? 'bg-blue-900 text-blue-100'
        : 'bg-blue-100 text-blue-900';
    }
    return isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800';
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
