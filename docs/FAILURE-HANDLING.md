# ERROR 404 — Failure Handling & Graceful Degradation Matrix

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Graceful Degradation Matrix

| Failure Event | System Reaction & Degradation Behavior | User-Facing Indication |
|---|---|---|
| **Doppler Radar Offline** | Fusion engine reweights remaining active feeds ($70\%$ Surface AWS, $30\%$ NWP). Continues nowcasting on reduced spatial feature maps. | `RADAR: DEGRADED` (Source status ribbon updated; no crash). |
| **Surface AWS Offline** | Operates on Doppler radar QPE + Satellite cloud tops + NWP synoptic flow. | `AWS: UNAVAILABLE` |
| **All Telemetry Stale ($>30\text{ min}$)** | Risk engine strictly halts evaluation. Suppresses automated alert generation to prevent hallucinations. | `DATA: STALE — RISK_UNAVAILABLE` |
| **PostgreSQL DB Down** | Spatial cache automatically switches to low-latency memory store fallback mode. | `DB: LOCAL_MEMORY_FALLBACK` (System health warns; zero data loss). |
| **PyTorch Microservice Down** | Backend switches to native baseline ensemble nowcast engine with cached weights. | `NOWCAST: BASELINE_FALLBACK` |
| **Push Notification Failure** | Failed message automatically queued for exponential backoff retry ($1\text{s}, 2\text{s}, 4\text{s}$) up to 3 times before transitioning to `DEAD_LETTER`. | `STATUS: RETRYING / DEAD_LETTER` |
