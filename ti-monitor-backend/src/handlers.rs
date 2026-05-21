use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use serde_json::json;

use crate::models::{Praxis, Certificate, Status, calculate_cert_severity};
use crate::AppState;

pub async fn health() -> &'static str {
    "OK"
}

pub async fn get_praxen(
    State(state): State<AppState>,
) -> Json<Vec<Praxis>> {
    let praxen = state.praxen.read();
    Json(praxen.clone())
}

pub async fn get_praxis_detail(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Praxis>, StatusCode> {
    let praxen = state.praxen.read();
    praxen
        .iter()
        .find(|p| p.id == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

pub async fn get_service_detail(
    State(state): State<AppState>,
    Path((praxis_id, service_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let praxen = state.praxen.read();
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
        },
        "avg_latency_ms": calculate_avg_latency(&service.latency_history),
        "min_latency_ms": service.latency_history.iter().min().copied(),
        "max_latency_ms": service.latency_history.iter().max().copied(),
    })))
}

pub async fn get_certificates(
    State(state): State<AppState>,
) -> Json<Vec<Certificate>> {
    let praxen = state.praxen.read();
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
    State(state): State<AppState>,
    Path((praxis_id, service_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut praxen = state.praxen.write();
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
        "status": match service.status {
            Status::Ok => "ok",
            Status::Degraded => "degraded",
            Status::Down => "down",
            Status::Unknown => "unknown",
        }
    })))
}

pub async fn get_praxis_summary(
    State(state): State<AppState>,
) -> Json<serde_json::Value> {
    let praxen = state.praxen.read();
    
    let mut ok_count = 0;
    let mut degraded_count = 0;
    let mut down_count = 0;

    for praxis in praxen.iter() {
        match praxis.overall_status {
            Status::Ok => ok_count += 1,
            Status::Degraded => degraded_count += 1,
            Status::Down => down_count += 1,
            Status::Unknown => {}
        }
    }

    Json(json!({
        "total_praxen": praxen.len(),
        "ok": ok_count,
        "degraded": degraded_count,
        "down": down_count,
        "total_services": praxen.iter().map(|p| p.services.len()).sum::<usize>(),
    }))
}

pub async fn get_services_by_status(
    State(state): State<AppState>,
    Path(status_filter): Path<String>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    let praxen = state.praxen.read();
    let target_status = match status_filter.as_str() {
        "ok" => Status::Ok,
        "degraded" => Status::Degraded,
        "down" => Status::Down,
        _ => return Err(StatusCode::BAD_REQUEST),
    };

    let services: Vec<_> = praxen
        .iter()
        .flat_map(|praxis| {
            praxis
                .services
                .iter()
                .filter(|s| s.status == target_status)
                .map(move |service| {
                    json!({
                        "service_id": service.id,
                        "service_name": service.kind.as_str(),
                        "praxis_id": praxis.id,
                        "praxis_name": &praxis.name,
                        "location": &praxis.location,
                        "status": match service.status {
                            Status::Ok => "ok",
                            Status::Degraded => "degraded",
                            Status::Down => "down",
                            Status::Unknown => "unknown",
                        },
                        "latency_ms": service.latency_ms,
                        "last_checked": service.last_checked,
                    })
                })
        })
        .collect();

    Ok(Json(services))
}

fn calculate_avg_latency(history: &std::collections::VecDeque<u64>) -> Option<f64> {
    if history.is_empty() {
        return None;
    }
    let sum: u64 = history.iter().sum();
    Some(sum as f64 / history.len() as f64)
}
