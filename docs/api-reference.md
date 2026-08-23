# ERROR 404 — REST API Reference Specification

> **Base URL**: `http://localhost:5001/api`  
> **Health Probes**: `http://localhost:5001/health/live`, `http://localhost:5001/health/ready`  
> **Format**: JSON (`application/json`)

---

## 1. System Health & Observability Endpoints

### `GET /api/system/health`
Returns live health status, latency, error counts, and uptime for all 7 subsystems.

**Response**:
```json
{
  "success": true,
  "data": {
    "overallStatus": "HEALTHY",
    "timestamp": "2026-08-22T18:15:00.000Z",
    "uptimeSeconds": 1420,
    "environment": "production",
    "services": {
      "database": { "status": "HEALTHY", "latencyMs": 3, "errorCount": 0 },
      "nowcastingEngine": { "status": "HEALTHY", "latencyMs": 12, "errorCount": 0 },
      "notificationWorker": { "status": "HEALTHY", "latencyMs": 1, "errorCount": 0 }
    }
  }
}
```

### `GET /health/live` & `GET /liveness`
Kubernetes liveness probe. Returns HTTP `200 OK` `{ "status": "ALIVE" }`.

### `GET /health/ready` & `GET /readiness`
Kubernetes readiness probe. Returns HTTP `200 OK` `{ "status": "READY" }`.

### `GET /api/system/data-quality`
Returns telemetry age, expected refresh interval, physical validation, and freshness status for all 5 configured sensor feeds.

### `GET /api/system/model-metrics`
Returns comparative model metrics (Baseline vs ConvLSTM), horizon performance, source ablation gains, and drift PSI metrics.

---

## 2. Weather & Multi-Source Data Endpoints

### `GET /api/weather/current`
Returns live surface telemetry for active latitude/longitude.

### `GET /api/weather/fused`
Returns deterministic fused meteorological state with full lineage and sensor contribution breakdown.

### `GET /api/sources/status`
Returns status, health, and metadata for all 5 registered data providers.

---

## 3. Geospatial Grid Endpoints

### `GET /api/grid/cell`
Resolves continuous latitude/longitude into a deterministic 1.1km discrete bounding box (`gridId`).

### `GET /api/grid/state`
Returns aggregated surface weather metrics mapped to a specific grid cell.

---

## 4. AI Nowcasting Endpoints

### `GET /api/nowcast/predict`
Executes hardware-accelerated PyTorch Spatio-Temporal ConvLSTM nowcast for specified horizon (+10m, +20m, +30m, +60m).

---

## 5. Risk Intelligence Endpoints

### `GET /api/risk`
Returns localized 0–100 Application Risk Score, Model Probability, contributing factor explanations, and multi-horizon timeline.

### `GET /api/risk/hotspots`
Returns contiguous spatial risk hotspots with bounding geometries and estimated drift vectors.

---

## 6. Early-Warning Notification Endpoints

### `GET /api/notifications`
Returns user notification feed.

### `PATCH /api/notifications/:id/read`
Marks a specific notification as read.

### `GET /api/notifications/metrics`
Returns live delivery queue depth, sent/delivered/failed counts, and channel provider statuses.

### `POST /api/subscriptions`
Registers a new geographic early-warning subscription (Grid / Radius).

### `GET /api/alerts`
Returns active emergency `AlertEvent` records.
