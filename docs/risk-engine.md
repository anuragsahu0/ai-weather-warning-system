# ERROR 404 — Hyper-Local Risk Intelligence Engine

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Probability vs. Risk Score vs. Risk Level

| Metric Concept | Value Range | Representation & Operational Meaning |
|---|---|---|
| **Model Probability** | $0.0 \le P \le 1.0$ | Statistical likelihood of convective precipitation occurring at time $t$. |
| **Application Risk Score** | $0 \le S \le 100$ | Domain-specific synthesis combining model probability, rainfall intensity, radar reflectivity ($\text{dBZ}$), pressure gradients, and uncertainty penalty. |
| **Risk Level** | Categorical | Discrete operational state machine stages: `NORMAL` ($0–20$), `WATCH` ($21–40$), `ELEVATED` ($41–60$), `HIGH` ($61–80$), `SEVERE` ($81–100$). |

---

## 2. Risk Calculation Strategy & Formula

For each hazard (e.g. `HEAVY_RAIN`), the baseline score is computed as:
$$S_{\text{raw}} = 100 \times \left( 0.40 \cdot P_{\text{conv}} + 0.35 \cdot \min\left(1.0, \frac{R_{\text{rate}}}{50}\right) + 0.15 \cdot \min\left(1.0, \frac{\text{dBZ}}{55}\right) + 0.10 \cdot \min\left(1.0, \frac{-\Delta P_{30}}{4.0}\right) \right)$$

### Predictive Uncertainty Penalty
When predictive dispersion $\sigma$ exceeds the confidence threshold:
$$S_{\text{final}} = \max\left(0, \min\left(100, S_{\text{raw}} \cdot (1.0 - 0.15 \cdot U_{\text{score}})\right)\right)$$

---

## 3. Asymmetric Hysteresis State Machine

To eliminate alert flapping around decision boundaries (e.g. rapid toggling between $59$ and $61$):
- **Escalation Threshold**: Score must reach $\ge 61$ to transition to `HIGH`.
- **De-escalation Threshold**: Score must fall below $\le 56$ to return to `ELEVATED`.

---

## 4. Contiguous Spatial Hotspot Cluster Detection

1. **Neighbor Identification**: Evaluates 8-connected neighboring grid cells ($\le 1.5\text{ km}$ distance).
2. **Cluster Grouping**: Connected components of grid cells with Risk Score $\ge 60$ form a `RiskHotspotCluster`.
3. **Centroid & Drift**: Calculates cluster centroid coordinates $(\bar{\phi}, \bar{\lambda})$ and convective storm drift vector using historical centroid shifts across $t-15\text{m} \rightarrow t$.
