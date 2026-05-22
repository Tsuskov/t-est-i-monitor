import React from 'react';
import type { AlertEvent } from '../types';

interface AlertBannerProps {
  alerts: AlertEvent[];
  onDismiss: (index: number) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-900 bg-opacity-20 border-red-700 border-opacity-50 text-red-300';
    case 'warning':
      return 'bg-yellow-900 bg-opacity-20 border-yellow-700 border-opacity-50 text-yellow-300';
    default:
      return 'bg-slate-800 border-slate-700 border-opacity-50 text-slate-300';
  }
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="max-w-7xl mx-auto space-y-2 max-h-32 overflow-y-auto">
        {alerts.slice(0, 3).map((alert, i) => (
          <div
            key={`${alert.timestamp}-${i}`}
            className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex-1">
              <span className="font-semibold">{alert.praxis_name}</span>
              <span className="text-xs mx-2 opacity-50">·</span>
              <span className="text-sm">{alert.service}: {alert.message}</span>
            </div>
            <button
              onClick={() => onDismiss(i)}
              className="ml-3 text-lg hover:opacity-60 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
