# ERROR 404 — Early Warning & Alert Decision Infrastructure

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Alert Decision Flow

```
Risk Assessment (Score ≥ 60)
     ↓
Data Quality Gate (Telemetry < 30m Check)
     ↓
Origin Tagging (AI_MODEL_ASSESSMENT vs OFFICIAL_EXTERNAL_ALERT)
     ↓
CAP v1.2 Protocol Formatter (ITU-T X.1303 Compliant Payload)
     ↓
Alert Event Generation (ALERT_DELHI_xxxx)
     ↓
Notification Policy Dispatch Gate
```

---

## 2. Origin Attribution & Legal Distinction

- **`AI_MODEL_ASSESSMENT`**: Applied to all internally generated nowcasts. Mandatory notice attached:  
  *&ldquo;ERROR 404 AI model assessment — Not an official government weather warning.&rdquo;*
- **`OFFICIAL_EXTERNAL_ALERT`**: Reserved exclusively for ingested authoritative NDMA / IMD CAP feeds.

---

## 3. OASIS Common Alerting Protocol (CAP v1.2) Compliance

Alert payloads conform to international emergency standard **ITU-T Recommendation X.1303 / OASIS CAP v1.2**:
- `identifier`: Unique deterministic alert event ID (`ALERT_DELHI_20240728_1410`).
- `sender`: `system@error404.in` (Attributed to Team ERROR 404 Early Warning Engine).
- `sentAt`: ISO 8601 UTC timestamp.
- `status`: `ACTUAL` (or `EXERCISE` in demo mode).
- `msgType`: `ALERT` / `UPDATE` / `CANCEL`.
- `scope`: `PUBLIC`.
- `hazardType`: Specific hazard code (`HEAVY_RAIN`, `THUNDERSTORM`, `EXTREME_RAINFALL`).
- `areaDesc`: $1.1\text{km}$ grid bounding box and centroid coordinate description.
