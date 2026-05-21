import React from 'react';
import type { AlertEvent } from '../types';

interface AlertBannerProps {
  alerts: AlertEvent[];
  onDismiss: (index: number) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/40 border-red-600/50 text-red-200';
    case 'warning':
      return 'bg-yellow-900/40 border-yellow-600/50 text-yellow-200';
    default:
      return 'bg-slate-700/40 border-slate-600/50 text-slate-200';
  }
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-2">
      <div className="max-w-7xl mx-auto space-y-2 max-h-48 overflow-y-auto">
        {alerts.slice(0, 3).map((alert, i) => (
          <div
            key={`${alert.timestamp}-${i}`}
            className={`flex items-center justify-between p-2 rounded border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex-1">
              <span className="font-semibold">{alert.praxis_name}</span>
              <span className="text-xs mx-2 opacity-70">·</span>
              <span className="text-sm">{alert.service}: {alert.message}</span>
            </div>
            <button
              onClick={() => onDismiss(i)}
              className="ml-2 text-lg hover:opacity-70 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {alerts.length > 3 && (
          <div className="text-xs text-slate-400 text-center p-1">
            +{alerts.length - 3} weitere Alerts
          </div>
        )}
      </div>
    </div>
  );
};
