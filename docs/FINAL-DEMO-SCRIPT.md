# ERROR 404 — 5-Minute Live Presenter Demo Script

> **Target Audience**: SIH Judging Panel  
> **Total Time**: Exactly 5 Minutes  
> **Presenter**: ERROR 404 Pitch Lead

---

## 1. Timing & Action Breakdown

| Timestamp | Route / Screen | Presenter Action | Spoken Talking Points |
|---|---|---|---|
| **0:00–0:30** | `/sih/judge` | Show Problem Strip | &ldquo;Respected judges, localized convective cloudbursts develop in under 45 minutes over 1 to 5 km zones. Broad 10–25km regional forecasts miss these localized flash events. ERROR 404 bridges this with a 1.1km AI nowcaster.&rdquo; |
| **0:30–1:00** | `/architecture` | Show Pipeline Visualizer | &ldquo;Our architecture ingests 5 real sensor feeds, maps them onto a deterministic PostGIS 1.1km grid, runs a deep ConvLSTM model on hardware, and computes an explainable 0–100 Risk Score.&rdquo; |
| **1:00–1:40** | `/map` | Zoom into 1.1km Grid Cells | &ldquo;Here is the live 1.1km grid over Delhi NCR. Each bounding cell has independent multi-source weather states and calibrated Doppler radar reflectivity overlays.&rdquo; |
| **1:40–2:20** | `/demo/control-center` | Select Replay & Step to T+00 | &ldquo;To demonstrate our event lifecycle, we load a verified monsoon cloudburst reanalysis. Notice our persistent badge clearly distinguishing REPLAY from LIVE data. At T+00, rainfall is 14 mm/h with a 38.5 dBZ core.&rdquo; |
| **2:20–3:00** | `/demo/control-center` | Step to T+10 & T+20 | &ldquo;At T+10, our ConvLSTM nowcasts storm intensification to 42 mm/h. At T+20, peak cloudburst hits 64 mm/h with lightning density at 24/km². The Risk Index escalates to 89 (SEVERE RISK), detecting a 4-cell spatial hotspot cluster.&rdquo; |
| **3:00–3:40** | `/alerts` | Inspect CAP Alert | &ldquo;The alert engine generates a CAP v1.2 emergency alert carrying the mandatory AI_MODEL_ASSESSMENT attribution. The notification worker asynchronously dispatches SHA-256 deduplicated push and email notifications.&rdquo; |
| **3:40–4:20** | `/demo/control-center` | Step to T+30 | &ldquo;As the storm dissipates to 32 dBZ, our asymmetric hysteresis state machine smoothly transitions the risk score to 32 without flapping. We scroll down to inspect the verifiable end-to-end lineage trace.&rdquo; |
| **4:20–5:00** | `/sih/evidence/model` & `/limitations` | Show Metrics & Wrap Up | &ldquo;On 360 hours of out-of-time reanalysis, ConvLSTM achieved a 28.4% MAE reduction and a 46.2% calibration improvement. We conclude with honest scientific disclosure: our outputs are AI assessments, and stale data (>30m) halts risk scoring. Thank you.&rdquo; |
