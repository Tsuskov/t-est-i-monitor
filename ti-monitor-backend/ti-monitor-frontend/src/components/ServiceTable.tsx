import React from 'react';
import type { TiService } from '../types';
import { Sparkline } from './Sparkline';

interface ServiceTableProps {
  services: TiService[];
}

const getStatusBadge = (status: string, isDark: boolean) => {
  if (status === 'ok') {
    return isDark 
      ? 'bg-blue-900 text-blue-100'
      : 'bg-blue-100 text-blue-900';
  }
  if (status === 'degraded') {
    return isDark
      ? 'bg-orange-900 text-orange-100'
      : 'bg-orange-100 text-orange-900';
  }
  if (status === 'down') {
    return isDark
      ? 'bg-gray-700 text-gray-200'
      : 'bg-gray-200 text-gray-800';
  }
  return isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800';
};

export const ServiceTable: React.FC<ServiceTableProps> = ({ services }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ borderBottomColor: isDark ? '#3B4556' : '#E5E7EB' }} className="border-b">
          <tr>
            <th className="text-left p-3 opacity-70">Dienst</th>
            <th className="text-left p-3 opacity-70">Status</th>
            <th className="text-right p-3 opacity-70">Latenz</th>
            <th className="text-left p-3 opacity-70">Trend</th>
            <th className="text-left p-3 opacity-70">Zuletzt geprüft</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id} style={{ borderBottomColor: isDark ? '#3B4556' : '#E5E7EB' }} className="border-b transition-colors">
              <td className="p-3 font-mono text-xs font-semibold">{service.kind}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${getStatusBadge(service.status, isDark)}`}>
                  {service.status}
                </span>
              </td>
              <td className="text-right p-3 font-mono text-xs">
                {service.latency_ms === 9999 ? (
                  <span style={{ color: '#808080' }}>∞</span>
                ) : (
                  <span>{service.latency_ms}ms</span>
                )}
              </td>
              <td className="p-3">
                {service.latency_history.length > 0 && (
                  <Sparkline data={service.latency_history} width={60} height={24} />
                )}
              </td>
              <td className="p-3 opacity-60 text-xs">
                {new Date(service.last_checked).toLocaleTimeString('de-DE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
