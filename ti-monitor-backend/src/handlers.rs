use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use parking_lot::RwLock;
use uuid::Uuid;
use serde_json::json;

use crate::models::{Praxis, Certificate, calculate_cert_severity};

pub async fn health() -> &'static str {
    "OK"
}

pub async fn get_praxen(
    State(state): State<Arc<RwLock<Vec<Praxis>>>>,
) -> Json<Vec<Praxis>> {
    let praxen = state.read();
    Json(praxen.clone())
}

pub async fn get_praxis_detail(
    State(state): State<Arc<RwLock<Vec<Praxis>>>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Praxis>, StatusCode> {
    let praxen = state.read();
    praxen
        .iter()
        .find(|p| p.id == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

pub async fn get_service_detail(
    State(state): State<Arc<RwLock<Vec<Praxis>>>>,
    Path((praxis_id, service_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let praxen = state.read();
    let praxis = praxen
        .iter()
        .find(|p| p.id == praxis_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    let service = praxis
        .services
        .iter()
        .find(|s| s.id == service_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(json!({
        "service": service,
        "praxis": {
            "id": praxis.id,
            "name": praxis.name,
            "location": praxis.location,
        }
    })))
}

pub async fn get_certificates(
    State(state): State<Arc<RwLock<Vec<Praxis>>>>,
) -> Json<Vec<Certificate>> {
    let praxen = state.read();
    let mut certs = Vec::new();

    for praxis in praxen.iter() {
        for service in &praxis.services {
            let expires_at = chrono::Utc::now() + chrono::Duration::days(90 - rand::random::<i64>() % 60);
            let days_remaining = (expires_at - chrono::Utc::now()).num_days();
            let severity = calculate_cert_severity(days_remaining);

            certs.push(Certificate {
                service_id: service.id,
                praxis_id: praxis.id,
                service_name: service.kind.as_str().to_string(),
                praxis_name: praxis.name.clone(),
                expires_at,
                days_remaining,
                severity,
            });
        }
    }

    certs.sort_by_key(|c| c.days_remaining);
    Json(certs)
}

pub async fn ping_service(
    State(state): State<Arc<RwLock<Vec<Praxis>>>>,
    Path((praxis_id, service_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut praxen = state.write();
    let praxis = praxen
        .iter_mut()
        .find(|p| p.id == praxis_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    let service = praxis
        .services
        .iter_mut()
        .find(|s| s.id == service_id)
        .ok_or(StatusCode::NOT_FOUND)?;

    service.latency_ms = Some(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64 % 100);
    service.last_checked = chrono::Utc::now();

    Ok(Json(json!({
        "service_id": service.id,
        "latency_ms": service.latency_ms,
        "timestamp": chrono::Utc::now(),
    })))
}
