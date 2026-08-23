# ERROR 404 — Deep Technical Architecture Demo Script

> **Target Audience**: Technical SIH Jury & Systems Evaluators  
> **Focus**: Code structure, tensor transformations, PostGIS spatial indexing, and hardware execution.

---

## 1. Technical Flow & Walkthrough

1. **Multi-Source Ingestion Code (`server/src/services/providers/`)**:
   - Show `sourceRegistry.ts` registering 5 distinct providers (`ObservationProvider`, `RadarProvider`, `SatelliteProvider`, `LightningProvider`, `NWPProvider`).
   - Highlight Zod runtime schema physical validation in `validationService.ts`.

2. **1.1km PostGIS Spatial Grid (`server/src/services/grid/`)**:
   - Show `gridEngine.ts` generating $0.01^\circ$ discrete cell codes `GRID_R01_Nxxxx_Exxxx`.
   - Show `spatialQueries.ts` executing GIST spatial bounding box queries and IDW spatial interpolation.

3. **Deterministic Data Fusion Engine (`server/src/services/fusion/`)**:
   - Show `dataFusionEngine.ts` executing the weighted fusion formula ($30\%$ AWS, $60\%$ Radar, $10\%$ NWP).
   - Inspect the immutable `FusionLineageRecord` provenance generation.

4. **PyTorch ConvLSTM Microservice (`ml/models/spatiotemporal.py`)**:
   - Show 3-layer `SpatioTemporalConvLSTM` processing 6-step 5D sliding tensors $[B, T=6, C=6, H=5, W=5]$.
   - Show hardware device binding to Apple Silicon Metal Performance Shaders (`mps`) executing in $12\text{ ms}$.

5. **Risk Engine & Asymmetric Hysteresis (`server/src/services/risk/`)**:
   - Show `riskEngineService.ts` evaluating 5 hazard strategies and applying uncertainty penalties.
   - Show `riskHysteresisService.ts` enforcing asymmetric state machine thresholds ($61$ activate / $56$ deactivate).

6. **Notification Worker & Deduplication (`server/src/services/notifications/`)**:
   - Show `notificationQueue.ts` calculating SHA-256 idempotency keys `hash(alertId:subscriptionId:riskLevel:channel)`.
   - Inspect exponential backoff retry worker and Dead Letter Queue (`DEAD_LETTER`).

7. **Subsystem Probes & Pre-Flight Diagnostics (`server/src/scripts/preflightCheck.ts`)**:
   - Run `npm run preflight` live in terminal to demonstrate 100% subsystem health verification.
