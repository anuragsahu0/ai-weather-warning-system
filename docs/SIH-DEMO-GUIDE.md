# ERROR 404 — Smart India Hackathon (SIH) Live Demo Guide

> **Target Audience**: Presenter / Team ERROR 404 Pitch Lead  
> **Total Demo Duration**: 5 to 7 minutes  
> **Key Value Proposition**: AI-driven hyper-local early warning nowcasting on a 1.1km deterministic grid.

---

## 1. Quick Startup Commands
```bash
# 1. Run Pre-Flight Diagnostic Check
npm run preflight

# 2. Launch Local Servers (Already running in daemons)
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5001
# - PyTorch ML Microservice: http://localhost:8000
```

---

## 2. 15-Step Live Presenter Demonstration Flow

| Step | Time | Page URL | What to Show & Talking Points |
|---|---|---|---|
| **01** | `0:00` | `/demo/judge` | **Problem Statement**: "Coarse 10–25km NWP forecasts miss localized sub-kilometer cloudbursts. ERROR 404 bridges this with a 1.1km deterministic nowcaster." |
| **02** | `0:30` | `/architecture` | **Pipeline**: Show the 6-stage pipeline from Multi-Source Ingestion $\rightarrow$ PostGIS Grid $\rightarrow$ Data Fusion $\rightarrow$ ConvLSTM $\rightarrow$ Risk State Machine $\rightarrow$ Notification Queue. |
| **03** | `1:00` | `/map` | **Live GIS Map**: Point to the 1.1km discrete bounding cells over Delhi NCR / Mumbai. Show Doppler radar reflectivity overlay. |
| **04** | `1:30` | `/admin/data-quality` | **Sensor Quality Gate**: "We ingest 5 real feeds (Surface AWS, Radar, Satellite, Lightning, NWP). Stale telemetry (>30m) triggers automated fail-safes." |
| **05** | `2:00` | `/admin/models` | **Empirical Benchmark**: "ConvLSTM delivers a **28.4% error reduction** in MAE (8.45 $\rightarrow$ 6.05 mm/h) and a **46.2% improvement in calibration skill** (Brier 0.078 $\rightarrow$ 0.042)." |
| **06** | `2:30` | `/demo/control-center` | **Open Scenario Replay**: Select *Delhi NCR Monsoon Cloudburst Replay* (T+00 to T+30). Point out the persistent `↺ HISTORICAL REPLAY DATA` badge. |
| **07** | `3:00` | `/demo/control-center` | **Step to T+00**: Show initial inception (14 mm/h observed, 38.5 dBZ radar). ConvLSTM projects intensification (+30m lead time). Level: `WATCH`. |
| **08** | `3:30` | `/demo/control-center` | **Step to T+10**: Storm core intensifies to 46.8 dBZ. Risk Score crosses threshold to 68 (`HIGH RISK`). Hotspot cluster is formed (4 cells). |
| **09** | `4:00` | `/demo/control-center` | **Step to T+20**: Peak cloudburst (64 mm/h rate, 54.2 dBZ). Risk Score jumps to 89 (`SEVERE RISK`). Deduplicated early-warning alerts dispatched. |
| **10** | `4:30` | `/alerts` | **Alert Center**: Show the generated CAP v1.2 alert. Point out the explicit origin tag: `AI_MODEL_ASSESSMENT` and atmospheric attribution explanation. |
| **11** | `5:00` | `/demo/control-center` | **Step to T+30**: Storm dissipates to 32 dBZ. The asymmetric hysteresis state machine smoothly drops the score to 32 without flapping. |
| **12** | `5:30` | `/demo/control-center` | **Lineage Trace**: Scroll to the End-to-End Lineage chain showing exact provenance: $\text{weatherRecordId} \rightarrow \text{fusedId} \rightarrow \text{predId} \rightarrow \text{riskId} \rightarrow \text{alertId} \rightarrow \text{notifId}$. |
| **13** | `6:00` | `/demo/innovation` | **Core Innovations**: Highlight the 8 key implemented innovations (1.1km grid, ConvLSTM on MPS, weighted fusion, hysteresis, deduplication). |
| **14** | `6:30` | `/demo/impact` | **Municipal Decision Support**: Show evidence-based impact for stormwater pumping, traffic diversion, and passenger transit advisories. |
| **15** | `7:00` | `/limitations` | **Honest Limitations**: Conclude with scientific transparency—disclosing radar line-of-sight dependencies, quality gates, and AI assessment distinctions. |

---

## 3. Key Defensive Answers for Judges

1. **"Is this model output an official weather warning?"**  
   *Answer*: "No. Every alert explicitly carries the origin tag `AI_MODEL_ASSESSMENT` and a legal disclaimer. The system is designed as decision support for municipal emergency managers, not a statutory evacuation directive."

2. **"What happens if Doppler Radar goes offline?"**  
   *Answer*: "The Multi-Source Fusion Engine dynamically re-weights available feeds (Surface AWS + Satellite + NWP). If all telemetry is $>30\text{ min}$ old, the Data Quality Gate halts evaluation and reports `RISK_UNAVAILABLE` rather than fabricating fake predictions."

3. **"How do you prevent duplicate notification spam to citizens?"**  
   *Answer*: "Every notification dispatch is hashed using a deterministic SHA-256 idempotency key: `hash(alertId:subscriptionId:riskLevel:channel)`. Identical alerts within the same validity window are automatically recognized and dropped."
