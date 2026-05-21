import React from 'react';
import type { Praxis } from '../types';

interface PraxisCardProps {
  praxis: Praxis;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'border-green-200 hover:border-green-300 hover:shadow-md';
    case 'degraded':
      return 'border-yellow-200 hover:border-yellow-300 hover:shadow-md';
    case 'down':
      return 'border-red-200 hover:border-red-300 hover:shadow-md';
    default:
      return 'border-slate-200 hover:border-slate-300 hover:shadow-md';
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
  const statusClass = getStatusColor(praxis.overall_status);
  const dotClass = getStatusDot(praxis.overall_status);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white border-2 rounded-xl p-6 cursor-pointer
        transition-all duration-200 hover-lift card-shadow
        ${statusClass}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900">{praxis.name}</h3>
          <p className="text-sm text-slate-500">{praxis.location}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${dotClass} flex-shrink-0`}></div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-1">
          {praxis.services.map(service => (
            <div
              key={service.id}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${getServiceDotColor(service.status)}`}
              title={`${service.kind}: ${service.status}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-green-50 rounded p-2">
            <div className="font-semibold text-green-700">{okCount}</div>
            <div className="text-green-600 text-xs">OK</div>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <div className="font-semibold text-yellow-700">{degradedCount}</div>
            <div className="text-yellow-600 text-xs">Warn</div>
          </div>
          <div className="bg-red-50 rounded p-2">
            <div className="font-semibold text-red-700">{downCount}</div>
            <div className="text-red-600 text-xs">Down</div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500">Status: </span>
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            praxis.overall_status === 'ok' ? 'text-green-600' :
            praxis.overall_status === 'degraded' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {praxis.overall_status}
          </span>
        </div>
      </div>
    </div>
  );
};
