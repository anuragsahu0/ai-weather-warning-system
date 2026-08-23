# ERROR 404 — End-to-End System Architecture

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Architectural Pipeline Overview

```
DATA SOURCES (Surface AWS, Doppler Radar, Satellite IR, Lightning, NWP)
     ↓
INGESTION (Multi-Provider Adapters & Normalizers)
     ↓
QUALITY CONTROL (Zod Runtime Bounds & Freshness Gates)
     ↓
SPATIAL GRID (1.1km Deterministic PostGIS Bounding Cells)
     ↓
MULTI-SOURCE FUSION (Weighted Deterministic Lineage Engine)
     ↓
SPATIO-TEMPORAL MODEL (PyTorch ConvLSTM on Apple MPS / CUDA)
     ↓
NOWCAST (Multi-Horizon Predictions: +10m, +20m, +30m, +60m)
     ↓
RISK ENGINE (0-100 Score, 5 Hazard Strategies & Hysteresis)
     ↓
ALERT ENGINE (CAP v1.2 Decision & Attribution Formatter)
     ↓
NOTIFICATION (Async Queue, SHA-256 Deduplication, Multi-Channel)
     ↓
MONITORING & VERIFICATION (K8s Probes, Lineage Audit & Confusion Matrix)
```

---

## 2. Detailed Layer Specifications

### Layer 1: Data Sources
- **Input**: External weather feeds (Open-Meteo GTS, RainViewer DWR, EUMETSAT, WWLLN, ECMWF IFS).
- **Processing**: Periodic polling and webhook ingestion ($5\text{ min}$ to $15\text{ min}$ cycles).
- **Output**: Raw provider payloads with timestamps.
- **Failure Handling**: Source flagged `UNAVAILABLE` or `DEGRADED`; system falls back to remaining active feeds.

### Layer 2: Ingestion & Normalization
- **Input**: Raw provider JSON / binary payloads.
- **Processing**: Coordinate rounding, ISO UTC normalization, and unit conversion ($^\circ\text{C}$, $\text{hPa}$, $\text{km/h}$, $\text{mm/h}$).
- **Output**: Normalized `NormalizedWeatherObservation` records.
- **Failure Handling**: Parsing errors logged with source metadata; bad payloads discarded.

### Layer 3: Quality Control & Gates
- **Input**: Normalized weather records.
- **Processing**: Zod schema validation, physical bounds checking (e.g. Reject Temp $> 65^\circ\text{C}$ or Humidity $< 0\%$), and telemetry freshness check ($> 1800\text{ s}$ is stale).
- **Output**: Validated observations with `QualityStatus` (`VALID`, `PARTIAL`, `STALE`, `INVALID`).
- **Failure Handling**: Stale or out-of-bounds telemetry halts risk calculation and flags `RISK_UNAVAILABLE`.

### Layer 4: 1.1km Spatial Grid Engine
- **Input**: Validated observations with latitude/longitude.
- **Processing**: Maps coordinates to discrete $0.01^\circ$ PostGIS bounding cells (`GRID_R01_Nxxxx_Exxxx`) using Inverse Distance Weighting (IDW).
- **Output**: Structured `GridWeatherState` spatial instances.
- **Failure Handling**: Out-of-bounds coordinates clamped or rejected; in-memory spatial cache fallback if DB is unreachable.

### Layer 5: Multi-Source Data Fusion
- **Input**: Multiple observations for the same grid cell within a $\pm 15\text{ min}$ temporal window.
- **Processing**: Deterministic weighted fusion ($30\%$ Surface AWS, $60\%$ Radar, $10\%$ NWP) and variable-level provenance logging.
- **Output**: `FusedGridWeatherState` and immutable `FusionLineage` records.
- **Failure Handling**: If radar is offline, weights dynamically redistribute across Surface AWS ($70\%$) and NWP ($30\%$).

### Layer 6: Spatio-Temporal Nowcasting Model
- **Input**: 6-step temporal history tensor sequences $[B, T=6, C=6, H=5, W=5]$.
- **Processing**: 3-layer Convolutional LSTM forward pass executed on Apple Silicon MPS / NVIDIA CUDA GPUs.
- **Output**: Multi-horizon rainfall intensity, convective event probabilities, and Monte Carlo predictive uncertainty.
- **Failure Handling**: If history $< 6$ steps, returns `INSUFFICIENT_HISTORY`; fallback to local baseline ensemble.

### Layer 7: Nowcast Contract Layer
- **Input**: Raw neural tensor predictions.
- **Processing**: Horizon formatting ($+10\text{m}$, $+20\text{m}$, $+30\text{m}$, $+60\text{m}$) and $90\%$ confidence interval calculation.
- **Output**: `SpatioTemporalPredictionResult` contracts.
- **Failure Handling**: Latency timeouts trigger cached prediction fallback with `DATA_AGING` warning.

### Layer 8: Hyper-Local Risk Intelligence Engine
- **Input**: `FusedGridWeatherState` + `SpatioTemporalPredictionResult`.
- **Processing**: 5 hazard risk formulas, uncertainty penalty damping, and asymmetric hysteresis state machine ($61$ activate / $56$ deactivate).
- **Output**: Calibrated $0–100$ `RiskAssessmentResult` and contiguous `RiskHotspotCluster` arrays.
- **Failure Handling**: Missing inputs trigger `RISK_UNAVAILABLE` without synthesizing artificial scores.

### Layer 9: CAP v1.2 Alert Decision Engine
- **Input**: `RiskAssessmentResult` + active alert state.
- **Processing**: Threshold evaluation (Risk $\ge 60$ triggers alert), origin tagging (`AI_MODEL_ASSESSMENT`), and OASIS CAP v1.2 XML/JSON formatting.
- **Output**: Active `AlertEvent` objects.
- **Failure Handling**: Alert generation suppressed if telemetry is stale or data quality is invalid.

### Layer 10: Notification & Early-Warning Infrastructure
- **Input**: Active `AlertEvent` + User Subscriptions.
- **Processing**: Spatial grid matching, hazard preference filtering, SHA-256 deduplication hashing, and asynchronous queue worker dispatch.
- **Output**: Delivered `NotificationRecord` dispatches across In-App, Web Push, and Email.
- **Failure Handling**: Failed network deliveries retried with exponential backoff ($2^n \times 1\text{ s}$) up to 3 times before moving to Dead Letter Queue (`DEAD_LETTER`).

### Layer 11: Monitoring, Observability & Verification
- **Input**: System execution telemetry and ground-truth verified outcomes.
- **Processing**: Kubernetes `/health/live` and `/health/ready` probes, Population Stability Index (PSI) feature drift monitoring, and Confusion Matrix outcome classification.
- **Output**: Live `SystemHealthReport` and empirical benchmark dashboards.
- **Failure Handling**: Subsystem health degradation reported in Mission Control UI without application crashes.
