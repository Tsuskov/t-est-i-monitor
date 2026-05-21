export type Status = 'ok' | 'degraded' | 'down' | 'unknown';
export type ServiceKind = 'IDP' | 'ePA' | 'KIM' | 'ERezept' | 'OCSP' | 'PoPP';
export type CertSeverity = 'ok' | 'warning' | 'critical';

export interface TiService {
  id: string;
  kind: ServiceKind;
  endpoint: string;
  status: Status;
  latency_ms: number | null;
  latency_history: number[];
  last_checked: string;
}

export interface Praxis {
  id: string;
  name: string;
  location: string;
  services: TiService[];
  overall_status: Status;
}

export interface Certificate {
  service_id: string;
  praxis_id: string;
  service_name: string;
  praxis_name: string;
  expires_at: string;
  days_remaining: number;
  severity: CertSeverity;
}

export interface MonitorMessage {
  type: 'state_update' | 'alert';
  data: {
    praxen?: Praxis[];
    stats?: {
      down_services: number;
      degraded_services: number;
      total_services: number;
    };
    cycle?: number;
    timestamp: string;
    praxis_id?: string;
    praxis_name?: string;
    service?: string;
    message?: string;
    severity?: string;
  };
}

export interface AlertEvent {
  praxis_id: string;
  praxis_name: string;
  service: string;
  message: string;
  severity: string;
  timestamp: string;
}
