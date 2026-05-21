import { useState } from 'react';
import type { Praxis } from './types';
import { useMonitor } from './hooks/useMonitor';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { PraxisGrid } from './components/PraxisGrid';
import { ServiceTable } from './components/ServiceTable';

function App() {
  const { praxen, alerts, wsConnected, stats, dismissAlert } = useMonitor();
  const [selectedPraxis, setSelectedPraxis] = useState<Praxis | null>(null);

  const criticalCount = praxen.filter(p => p.overall_status === 'down').length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header wsConnected={wsConnected} criticalCount={criticalCount} />
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      <main className="max-w-7xl mx-auto p-6">
        {selectedPraxis ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedPraxis(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              ← Zurück zur Übersicht
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{selectedPraxis.name}</h2>
                <p className="text-slate-400">{selectedPraxis.location}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm">Gesamtstatus</p>
                  <p className="text-2xl font-bold capitalize">{selectedPraxis.overall_status}</p>
                </div>
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm">OK Dienste</p>
                  <p className="text-2xl font-bold">
                    {selectedPraxis.services.filter(s => s.status === 'ok').length}/{selectedPraxis.services.length}
                  </p>
                </div>
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm">Zuletzt geprüft</p>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Übersicht</h2>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-slate-400">OK</p>
                  <p className="text-2xl font-bold text-green-400">{praxen.length - stats.degraded - stats.down}</p>
                </div>
                <div>
                  <p className="text-slate-400">Degradiert</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.degraded}</p>
                </div>
                <div>
                  <p className="text-slate-400">Ausfälle</p>
                  <p className="text-2xl font-bold text-red-400">{stats.down}</p>
                </div>
              </div>
            </div>

            <PraxisGrid praxen={praxen} onSelectPraxis={setSelectedPraxis} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
