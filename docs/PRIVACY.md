# ERROR 404 — Citizen Location Privacy & Data Minimization

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Privacy-Preserving Location Architecture

1. **Discrete Grid Subscription**: Citizen subscriptions store only discrete $1.1\text{km}$ grid cell codes (`GRID_R01_Nxxxx_Exxxx`) or coarse reference centroids.
2. **Zero Continuous Tracking**: The system never tracks background GPS locations, movement paths, or travel histories.
3. **Data Minimization**: Subscriptions require only notification endpoints (push subscription JSON or email address) without requiring full legal identities or personal identifiers.
4. **User-Controlled Preferences**: Users configure specific hazard types, minimum risk thresholds (e.g. `HIGH` only), and quiet hours.
5. **Data Deletion**: Subscriptions can be deactivated or deleted instantly with zero lingering telemetry logs.
