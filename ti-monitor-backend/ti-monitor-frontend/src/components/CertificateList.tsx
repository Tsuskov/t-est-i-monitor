import React, { useState } from 'react';
import type { Certificate } from '../types';
import { CertificateBadge } from './CertificateBadge';

interface CertificateListProps {
  certificates: Certificate[];
}

export const CertificateList: React.FC<CertificateListProps> = ({ certificates }) => {
  const [sortBy, setSortBy] = useState<'expiry' | 'severity'>('expiry');

  const sorted = [...certificates].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { critical: 0, warning: 1, ok: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.days_remaining - b.days_remaining;
  });

  const critical = sorted.filter(c => c.severity === 'critical').length;
  const warning = sorted.filter(c => c.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div>
            <p className="text-slate-400 text-sm">Kritisch</p>
            <p className="text-2xl font-bold text-red-400">{critical}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Warnung</p>
            <p className="text-2xl font-bold text-yellow-400">{warning}</p>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'expiry' | 'severity')}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white hover:border-slate-600 transition"
        >
          <option value="expiry">Nach Ablauf sortieren</option>
          <option value="severity">Nach Schweregrad sortieren</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sorted.map(cert => (
          <div
            key={cert.service_id}
            className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700 hover:border-slate-600 transition"
          >
            <div className="flex-1">
              <p className="font-mono text-xs font-semibold">{cert.service_name}</p>
              <p className="text-xs text-slate-400">{cert.praxis_name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(cert.expires_at).toLocaleDateString('de-DE')}
              </p>
            </div>
            <CertificateBadge daysRemaining={cert.days_remaining} severity={cert.severity} />
          </div>
        ))}
      </div>
    </div>
  );
};
