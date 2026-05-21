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
    <div className="min-h-screen bg-slate-50">
      <Header wsConnected={wsConnected} criticalCount={criticalCount} />
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      <main className="max-w-7xl mx-auto p-6">
        {selectedPraxis ? (
          <div className="space-y-6 animate-fadeIn">
            <button
              onClick={() => setSelectedPraxis(null)}
              className="flex items-center gap-2 text-medical-600 hover:text-medical-700 transition-colors font-semibold"
            >
              ← Zurück zur Übersicht
            </button>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-slate-900">{selectedPraxis.name}</h2>
                <p className="text-slate-600">{selectedPraxis.location}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">Gesamtstatus</p>
                  <p className={`text-3xl font-bold capitalize ${
                    selectedPraxis.overall_status === 'ok' ? 'text-green-600' :
                    selectedPraxis.overall_status === 'degraded' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedPraxis.overall_status}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">OK Dienste</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedPraxis.services.filter(s => s.status === 'ok').length}/{selectedPraxis.services.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">Zuletzt geprüft</p>
                  <p className="text-sm font-mono text-slate-700">
                    {new Date().toLocaleTimeString('de-DE')}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 text-slate-900">Dienste</h3>
              <ServiceTable services={selectedPraxis.services} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
              <div className="flex gap-4">
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-1">OK</p>
                  <p className="text-3xl font-bold text-green-600">{praxen.length - stats.degraded - stats.down}</p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-1">Degradiert</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.degraded}</p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-1">Ausfälle</p>
                  <p className="text-3xl font-bold text-red-600">{stats.down}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex gap-1 border-b border-slate-200 p-6">
                <button
                  onClick={() => setActiveTab('praxen')}
                  className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
                    activeTab === 'praxen'
                      ? 'border-medical-600 text-medical-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Praxen ({praxen.length})
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
                    activeTab === 'alerts'
                      ? 'border-medical-600 text-medical-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Alerts {alerts.length > 0 && <span className="ml-1 text-red-600">({alerts.length})</span>}
                </button>
                <button
                  onClick={() => setActiveTab('certs')}
                  className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
                    activeTab === 'certs'
                      ? 'border-medical-600 text-medical-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
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
