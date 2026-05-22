import React from 'react';
import type { Praxis } from '../types';

interface PraxisCardProps {
  praxis: Praxis;
  onClick?: () => void;
}

const getStatusDot = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-blue-500 animate-pulse';
    case 'degraded':
      return 'bg-orange-500 animate-bounce';
    case 'down':
      return 'bg-gray-400 animate-pulse-status';
    default:
      return 'bg-gray-400';
  }
};

const getServiceDotColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-blue-400';
    case 'degraded':
      return 'bg-orange-400';
    case 'down':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
};

const getStatusBg = (status: string, isDark: boolean) => {
  if (status === 'ok') return isDark ? 'rgba(27, 77, 181, 0.1)' : 'rgba(27, 77, 181, 0.08)';
  if (status === 'degraded') return isDark ? 'rgba(244, 104, 26, 0.1)' : 'rgba(244, 104, 26, 0.08)';
  if (status === 'down') return isDark ? 'rgba(120, 120, 120, 0.1)' : 'rgba(120, 120, 120, 0.08)';
  return isDark ? 'rgba(100, 100, 100, 0.1)' : 'rgba(100, 100, 100, 0.08)';
};

const getStatusColor = (status: string) => {
  if (status === 'ok') return '#1B4DB5';
  if (status === 'degraded') return '#F4681A';
  if (status === 'down') return '#808080';
  return '#808080';
};

export const PraxisCard: React.FC<PraxisCardProps> = ({ praxis, onClick }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const okCount = praxis.services.filter(s => s.status === 'ok').length;
  const degradedCount = praxis.services.filter(s => s.status === 'degraded').length;
  const downCount = praxis.services.filter(s => s.status === 'down').length;
  const dotClass = getStatusDot(praxis.overall_status);

  const statusBg = getStatusBg(praxis.overall_status, isDark);
  const accentColor = isDark ? '#1B4DB5' : '#F4681A';
  const statusBarColor = getStatusColor(praxis.overall_status);

  return (
    <div
      onClick={onClick}
      className="card-knicks cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      {/* Status indicator bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: statusBarColor }}
      ></div>

      {/* Header with status dot */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg" style={{ color: accentColor }}>{praxis.name}</h3>
          <p className="text-sm opacity-70">{praxis.location}</p>
        </div>
        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${dotClass}`}></div>
      </div>

      {/* Service dots - clear visibility */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {praxis.services.map(service => (
          <div
            key={service.id}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${getServiceDotColor(service.status)}`}
            title={`${service.kind}: ${service.status}`}
          />
        ))}
      </div>

      {/* Status stats - clearer boxes */}
      <div
        className="rounded-lg p-4 mb-4 flex items-center justify-between"
        style={{ backgroundColor: statusBg, border: `1.5px solid ${accentColor}` }}
      >
        <div className="flex gap-6">
          <div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#1B4DB5' }}>{okCount}</div>
            <p className="label-uppercase text-xs mt-1">OK</p>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#F4681A' }}>{degradedCount}</div>
            <p className="label-uppercase text-xs mt-1">Warn</p>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#808080' }}>{downCount}</div>
            <p className="label-uppercase text-xs mt-1">Down</p>
          </div>
        </div>
        <div
          className="text-right px-4 py-2 rounded text-white font-mono font-bold text-lg"
          style={{ backgroundColor: statusBarColor }}
        >
          {praxis.overall_status.toUpperCase()}
        </div>
      </div>

      {/* Service summary */}
      <p className="text-xs opacity-60">
        {okCount} von {praxis.services.length} Dienste verfügbar
      </p>
    </div>
  );
};
