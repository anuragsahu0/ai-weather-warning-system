# ERROR 404 — Meteorological Data Lake Architecture

This directory serves as the local filesystem data lake storage layer for historical meteorological observations, normalized series, grid-mapped sequences, ML feature vectors, and validation audit reports.

---

## Directory Organization

```
data/
├── raw/            # Raw, unmodified provider JSON payloads (immutable baseline)
├── normalized/     # Cleaned, schema-validated, unit-normalized records (°C, km/h, hPa, mm)
├── processed/      # Hyper-local spatial grid-mapped and temporally aligned time series
├── features/       # ML feature vectors (X_t) and multi-horizon target labels (Y_t)
└── validation/     # Automated dataset quality reports, class balance summaries, split metadata
```

---

## Data Governance & Lineage Rules

1. **Raw Immutability**: Files in `raw/` are NEVER modified or overwritten.
2. **Strict Chronological Ordering**: All processed files are indexed strictly by UTC timestamp.
3. **No Target Leakage**: Feature files in `features/` contain only past/current observation values ($t \le \text{timestamp}$).
4. **Reproducibility**: Every dataset version is linked to its source metadata, processing timestamp, and quality audit report.
