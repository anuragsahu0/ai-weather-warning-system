# ERROR 404 — Transparent Scientific & Operational Limitations

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Meteorological & Physical Boundaries

1. **AI Model Assessment Distinction**: All system outputs represent automated AI/ML model assessments and do **NOT** constitute official statutory government weather warnings or legal evacuation directives. Authoritative alerts issued by IMD/NDMA remain the statutory source of record.
2. **Doppler Radar Line-of-Sight Dependency**: Quantitative Precipitation Estimation (QPE) at sub-kilometer resolution depends on active radar reflectivity feeds. In deep mountainous terrain where radar beams are blocked, spatial fidelity drops to satellite and surface gauge resolution.
3. **Data Quality Freshness Gate**: If input telemetry age exceeds 30 minutes ($1800\text{ s}$), the engine halts evaluation and outputs `RISK_UNAVAILABLE` rather than fabricating fake predictions.
4. **Extreme Outlier Scarcity**: Unprecedented extreme cloudburst anomalies ($>100\text{ mm/h}$) represent rare statistical events. While historical reanalysis provides robust training for convective cells up to $80\text{ mm/h}$, unprecedented anomalies carry higher predictive uncertainty.
