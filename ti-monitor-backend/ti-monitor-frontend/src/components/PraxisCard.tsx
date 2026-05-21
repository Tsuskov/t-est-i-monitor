import React from 'react';
import type { Praxis } from '../types';

interface PraxisCardProps {
  praxis: Praxis;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'text-green-400 border-green-400/30';
    case 'degraded':
      return 'text-yellow-400 border-yellow-400/30';
    case 'down':
      return 'text-red-400 border-red-400/30';
    default:
      return 'text-gray-400 border-gray-400/30';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500 animate-pulse';
    case 'degraded':
      return 'bg-yellow-500 animate-bounce';
    case 'down':
      return 'bg-red-500 animate-pulse';
    default:
      return 'bg-gray-500';
  }
};

const getServiceDotColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-gray-600';
  }
};

export const PraxisCard: React.FC<PraxisCardProps> = ({ praxis, onClick }) => {
  const okCount = praxis.services.filter(s => s.status === 'ok').length;
  const statusClass = getStatusColor(praxis.overall_status);
  const dotClass = getStatusDot(praxis.overall_status);

  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900 border-2 rounded-lg p-4 cursor-pointer
        hover:border-slate-600 hover:bg-slate-800 transition-all
        ${statusClass}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{praxis.name}</h3>
          <p className="text-sm text-slate-400">{praxis.location}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1">
          {praxis.services.map(service => (
            <div
              key={service.id}
              className={`w-2 h-2 rounded-full ${getServiceDotColor(service.status)}`}
              title={`${service.kind}: ${service.status}`}
            />
          ))}
        </div>

        <div className="text-sm text-slate-400">
          {okCount} von {praxis.services.length} Dienste ok
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">Status: </span>
          <span className="text-xs font-semibold uppercase">{praxis.overall_status}</span>
        </div>
      </div>
    </div>
  );
};
