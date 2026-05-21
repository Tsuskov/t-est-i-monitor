import React from 'react';
import type { TiService } from '../types';

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
            <th className="text-left p-2">Dienst</th>
            <th className="text-left p-2">Status</th>
            <th className="text-right p-2">Latenz (ms)</th>
            <th className="text-left p-2">Zuletzt geprüft</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="p-2 font-mono text-xs">{service.kind}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(service.status)}`}>
                  {service.status}
                </span>
              </td>
              <td className="text-right p-2">
                {service.latency_ms === 9999 ? '∞' : `${service.latency_ms}ms`}
              </td>
              <td className="p-2 text-slate-400 text-xs">
                {new Date(service.last_checked).toLocaleTimeString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
