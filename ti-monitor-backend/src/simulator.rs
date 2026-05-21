use crate::models::{Praxis, Status, ServiceKind};
use chrono::Utc;
use parking_lot::RwLock;
use rand::{SeedableRng, RngCore};
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

pub struct MonitorStats {
    pub down_services: usize,
    pub degraded_services: usize,
    pub total_services: usize,
}

pub async fn run_monitor_loop(state: Arc<RwLock<Vec<Praxis>>>) {
    let mut rng = rand::rngs::StdRng::from_entropy();
    let mut cycle = 0;
    let mut service_states: std::collections::HashMap<uuid::Uuid, ServiceState> = std::collections::HashMap::new();

    loop {
        sleep(Duration::from_secs(10)).await;
        cycle += 1;

        let mut praxen = state.write();

        for praxis in praxen.iter_mut() {
            for service in &mut praxis.services {
                let service_id = service.id;

                // Get or create service state tracking
                let state_entry = service_states.entry(service_id).or_insert_with(ServiceState::new);

                // Update down/degraded counter
                if state_entry.down_cycles > 0 {
                    state_entry.down_cycles -= 1;
                    if state_entry.down_cycles == 0 {
                        service.status = Status::Degraded;
                        state_entry.degraded_cycles = rng.next_u32() as usize % 3 + 1;
                    }
                } else if state_entry.degraded_cycles > 0 {
                    state_entry.degraded_cycles -= 1;
                    if state_entry.degraded_cycles == 0 {
                        service.status = Status::Ok;
                    }
                } else {
                    // Normal operation: small chance of degradation/failure
                    let rand_val = rng.next_u32() % 1000;
                    if rand_val < 20 {
                        // 2% chance: go Down (1-3 cycles)
                        service.status = Status::Down;
                        state_entry.down_cycles = rng.next_u32() as usize % 3 + 1;
                    } else if rand_val < 70 {
                        // 5% chance: go Degraded (1-2 cycles)
                        service.status = Status::Degraded;
                        state_entry.degraded_cycles = rng.next_u32() as usize % 2 + 1;
                    } else {
                        service.status = Status::Ok;
                    }
                }

                // Simulate latency with realistic Gaussian-ish distribution
                let base_latency = match service.kind {
                    ServiceKind::IDP => 45,
                    ServiceKind::EPA => 60,
                    ServiceKind::KIM => 80,
                    ServiceKind::ERezept => 70,
                    ServiceKind::OCSP => 30,
                    ServiceKind::PoPP => 50,
                };

                let jitter = (rng.next_u32() % 40).saturating_sub(20) as i32;
                let latency = match service.status {
                    Status::Ok => ((base_latency as i32 + jitter).max(20)) as u64,
                    Status::Degraded => ((base_latency as i32 + jitter + 50).max(50)) as u64,
                    Status::Down | Status::Unknown => 9999,
                };

                service.latency_ms = Some(latency);
                service.last_checked = Utc::now();

                // Add to history (keep max 50 values)
                if service.latency_history.len() >= 50 {
                    service.latency_history.pop_front();
                }
                service.latency_history.push_back(latency);
            }

            // Update overall status (worst of all services)
            praxis.overall_status = praxis
                .services
                .iter()
                .map(|s| s.status)
                .max_by_key(|s| status_priority(*s))
                .unwrap_or(Status::Ok);
        }

        let stats = calculate_stats(&praxen);
        tracing::info!(
            "Monitor cycle {}: {} praxen | {} down | {} degraded | {} total services",
            cycle,
            praxen.len(),
            stats.down_services,
            stats.degraded_services,
            stats.total_services
        );
    }
}

#[derive(Debug, Clone, Copy)]
struct ServiceState {
    down_cycles: usize,
    degraded_cycles: usize,
}

impl ServiceState {
    fn new() -> Self {
        Self {
            down_cycles: 0,
            degraded_cycles: 0,
        }
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

fn calculate_stats(praxen: &[Praxis]) -> MonitorStats {
    let mut down = 0;
    let mut degraded = 0;
    let mut total = 0;

    for praxis in praxen {
        for service in &praxis.services {
            total += 1;
            match service.status {
                Status::Down => down += 1,
                Status::Degraded => degraded += 1,
                _ => {}
            }
        }
    }

    MonitorStats {
        down_services: down,
        degraded_services: degraded,
        total_services: total,
    }
}
