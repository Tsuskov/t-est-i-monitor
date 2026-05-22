import { useState, useEffect } from 'react';
import type { Praxis, Certificate } from './types';
import { useMonitor } from './hooks/useMonitor';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { PraxisGrid } from './components/PraxisGrid';
import { ServiceTable } from './components/ServiceTable';
import { AlertTimeline } from './components/AlertTimeline';
import { CertificateList } from './components/CertificateList';
import { LoadingSpinner } from './components/LoadingSpinner';

type Theme = 'dark' | 'light';

function App() {
  const { praxen, alerts, wsConnected, stats, dismissAlert } = useMonitor();
  const [selectedPraxis, setSelectedPraxis] = useState<Praxis | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'praxen' | 'alerts' | 'certs'>('praxen');
  const [theme, setTheme] = useState<Theme>('dark');

  const criticalCount = praxen.filter(p => p.overall_status === 'down').length;

  useEffect(() => {
    document.title = criticalCount > 0
      ? `(${criticalCount}) TI-Monitor - WARNUNG`
      : 'TI-Monitor';
  }, [criticalCount]);

  useEffect(() => {
    fetch('http://localhost:3000/api/certs')
      .then(r => r.json())
      .then(data => setCertificates(data))
      .catch(err => console.error('Failed to fetch certificates:', err));
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen">
      <Header wsConnected={wsConnected} criticalCount={criticalCount} theme={theme} onThemeToggle={toggleTheme} />
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      <main className="max-w-7xl mx-auto p-6">
        {selectedPraxis ? (
          <div className="space-y-6 animate-fadeIn">
            <button
              onClick={() => setSelectedPraxis(null)}
              className="flex items-center gap-2 transition-colors font-semibold"
              style={{ color: 'var(--knicks-blue)' }}
            >
              ← Zurück zur Übersicht
            </button>

            <div className="card-knicks p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{selectedPraxis.name}</h2>
                <p className="opacity-70">{selectedPraxis.location}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="card-knicks p-6">
                  <p className="label-uppercase mb-3">Gesamtstatus</p>
                  <p className={`text-3xl font-bold capitalize ${
                    selectedPraxis.overall_status === 'ok' ? 'text-green-500' :
                    selectedPraxis.overall_status === 'degraded' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {selectedPraxis.overall_status}
                  </p>
                </div>
                <div className="card-knicks p-6">
                  <p className="label-uppercase mb-3">OK Dienste</p>
                  <p className="metric-number">
                    {selectedPraxis.services.filter(s => s.status === 'ok').length}/{selectedPraxis.services.length}
                  </p>
                </div>
                <div className="card-knicks p-6">
                  <p className="label-uppercase mb-3">Zuletzt geprüft</p>
                  <p className="text-sm font-mono">
                    {new Date().toLocaleTimeString('de-DE')}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Dienste</h3>
              <ServiceTable services={selectedPraxis.services} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <div className="flex gap-4">
                <div className="card-knicks p-6 text-center">
                  <p className="label-uppercase mb-2">OK</p>
                  <p className="metric-number">{praxen.length - stats.degraded - stats.down}</p>
                </div>
                <div className="card-knicks p-6 text-center">
                  <p className="label-uppercase mb-2">Degradiert</p>
                  <p className="metric-number">{stats.degraded}</p>
                </div>
                <div className="card-knicks p-6 text-center">
                  <p className="label-uppercase mb-2">Ausfälle</p>
                  <p className="metric-number text-red-500">{stats.down}</p>
                </div>
              </div>
            </div>

            <div className="card-knicks">
              <div className="flex gap-1 border-b p-6" style={{ borderBottomColor: 'var(--knicks-blue)' }}>
                <button
                  onClick={() => setActiveTab('praxen')}
                  className="px-4 py-2 font-semibold transition-colors duration-200"
                  style={{
                    color: activeTab === 'praxen' ? 'var(--knicks-orange)' : 'currentColor',
                    borderBottom: activeTab === 'praxen' ? `3px solid var(--knicks-orange)` : 'none',
                    opacity: activeTab === 'praxen' ? 1 : 0.6
                  }}
                >
                  Praxen ({praxen.length})
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="px-4 py-2 font-semibold transition-colors duration-200"
                  style={{
                    color: activeTab === 'alerts' ? 'var(--knicks-orange)' : 'currentColor',
                    borderBottom: activeTab === 'alerts' ? `3px solid var(--knicks-orange)` : 'none',
                    opacity: activeTab === 'alerts' ? 1 : 0.6
                  }}
                >
                  Alerts {alerts.length > 0 && <span className="ml-1 text-red-500">({alerts.length})</span>}
                </button>
                <button
                  onClick={() => setActiveTab('certs')}
                  className="px-4 py-2 font-semibold transition-colors duration-200"
                  style={{
                    color: activeTab === 'certs' ? 'var(--knicks-orange)' : 'currentColor',
                    borderBottom: activeTab === 'certs' ? `3px solid var(--knicks-orange)` : 'none',
                    opacity: activeTab === 'certs' ? 1 : 0.6
                  }}
                >
                  Zertifikate
                </button>
              </div>

              <div className="p-6 min-h-96">
                {activeTab === 'praxen' && (
                  praxen.length === 0 ? (
                    <LoadingSpinner />
                  ) : (
                    <PraxisGrid praxen={praxen} onSelectPraxis={setSelectedPraxis} />
                  )
                )}
                {activeTab === 'alerts' && <AlertTimeline alerts={alerts} />}
                {activeTab === 'certs' && <CertificateList certificates={certificates} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
