import { useState, useEffect, useCallback } from 'react';
import type { Praxis, MonitorMessage, AlertEvent } from '../types';

export const useMonitor = () => {
  const [praxen, setPraxen] = useState<Praxis[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [stats, setStats] = useState({ down: 0, degraded: 0, total: 0 });

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:3000/api/praxen')
      .then(r => r.json())
      .then(data => setPraxen(data))
      .catch(err => console.error('Initial fetch failed:', err));

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:3000/ws/monitor');

    ws.onopen = () => {
      setWsConnected(true);
      console.log('📡 Connected to monitor');
    };

    ws.onmessage = (event) => {
      try {
        const msg: MonitorMessage = JSON.parse(event.data);

        if (msg.type === 'state_update' && msg.data.praxen) {
          setPraxen(msg.data.praxen);
          if (msg.data.stats) {
            setStats({
              down: msg.data.stats.down_services,
              degraded: msg.data.stats.degraded_services,
              total: msg.data.stats.total_services,
            });
          }
        } else if (msg.type === 'alert') {
          const alert: AlertEvent = {
            praxis_id: msg.data.praxis_id || '',
            praxis_name: msg.data.praxis_name || '',
            service: msg.data.service || '',
            message: msg.data.message || '',
            severity: msg.data.severity || 'warning',
            timestamp: msg.data.timestamp,
          };
          setAlerts(prev => [alert, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    return () => ws.close();
  }, []);

  const dismissAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    praxen,
    alerts,
    wsConnected,
    stats,
    dismissAlert,
  };
};
