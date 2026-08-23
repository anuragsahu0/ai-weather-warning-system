# ERROR 404 — Meteorological Data Sources & Ingestion Catalog

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Configured Real-Time Meteorological Feeds

| Source Identifier | Source Type | Provider / Network | Update Cycle | Spatial Resolution | Temporal Resolution | Status | Usage in Pipeline |
|---|---|---|---|---|---|---|---|
| `SRC_OBS_OPENMETEO_GTS` | Observation | Open-Meteo & WMO GTS Synoptic Ingest | 15 min | Point Station ($\approx 5\text{km}$) | Hourly / 15m | `ACTIVE` | Ground-truth surface temperature, pressure, humidity, wind, and gauge rainfall ($30\%$ Fusion Weight). |
| `SRC_RADAR_RAINVIEWER_QPE` | Remote Sensing (Radar) | RainViewer Doppler Weather Radar (DWR) | 10 min | $1.0\text{ km}$ Mosaic | 10 min | `ACTIVE` | Calibrated radar reflectivity ($\text{dBZ}$) and Quantitative Precipitation Estimation ($60\%$ Fusion Weight). |
| `SRC_SAT_EUMETSAT_IR` | Remote Sensing (Satellite) | EUMETSAT Geostationary Proxy | 15 min | $3.0\text{ km}$ Infrared | 15 min | `ACTIVE` | Cloud top brightness temperature ($^\circ\text{C}$) and convective cloud cover ($5\%$ Fusion Weight). |
| `SRC_LIGHTNING_WWLLN` | Telemetry (Lightning) | World Wide Lightning Location Network (WWLLN) | 5 min | $0.05^\circ$ Density | 5 min | `ACTIVE` | Convective updraft surge density ($\text{strikes/km}^2$) and peak current. |
| `SRC_NWP_ECMWF_GFS` | Numerical Weather Prediction | ECMWF Integrated Forecasting System (IFS) | 6 hours | $0.1^\circ$ ($\approx 10\text{km}$) | Hourly | `ACTIVE` | Synoptic steering flow, barometric gradient trend, and background precipitation ($10\%$ Fusion Weight). |

---

## 2. Source Limitations & Data Quality Guardrails

1. **Surface AWS Gaps**: Surface stations are unevenly distributed across complex mountainous terrain. IDW spatial averaging fills local gaps, and missing station telemetry is flagged as `INTERPOLATED` rather than synthetic ground truth.
2. **Doppler Radar Line-of-Sight**: Radar beams cannot penetrate mountain massifs (beam blockage). In regions without radar line-of-sight, the engine operates on Surface AWS + Satellite + NWP, reporting `RADAR_UNAVAILABLE`.
3. **Data Quality Freshness Gate**: Any meteorological telemetry older than 30 minutes ($1800\text{ s}$) is classified as `STALE`, which automatically halts risk scoring and reports `RISK_UNAVAILABLE`.
