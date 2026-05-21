mod models;
mod handlers;
mod simulator;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use parking_lot::RwLock;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // Initialize shared state
    let app_state = Arc::new(RwLock::new(vec![]));
    
    // Populate with mock data
    let mut praxen = app_state.write();
    *praxen = models::init_mock_praxen();
    drop(praxen);

    // Start simulator task
    let state_for_simulator = app_state.clone();
    tokio::spawn(async move {
        simulator::run_monitor_loop(state_for_simulator).await;
    });

    // Build router
    let app = Router::new()
        .route("/api/health", get(handlers::health))
        .route("/api/praxen", get(handlers::get_praxen))
        .route("/api/praxen/:id", get(handlers::get_praxis_detail))
        .route("/api/praxen/:id/services/:sid", get(handlers::get_service_detail))
        .route("/api/certs", get(handlers::get_certificates))
        .route("/api/praxen/:id/services/:sid/ping", post(handlers::ping_service))
        .with_state(app_state)
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    
    println!("🚀 Server running on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
