import React from 'react';

interface HeaderProps {
  wsConnected: boolean;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, criticalCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-medical-600">🏥</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">TI-Monitor</h1>
            <p className="text-sm text-slate-500">Telematik-Infrastruktur Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Status</div>
            <div className={`text-sm font-semibold flex items-center gap-2 ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {wsConnected ? 'Verbunden' : 'Getrennt'}
            </div>
          </div>
          
          {criticalCount > 0 && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 font-semibold text-sm">
              ⚠️ {criticalCount} kritisch
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
