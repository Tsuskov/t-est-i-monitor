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

function App() {
  const { praxen, alerts, wsConnected, stats, dismissAlert } = useMonitor();
  const [selectedPraxis, setSelectedPraxis] = useState<Praxis | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'praxen' | 'alerts' | 'certs'>('praxen');

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

  return (
    <div className="min-h-screen bg-slate-950">
      <Header wsConnected={wsConnected} criticalCount={criticalCount} />
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      <main className="max-w-7xl mx-auto p-6">
        {selectedPraxis ? (
          <div className="space-y-6 animate-fadeIn">
            <button
              onClick={() => setSelectedPraxis(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              ← Zurück zur Übersicht
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{selectedPraxis.name}</h2>
                <p className="text-slate-400">{selectedPraxis.location}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Gesamtstatus</p>
                  <p className={`text-2xl font-bold capitalize ${
                    selectedPraxis.overall_status === 'ok' ? 'text-green-400' :
                    selectedPraxis.overall_status === 'degraded' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {selectedPraxis.overall_status}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">OK Dienste</p>
                  <p className="text-2xl font-bold text-green-400">
                    {selectedPraxis.services.filter(s => s.status === 'ok').length}/{selectedPraxis.services.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Zuletzt geprüft</p>
                  <p className="text-sm font-mono text-slate-300">
                    {new Date().toLocaleTimeString('de-DE')}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Dienste</h3>
              <ServiceTable services={selectedPraxis.services} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <div className="flex gap-6 text-sm">
                <div className="bg-slate-900 rounded p-3 border border-slate-800">
                  <p className="text-slate-400">OK</p>
                  <p className="text-2xl font-bold text-green-400">{praxen.length - stats.degraded - stats.down}</p>
                </div>
                <div className="bg-slate-900 rounded p-3 border border-slate-800">
                  <p className="text-slate-400">Degradiert</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.degraded}</p>
                </div>
                <div className="bg-slate-900 rounded p-3 border border-slate-800">
                  <p className="text-slate-400">Ausfälle</p>
                  <p className="text-2xl font-bold text-red-400">{stats.down}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('praxen')}
                className={`px-4 py-2 transition-colors duration-200 ${
                  activeTab === 'praxen'
                    ? 'border-b-2 border-green-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Praxen ({praxen.length})
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 transition-colors duration-200 ${
                  activeTab === 'alerts'
                    ? 'border-b-2 border-green-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Alerts {alerts.length > 0 && <span className="ml-1 text-red-400">({alerts.length})</span>}
              </button>
              <button
                onClick={() => setActiveTab('certs')}
                className={`px-4 py-2 transition-colors duration-200 ${
                  activeTab === 'certs'
                    ? 'border-b-2 border-green-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Zertifikate
              </button>
            </div>

            <div className="min-h-96">
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
        )}
      </main>
    </div>
  );
}

export default App;
