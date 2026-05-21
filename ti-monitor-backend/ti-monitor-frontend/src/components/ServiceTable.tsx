import React from 'react';
import type { TiService } from '../types';
import { Sparkline } from './Sparkline';

interface ServiceTableProps {
  services: TiService[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-900 text-green-200';
    case 'degraded':
      return 'bg-yellow-900 text-yellow-200';
    case 'down':
      return 'bg-red-900 text-red-200';
    default:
      return 'bg-slate-700 text-slate-200';
  }
};

export const ServiceTable: React.FC<ServiceTableProps> = ({ services }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-700 text-slate-400">
          <tr>
            <th className="text-left p-3">Dienst</th>
            <th className="text-left p-3">Status</th>
            <th className="text-right p-3">Latenz</th>
            <th className="text-left p-3">Trend</th>
            <th className="text-left p-3">Zuletzt geprüft</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
              <td className="p-3 font-mono text-xs font-semibold">{service.kind}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${getStatusBadge(service.status)}`}>
                  {service.status}
                </span>
              </td>
              <td className="text-right p-3 font-mono text-xs">
                {service.latency_ms === 9999 ? (
                  <span className="text-red-400">∞</span>
                ) : (
                  <span>{service.latency_ms}ms</span>
                )}
              </td>
              <td className="p-3">
                {service.latency_history.length > 0 && (
                  <Sparkline data={service.latency_history} width={60} height={24} />
                )}
              </td>
              <td className="p-3 text-slate-400 text-xs">
                {new Date(service.last_checked).toLocaleTimeString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
