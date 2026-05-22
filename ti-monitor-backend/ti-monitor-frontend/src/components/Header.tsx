import React from 'react';

interface HeaderProps {
  wsConnected: boolean;
  criticalCount: number;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, criticalCount, theme, onThemeToggle }) => {
  return (
    <header className="card-knicks border-b-2" style={{ borderBottomColor: 'var(--pastel-blue)', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: '0' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold">🏥</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--pastel-orange)' }}>TI-Monitor</h1>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Telematik-Infrastruktur</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="label-uppercase">Verbindung</p>
            <div className={`text-sm font-semibold flex items-center gap-2`} style={{ color: wsConnected ? '#10B981' : '#EF4444' }}>
              <span className={`w-3 h-3 rounded-full ${wsConnected ? 'animate-pulse' : ''}`} style={{ backgroundColor: wsConnected ? '#10B981' : '#EF4444' }}></span>
              {wsConnected ? 'Online' : 'Offline'}
            </div>
          </div>
          
          {criticalCount > 0 && (
            <div className="badge-orange">
              ⚠️ {criticalCount} Ausfälle
            </div>
          )}

          {/* Theme Toggle Button - removed since we're always light now */}
        </div>
      </div>
    </header>
  );
};
