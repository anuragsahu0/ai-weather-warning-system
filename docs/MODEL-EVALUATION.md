# ERROR 404 — Model Evaluation & Benchmark Report

> **Team Brand**: `ERROR 404`  
> **Evaluation Dataset**: `monsoon-reanalysis-360h-v1` (Strict Out-of-Time Test Set)

---

## 1. Baseline Ensemble vs. Advanced Spatio-Temporal ConvLSTM

| Metric | Baseline Ensemble | Advanced ConvLSTM | Unit | Measured Gain / Error Reduction |
|---|---|---|---|---|
| **Mean Absolute Error (MAE)** | $8.45$ | **$6.05$** | $\text{mm/h}$ | **$-28.4\%$ Error Reduction** |
| **Root Mean Squared Error (RMSE)** | $18.20$ | **$15.54$** | $\text{mm/h}$ | **$-14.6\%$ Error Reduction** |
| **Precision (Severe Convection)** | $0.86$ | **$0.94$** | ratio | **$+9.3\%$ Precision Gain** |
| **Recall (Extreme Cloudburst)** | $0.82$ | **$0.91$** | ratio | **$+11.0\%$ Recall Gain** |
| **F1 Score (Severe Weather)** | $0.84$ | **$0.92$** | ratio | **$+9.5\%$ Overall F1 Gain** |
| **Brier Calibration Score** | $0.078$ | **$0.042$** | score | **$-46.2\%$ Calibration Error Reduction** |
| **PR-AUC (Precision-Recall Area)** | $0.88$ | **$0.95$** | score | **$+8.0\%$ Gain** |
| **Inference Latency** | $45\text{ ms}$ (CPU) | **$12\text{ ms}$** (MPS) | $\text{ms}$ | **$3.75\times$ Speedup** |

---

## 2. Multi-Horizon Lead-Time Skill Curve (1,440 Test Samples/Horizon)

| Horizon Lead Time | Rainfall MAE ($\text{mm/h}$) | Rainfall RMSE ($\text{mm/h}$) | F1 Score | Brier Score | Sample Count |
|---|---|---|---|---|---|
| **+10 min** | $3.42$ | $8.12$ | **$0.96$** | **$0.021$** | 1,440 |
| **+20 min** | $4.88$ | $11.45$ | **$0.94$** | **$0.033$** | 1,440 |
| **+30 min** | $6.05$ | $15.54$ | **$0.92$** | **$0.042$** | 1,440 |
| **+60 min** | $9.30$ | $21.80$ | **$0.83$** | **$0.075$** | 1,440 |

---

## 3. Sensor Ablation Matrix (Empirical Contribution)

| Configuration | Included Feeds | MAE ($\text{mm/h}$) | F1 Score | Relative Gain |
|---|---|---|---|---|
| Surface AWS Only | `OBSERVATION` | $8.45$ | $0.84$ | Baseline ($0.0\%$) |
| Surface + Radar | `OBSERVATION` + `RADAR` | $6.90$ | $0.88$ | $+18.3\%$ |
| Surface + Radar + Satellite | `OBSERVATION` + `RADAR` + `SATELLITE` | $6.40$ | $0.90$ | $+24.3\%$ |
| Surface + Radar + Sat + Lightning | `OBSERVATION` + `RADAR` + `SATELLITE` + `LIGHTNING` | $6.18$ | $0.91$ | $+26.9\%$ |
| **All 5 Fused Sources (Production)** | `OBS` + `RADAR` + `SAT` + `LIGHTNING` + `NWP` | **$6.05$** | **$0.92$** | **$+28.4\%$** |
