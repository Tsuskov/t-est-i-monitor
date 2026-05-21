import React from 'react';
import type { AlertEvent } from '../types';

interface AlertTimelineProps {
  alerts: AlertEvent[];
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '🟡';
    default:
      return '🔵';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'border-red-500 bg-red-900/20';
    case 'warning':
      return 'border-yellow-500 bg-yellow-900/20';
    default:
      return 'border-slate-500 bg-slate-900/20';
  }
};

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Keine Alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 20).map((alert, i) => (
        <div key={`${alert.timestamp}-${i}`} className={`flex gap-3 p-3 rounded border ${getSeverityColor(alert.severity)}`}>
          <div className="text-xl flex-shrink-0 pt-1">{getSeverityIcon(alert.severity)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{alert.praxis_name}</div>
            <div className="text-xs text-slate-300">
              <span className="font-mono">{alert.service}</span> - {alert.message}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {new Date(alert.timestamp).toLocaleString('de-DE')}
            </div>
          </div>
        </div>
      ))}
      {alerts.length > 20 && (
        <div className="text-xs text-slate-400 text-center p-2">
          +{alerts.length - 20} weitere Alerts (nicht angezeigt)
        </div>
      )}
    </div>
  );
};
