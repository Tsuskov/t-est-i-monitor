# TI-Monitor 🏥

Real-time monitoring dashboard for German healthcare IT services (Telematik-Infrastruktur).

## Project Structure

- **backend/** — Rust + Axum REST API + WebSocket server
- **frontend/** — React + TypeScript + Tailwind CSS dashboard

## Quick Start

### Backend

```bash
cd ti-monitor-backend
cargo build
cargo run
```

Server runs on `http://localhost:3000`

**API Endpoints:**
- `GET /api/health` — Health check
- `GET /api/praxen` — All practices with status
- `GET /api/praxen/:id` — Practice details
- `GET /api/certs` — Certificates sorted by expiration
- `POST /api/praxen/:id/services/:sid/ping` — Manual service check

### Frontend

```bash
cd ti-monitor-backend/ti-monitor-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Architecture

**Backend:**
- Simulated monitor engine (10s cycle)
- 5 practices × 6 services each
- Status: Ok, Degraded, Down, Unknown
- Latency tracking with history
- REST API + WebSocket (planned Phase 5)

**Frontend:**
- Dark theme with Slate-900 base
- Real-time practice grid
- Service status indicators
- Alert system
- Certificate expiration tracking
