use crate::models::{Praxis, Status};
use chrono::Utc;
use parking_lot::RwLock;
use rand::{SeedableRng, RngCore};
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

pub async fn run_monitor_loop(state: Arc<RwLock<Vec<Praxis>>>) {
    let mut rng = rand::rngs::StdRng::from_entropy();
    let mut cycle = 0;

    loop {
        sleep(Duration::from_secs(10)).await;
        cycle += 1;

        let mut praxen = state.write();

        for praxis in praxen.iter_mut() {
            for service in &mut praxis.services {
                // Simulate latency with some randomness
                let base_latency = service.latency_ms.unwrap_or(50);
                let jitter: i32 = ((rng.next_u32() % 50) as i32) - 20;
                let new_latency = ((base_latency as i32 + jitter).max(10)) as u64;

                service.latency_ms = Some(new_latency);
                service.last_checked = Utc::now();

                // Add to history (keep max 50 values)
                if service.latency_history.len() >= 50 {
                    service.latency_history.pop_front();
                }
                service.latency_history.push_back(new_latency);

                // Status transitions (5% degraded, 2% down)
                let rand_val = (rng.next_u32() % 100) as f32 / 100.0;
                if rand_val < 0.02 {
                    service.status = Status::Down;
                } else if rand_val < 0.07 {
                    service.status = Status::Degraded;
                } else if service.status != Status::Ok && ((rng.next_u32() % 100) as f32 / 100.0) < 0.3 {
                    // 30% recovery chance per cycle for non-Ok services
                    service.status = Status::Ok;
                }
            }

            // Update overall status (worst of all services)
            praxis.overall_status = praxis
                .services
                .iter()
                .map(|s| s.status)
                .max_by_key(|s| status_priority(*s))
                .unwrap_or(Status::Ok);
        }

        tracing::info!("Monitor cycle {}: {} praxen checked", cycle, praxen.len());
    }
}

fn status_priority(status: Status) -> i32 {
    match status {
        Status::Down => 3,
        Status::Degraded => 2,
        Status::Ok => 1,
        Status::Unknown => 0,
    }
}
