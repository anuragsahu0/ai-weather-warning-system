# ERROR 404 — Scientific Data Engineering & Feature Store Specification

> **Platform**: ERROR 404 — AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting  
> **Module**: Phase 4 Historical Weather Data Pipeline & ML Feature Store  
> **Version**: 1.0.0-phase4  
> **Standard**: WMO Guide to Meteorological Instruments and Methods of Observation (WMO-No. 8)

---

## 1. Data Source Strategy & Provenance

ERROR 404 ingests legitimate historical surface meteorological data from the **Open-Meteo Historical Weather Archive API**, which assimilates:
1. **WMO Global Telecommunication System (GTS)**: Real-world calibrated Automated Weather Stations (AWS) and surface synoptic observations (SYNOP).
2. **ECMWF ERA5 Reanalysis**: Atmospheric reanalysis combining observational data with general circulation physics models at $0.25^\circ$ synoptic grid and downscaled to hyper-local elevation grids ($0.01^\circ \approx 1.1\text{ km}$).

### Source Limitations
- Hourly temporal resolution from reanalysis requires interpolation/temporal alignment when sub-hourly records are required.
- High-frequency local micro-bursts ($< 15\text{ min}$) must be calibrated against radar reflectivity products in subsequent phases.

---

## 2. Strict Future Data Leakage Prevention

For any sample indexed at timestamp $t$:
$$\text{Feature Vector } X_t = f\left(\{O_\tau \mid \tau \le t\}\right)$$
$$\text{Target Labels } Y_t = g\left(\{O_\tau \mid \tau > t\}\right)$$

### Verification Rules
1. **Backward Lookup Only**: Features at time $t$ look strictly into observations at index $j \le i$.
2. **Forward Lookup for Targets**: Targets ($t+15\text{m}, t+30\text{m}, t+60\text{m}$) look strictly into observations at index $j > i$.
3. **Purely Chronological Splitting**:
   - **TRAIN (70%)**: Earliest chronological partition ($t \le T_{\text{train}}$)
   - **VAL (15%)**: Intermediate chronological partition ($T_{\text{train}} < t \le T_{\text{val}}$)
   - **TEST (15%)**: Most recent chronological partition ($t > T_{\text{val}}$)
4. **Zero Random Shuffling**: Random shuffling across time is strictly prohibited to prevent serial correlation leakage.

---

## 3. Engineered Meteorological Features ($X_t$)

| Feature Name | Type | Mathematical Formula | Physical Significance |
|---|---|---|---|
| `temperature` | Continuous | $T_t\ (^\circ\text{C})$ | Ambient surface thermal energy |
| `humidity` | Continuous | $RH_t\ (\%)$ | Atmospheric moisture saturation |
| `pressure` | Continuous | $P_t\ (\text{hPa})$ | Surface tropospheric barometric pressure |
| `windSpeed` | Continuous | $W_t\ (\text{km/h})$ | 10m anemometer velocity |
| `windGust` | Continuous | $WG_t\ (\text{km/h})$ | 10m peak convective wind gust |
| `rainfallRate`| Continuous | $R_t\ (\text{mm/h})$ | Instantaneous precipitation intensity |
| `tempDelta30m`| Delta | $T_t - T_{t-30\text{m}}$ | Cold pool outflow boundary indicator |
| `pressureDelta30m`| Delta | $P_t - P_{t-30\text{m}}$ | Meso-cyclone pressure surge/drop |
| `pressureTendencyHpaPerHr` | Tendency | $P_t - P_{t-60\text{m}}$ | Rapid drops ($< -2.0\text{ hPa/hr}$) indicate severe convective storm genesis |
| `rollingRainAccum30m` | Cumulative | $\sum_{\tau=t-30\text{m}}^t R_\tau$ | Flash flood runoff volume |
| `rollingRainAccum60m` | Cumulative | $\sum_{\tau=t-60\text{m}}^t R_\tau$ | Sustained inundation risk |
| `rollingMeanTemp60m` | Rolling Mean | $\bar{T}_{60\text{m}}$ | Thermal baseline |
| `rollingMaxWind60m` | Rolling Max | $\max(W_{60\text{m}}, WG_{60\text{m}})$ | Peak gust persistence |
| `hourSin`, `hourCos` | Cyclical | $\sin(2\pi h/24), \cos(2\pi h/24)$ | Diurnal convective solar cycle |
| `dayOfYearSin`, `dayOfYearCos` | Cyclical | $\sin(2\pi d/365.25), \cos(2\pi d/365.25)$ | Monsoon / Seasonal progression |

---

## 4. Multi-Horizon Targets & Authoritative Event Labels ($Y_t$)

| Target Name | Type | Definition & Threshold |
|---|---|---|
| `targetRain15m` | Continuous | Rainfall rate at $t + 15\text{ min}$ |
| `targetRain30m` | Continuous | Rainfall rate at $t + 30\text{ min}$ |
| `targetRain60m` | Continuous | Rainfall rate at $t + 60\text{ min}$ |
| `targetConvectiveEvent` | Categorical | WMO / IMD Authoritative Criteria: |
| — `NONE` | — | Normal precipitation ($< 15.0\text{ mm/h}$) |
| — `HEAVY_RAIN` | — | Rainfall rate $\ge 15.0\text{ mm/h}$ |
| — `CLOUDBURST_POTENTIAL` | — | Extreme localized precipitation $\ge 50.0\text{ mm/h}$ |
| — `GALE_WIND` | — | Sustained wind $\ge 50.0\text{ km/h}$ or gust $\ge 70.0\text{ km/h}$ |
| — `CONVECTIVE_SURGE` | — | Rainfall $\ge 5.0\text{ mm/h}$ following rapid barometric drop |

---

## 5. Dataset Quality & Missing Data Policy

- **Imputation Tracking**: Every observation record stores an `imputationFlag` (`OBSERVED`, `INTERPOLATED`, `IMPUTED`, `UNKNOWN`).
- **Physical Bounds Filtering**:
  - Temperatures outside $[-50^\circ\text{C}, +55^\circ\text{C}]$ are flagged `SUSPECT`.
  - Pressures outside $[870\text{ hPa}, 1080\text{ hPa}]$ are flagged `SUSPECT`.
  - Negative humidity or values $> 100\%$ are flagged `INVALID`.
- **Quality Score Formula**:
  $$\text{Quality Score} = 100 - \overline{\text{Missingness}}\% - 2 \times \text{Outlier Rate}\%$$
