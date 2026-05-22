import React from 'react';
import type { AlertEvent } from '../types';

interface AlertTimelineProps {
  alerts: AlertEvent[];
}

const getSeverityStyle = (severity: string, isDark: boolean) => {
  if (severity === 'critical') {
    return {
      bg: isDark ? 'rgba(244, 104, 26, 0.1)' : 'rgba(244, 104, 26, 0.08)',
      border: isDark ? '#F4681A' : '#DC7A1A',
      icon: '🟠'
    };
  }
  if (severity === 'warning') {
    return {
      bg: isDark ? 'rgba(244, 104, 26, 0.08)' : 'rgba(244, 104, 26, 0.06)',
      border: isDark ? '#F4681A' : '#DC7A1A',
      icon: '🟡'
    };
  }
  return {
    bg: isDark ? 'rgba(27, 77, 181, 0.1)' : 'rgba(27, 77, 181, 0.08)',
    border: isDark ? '#1B4DB5' : '#1438A0',
    icon: '🔵'
  };
};

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ alerts }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 opacity-60">
        <p>Keine Alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 20).map((alert, i) => {
        const style = getSeverityStyle(alert.severity, isDark);
        return (
          <div
            key={`${alert.timestamp}-${i}`}
            className="flex gap-3 p-3 rounded border transition-all"
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
              borderWidth: '1.5px'
            }}
          >
            <div className="text-lg flex-shrink-0 pt-1">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{alert.praxis_name}</div>
              <div className="text-xs opacity-75">
                <span className="font-mono">{alert.service}</span> - {alert.message}
              </div>
              <div className="text-xs opacity-50 mt-1">
                {new Date(alert.timestamp).toLocaleString('de-DE')}
              </div>
            </div>
          </div>
        );
      })}
      {alerts.length > 20 && (
        <div className="text-xs opacity-50 text-center p-2">
          +{alerts.length - 20} weitere Alerts (nicht angezeigt)
        </div>
      )}
    </div>
  );
};
