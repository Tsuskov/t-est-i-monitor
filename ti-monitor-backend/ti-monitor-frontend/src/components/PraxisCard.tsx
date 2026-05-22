import React from 'react';
import type { Praxis } from '../types';

interface PraxisCardProps {
  praxis: Praxis;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'border-green-700 hover:border-green-600 hover:shadow-lg';
    case 'degraded':
      return 'border-yellow-700 hover:border-yellow-600 hover:shadow-lg';
    case 'down':
      return 'border-red-700 hover:border-red-600 hover:shadow-lg';
    default:
      return 'border-slate-700 hover:border-slate-600 hover:shadow-lg';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500 animate-pulse';
    case 'degraded':
      return 'bg-yellow-500 animate-bounce';
    case 'down':
      return 'bg-red-500 animate-pulse-status';
    default:
      return 'bg-slate-400';
  }
};

const getServiceDotColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-400';
    case 'degraded':
      return 'bg-yellow-400';
    case 'down':
      return 'bg-red-400';
    default:
      return 'bg-slate-300';
  }
};

export const PraxisCard: React.FC<PraxisCardProps> = ({ praxis, onClick }) => {
  const okCount = praxis.services.filter(s => s.status === 'ok').length;
  const degradedCount = praxis.services.filter(s => s.status === 'degraded').length;
  const downCount = praxis.services.filter(s => s.status === 'down').length;
  const dotClass = getStatusDot(praxis.overall_status);

  return (
    <div
      onClick={onClick}
      className="relative card-city p-6 cursor-pointer transition-all hover:shadow-lg"
      style={{ backgroundColor: 'var(--knicks-black)' }}
    >
      {/* Status dot - top right */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${dotClass}`}></div>

      {/* Header */}
      <div className="pr-8">
        <h3 className="font-bold text-lg text-white">{praxis.name}</h3>
        <p className="text-sm text-slate-400">{praxis.location}</p>
      </div>

      <div className="space-y-4 mt-4">
        {/* Service dots */}
        <div className="flex gap-1">
          {praxis.services.map(service => (
            <div
              key={service.id}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${getServiceDotColor(service.status)}`}
              title={`${service.kind}: ${service.status}`}
            />
          ))}
        </div>

        {/* Stat boxes - flat, no nested borders */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="font-mono font-semibold text-green-400 text-lg">{okCount}</div>
            <div className="label-uppercase text-green-400 mt-1">OK</div>
          </div>
          <div className="rounded p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="font-mono font-semibold text-lg" style={{ color: 'var(--knicks-orange)' }}>{degradedCount}</div>
            <div className="label-uppercase mt-1" style={{ color: 'var(--knicks-orange)' }}>Warn</div>
          </div>
          <div className="rounded p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="font-mono font-semibold text-red-400 text-lg">{downCount}</div>
            <div className="label-uppercase text-red-400 mt-1">Down</div>
          </div>
        </div>

        {/* Overall status */}
        <div className="pt-3 border-t border-slate-700">
          <span className="label-uppercase text-slate-500">Status</span>
          <span className={`ml-2 font-mono font-semibold uppercase tracking-wide ${
            praxis.overall_status === 'ok' ? 'text-green-400' :
            praxis.overall_status === 'degraded' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {praxis.overall_status}
          </span>
        </div>
      </div>
    </div>
  );
};
