import React from 'react';

interface HeaderProps {
  wsConnected: boolean;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, criticalCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏥</div>
          <div>
            <h1 className="text-2xl font-bold">TI-Monitor</h1>
            <p className="text-sm text-slate-400">Telematik-Infrastruktur Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">WebSocket</div>
            <div className={`text-sm font-semibold ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
              {wsConnected ? '🟢 Verbunden' : '🔴 Getrennt'}
            </div>
          </div>
          
          {criticalCount > 0 && (
            <div className="bg-red-900 text-red-100 px-3 py-2 rounded font-bold">
              ⚠️ {criticalCount} kritisch
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
