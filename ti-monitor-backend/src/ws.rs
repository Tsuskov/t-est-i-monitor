use axum::{
    extract::{ws::WebSocket, State},
    extract::ws::WebSocketUpgrade,
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::broadcast;

use crate::models::Praxis;
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorMessage {
    pub r#type: String,
    pub data: serde_json::Value,
}

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state.praxen, state.tx))
}

async fn handle_socket(
    socket: WebSocket,
    praxen: Arc<RwLock<Vec<Praxis>>>,
    tx: Arc<broadcast::Sender<MonitorMessage>>,
) {
    let (mut sender, mut receiver) = socket.split();

    // Send initial state (drop guard before await)
    let initial_msg = {
        let data = praxen.read();
        MonitorMessage {
            r#type: "state_update".to_string(),
            data: json!({
                "praxen": data.clone(),
                "timestamp": chrono::Utc::now(),
            }),
        }
    };

    if let Ok(msg_str) = serde_json::to_string(&initial_msg) {
        let _ = sender
            .send(axum::extract::ws::Message::Text(msg_str))
            .await;
    }

    // Subscribe to broadcast updates
    let mut rx = tx.subscribe();

    // Spawn task to send broadcast updates to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let Ok(msg_str) = serde_json::to_string(&msg) {
                if sender
                    .send(axum::extract::ws::Message::Text(msg_str))
                    .await
                    .is_err()
                {
                    break;
                }
            }
        }
    });

    // Handle incoming messages from client (ping/close)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                axum::extract::ws::Message::Close(_) => break,
                axum::extract::ws::Message::Ping(_) => {
                    tracing::debug!("Ping received");
                }
                _ => {}
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }

    tracing::info!("WebSocket client disconnected");
}
