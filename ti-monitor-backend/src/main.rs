mod models;
mod handlers;
mod simulator;
mod ws;

use axum::{
    routing::{get, post},
    extract::State,
    Router,
};
use std::sync::Arc;
use parking_lot::RwLock;
use tower_http::cors::CorsLayer;
use tokio::sync::broadcast;

#[derive(Clone)]
pub struct AppState {
    pub praxen: Arc<RwLock<Vec<models::Praxis>>>,
    pub tx: Arc<broadcast::Sender<ws::MonitorMessage>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // Initialize shared state
    let praxen = Arc::new(RwLock::new(vec![]));
    
    // Populate with mock data
    let mut data = praxen.write();
    *data = models::init_mock_praxen();
    drop(data);

    // Create broadcast channel for WebSocket updates (max 100 messages in buffer)
    let (tx, _rx) = broadcast::channel(100);
    let tx = Arc::new(tx);

    let app_state = AppState {
        praxen: praxen.clone(),
        tx: tx.clone(),
    };

    // Start simulator task
    let state_for_simulator = praxen.clone();
    let tx_for_simulator = tx.clone();
    tokio::spawn(async move {
        simulator::run_monitor_loop(state_for_simulator, tx_for_simulator).await;
    });

    // Build router
    let app = Router::new()
        .route("/api/health", get(handlers::health))
        .route("/api/praxen", get(handlers::get_praxen))
        .route("/api/praxen/summary", get(handlers::get_praxis_summary))
        .route("/api/praxen/:id", get(handlers::get_praxis_detail))
        .route("/api/praxen/:id/services/:sid", get(handlers::get_service_detail))
        .route("/api/services/by-status/:status", get(handlers::get_services_by_status))
        .route("/api/certs", get(handlers::get_certificates))
        .route("/api/praxen/:id/services/:sid/ping", post(handlers::ping_service))
        .route("/ws/monitor", get(ws::websocket_handler))
        .with_state(app_state)
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    
    println!("🚀 Server running on http://127.0.0.1:3000");
    println!("📡 WebSocket available at ws://127.0.0.1:3000/ws/monitor");
    axum::serve(listener, app).await.unwrap();
}
