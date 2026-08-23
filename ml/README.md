# ERROR 404 — Machine Learning Architecture Specification

## Pipeline Overview
The ERROR 404 Machine Learning Engine is engineered for hyper-local (1km x 1km grid) severe convective weather nowcasting with a 0 to 6 hour forecast lead time.

```
Data Ingestion (Doppler Weather Radar + INSAT-3D/3DR Satellite + Surface AWS Mesonets)
          ↓
[preprocessing/] -> Quality control, clutter suppression, Z-R relationship calibration, grid normalization
          ↓
[models/]        -> Spatiotemporal Neural Networks (ConvLSTM, PhyDNet, U-Net, Optical Flow Ensemble)
          ↓
[inference/]     -> Real-time 15-minute step precipitation, hail, and convective cloudburst nowcasting
          ↓
[evaluation/]    -> Meteorological verification metrics (CSI, FAR, POD, ETS, BIAS, FSS)
```

## Phase 1 Status
- Service foundation initialized with FastAPI health monitoring endpoints.
- Ready for integration with trained weight artifacts in Phase 7.
- **Strict No-Fake-Predictions Policy**: Returns `IDLE_AWAITING_WEIGHTS` until validated models are integrated.
