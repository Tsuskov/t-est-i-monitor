import React from 'react';
import type { AlertEvent } from '../types';

interface AlertBannerProps {
  alerts: AlertEvent[];
  onDismiss: (index: number) => void;
}

const getSeverityStyle = (severity: string, isDark: boolean) => {
  if (severity === 'critical') {
    return {
      bg: isDark ? 'rgba(244, 104, 26, 0.15)' : 'rgba(244, 104, 26, 0.1)',
      border: isDark ? '#F4681A' : '#DC7A1A',
      text: isDark ? '#F4681A' : '#B84D10'
    };
  }
  if (severity === 'warning') {
    return {
      bg: isDark ? 'rgba(244, 104, 26, 0.1)' : 'rgba(244, 104, 26, 0.08)',
      border: isDark ? '#F4681A' : '#DC7A1A',
      text: isDark ? '#F4681A' : '#B84D10'
    };
  }
  return {
    bg: isDark ? 'rgba(27, 77, 181, 0.15)' : 'rgba(27, 77, 181, 0.1)',
    border: isDark ? '#1B4DB5' : '#1438A0',
    text: isDark ? '#1B4DB5' : '#0F2F8C'
  };
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (alerts.length === 0) return null;

  return (
    <div style={{ backgroundColor: isDark ? '#1A1F2E' : '#FAFBFC', borderBottomColor: isDark ? '#3B4556' : '#E5E7EB' }} className="border-b px-6 py-3">
      <div className="max-w-7xl mx-auto space-y-2 max-h-40 overflow-y-auto">
        {alerts.slice(0, 3).map((alert, i) => {
          const style = getSeverityStyle(alert.severity, isDark);
          const dotColor = alert.severity === 'critical' ? '#F4681A' : '#1B4DB5';
          
          return (
            <div
              key={`${alert.timestamp}-${i}`}
              className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md"
              style={{
                backgroundColor: style.bg,
                borderColor: style.border,
                borderWidth: '1.5px'
              }}
            >
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: style.text }}>
                      {alert.praxis_name}
                    </span>
                    <span className="text-xs opacity-50">·</span>
                    <span className="font-mono text-sm font-medium" style={{ color: style.text }}>
                      {alert.service}
                    </span>
                  </div>
                  <p className="text-sm mt-1 opacity-80" style={{ color: style.text }}>
                    {alert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(i)}
                className="ml-3 px-3 py-1 rounded transition-all hover:opacity-60 font-semibold text-lg"
                style={{ color: style.border }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
