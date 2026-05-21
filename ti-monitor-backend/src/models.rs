use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Praxis {
    pub id: Uuid,
    pub name: String,
    pub location: String,
    pub services: Vec<TiService>,
    pub overall_status: Status,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TiService {
    pub id: Uuid,
    pub kind: ServiceKind,
    pub endpoint: String,
    pub status: Status,
    pub latency_ms: Option<u64>,
    pub latency_history: VecDeque<u64>,
    pub last_checked: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    pub service_id: Uuid,
    pub praxis_id: Uuid,
    pub service_name: String,
    pub praxis_name: String,
    pub expires_at: DateTime<Utc>,
    pub days_remaining: i64,
    pub severity: CertSeverity,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Status {
    #[serde(rename = "ok")]
    Ok,
    #[serde(rename = "degraded")]
    Degraded,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "unknown")]
    Unknown,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ServiceKind {
    #[serde(rename = "IDP")]
    IDP,
    #[serde(rename = "ePA")]
    EPA,
    #[serde(rename = "KIM")]
    KIM,
    #[serde(rename = "ERezept")]
    ERezept,
    #[serde(rename = "OCSP")]
    OCSP,
    #[serde(rename = "PoPP")]
    PoPP,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum CertSeverity {
    #[serde(rename = "ok")]
    Ok,
    #[serde(rename = "warning")]
    Warning,
    #[serde(rename = "critical")]
    Critical,
}

impl ServiceKind {
    pub fn as_str(&self) -> &str {
        match self {
            ServiceKind::IDP => "IDP",
            ServiceKind::EPA => "ePA",
            ServiceKind::KIM => "KIM",
            ServiceKind::ERezept => "ERezept",
            ServiceKind::OCSP => "OCSP",
            ServiceKind::PoPP => "PoPP",
        }
    }
}

pub fn init_mock_praxen() -> Vec<Praxis> {
    let kinds = vec![
        ServiceKind::IDP,
        ServiceKind::EPA,
        ServiceKind::KIM,
        ServiceKind::ERezept,
        ServiceKind::OCSP,
        ServiceKind::PoPP,
    ];

    let praxis_names = vec![
        ("Praxis Dr. Müller", "Berlin"),
        ("Zahnarzt Dr. Schmidt", "München"),
        ("Klinik am Park", "Hamburg"),
        ("Praxis Hoffmann", "Köln"),
        ("Med-Zentrum Süd", "Frankfurt"),
    ];

    praxis_names
        .into_iter()
        .map(|(name, location)| {
            let praxis_id = Uuid::new_v4();
            let services = kinds
                .iter()
                .enumerate()
                .map(|(i, kind)| {
                    let _days_until_cert_expires = 90 - (i as i64 * 15);
                    TiService {
                        id: Uuid::new_v4(),
                        kind: *kind,
                        endpoint: format!("https://fhir.{}.de/api/v1/{}", location.to_lowercase(), kind.as_str()),
                        status: Status::Ok,
                        latency_ms: Some(50 + (i as u64 * 10)),
                        latency_history: VecDeque::with_capacity(50),
                        last_checked: Utc::now(),
                    }
                })
                .collect();

            Praxis {
                id: praxis_id,
                name: name.to_string(),
                location: location.to_string(),
                services,
                overall_status: Status::Ok,
            }
        })
        .collect()
}

pub fn calculate_cert_severity(days_remaining: i64) -> CertSeverity {
    match days_remaining {
        ..=29 => CertSeverity::Critical,
        30..=59 => CertSeverity::Warning,
        _ => CertSeverity::Ok,
    }
}
