/**
 * ERROR 404 — Shared TypeScript Definitions
 * AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
 */

// ==========================================
// 1. Core Enums and Severity Standards
// ==========================================

export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export type AlertUrgency = 'IMMEDIATE' | 'EXPECTED' | 'FUTURE' | 'PAST' | 'UNKNOWN';

export type AlertCertainty = 'OBSERVED' | 'LIKELY' | 'POSSIBLE' | 'UNLIKELY' | 'UNKNOWN';

export type WeatherHazardType =
  | 'HEAVY_RAINFALL'
  | 'CLOUDBURST'
  | 'THUNDERSTORM'
  | 'LIGHTNING'
  | 'FLASH_FLOOD'
  | 'GALE_WIND'
  | 'HAILSTORM'
  | 'CYCLONIC_GUST'
  | 'EXTREME_CONVECTION';

export type ServiceHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'STANDBY' | 'OFFLINE' | 'AWAITING_FEED';

export type QualityStatus = 'VALID' | 'PARTIAL' | 'STALE' | 'INVALID';

export type DataFreshnessLevel = 'FRESH' | 'RECENT' | 'STALE' | 'EXPIRED' | 'UNAVAILABLE';

export type UserRole = 'ADMIN' | 'METEOROLOGIST' | 'AUTHORITY' | 'OPERATOR' | 'PUBLIC';

export type RegionType = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'CITY' | 'CUSTOM';

export type DatasetSplitType = 'TRAIN' | 'VAL' | 'TEST';

export type ConvectiveLabelType =
  | 'NONE'
  | 'HEAVY_RAIN'
  | 'CLOUDBURST_POTENTIAL'
  | 'GALE_WIND'
  | 'CONVECTIVE_SURGE';

export type ImputationFlag = 'OBSERVED' | 'INTERPOLATED' | 'IMPUTED' | 'UNKNOWN';

export type PredictionTaskType =
  | 'HEAVY_RAIN'
  | 'SEVERE_CONVECTIVE'
  | 'GALE_WIND';

export type MLModelStatusType =
  | 'MODEL_READY'
  | 'MODEL_UNAVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'STALE_INPUT_DATA'
  | 'INFERENCE_ERROR';

// ==========================================
// 2. Geographic & Location Types
// ==========================================

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
}

export interface GeoBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Region {
  id: string;
  code: string;
  name: string;
  type: RegionType;
  parentRegionId?: string | null;
  boundingBox: GeoBoundingBox;
  centerCoordinates: GeoPoint;
  totalGridsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationReference {
  id: string;
  name: string;
  district: string;
  state: string;
  country: string;
  coordinates: GeoPoint;
  gridId?: string;
  regionId?: string;
}

// ==========================================
// 3. Hyper-Local Geospatial Grid Types
// ==========================================

export interface WeatherGridCell {
  id: string;
  gridCode: string;
  resolutionDegrees: number;
  resolutionKm: number;
  bounds: GeoBoundingBox;
  center: GeoPoint;
  polygonGeoJson?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  regionId?: string | null;
  regionName?: string | null;
  topographyType?: string | null;
  currentWeather?: GridWeatherState | null;
}

export interface GridWeatherState {
  id: string;
  gridId: string;
  gridCode: string;
  timestamp: string; // UTC ISO
  temperature: number | null; // °C
  feelsLike: number | null; // °C
  humidity: number | null; // %
  pressure: number | null; // hPa
  windSpeed: number | null; // km/h
  windDirection: number | null; // Degrees (0-360)
  windGust: number | null; // km/h
  rainfall: number | null; // mm
  precipitationRate: number | null; // mm/h
  visibility: number | null; // km
  cloudCover: number | null; // %
  weatherCondition: string | null;
  weatherCode: number | null;
  dataQuality: QualityStatus;
  dataFreshness: DataFreshnessLevel;
  freshnessSeconds: number;
  sourceCount: number;
  rawObservationIds: string[];
  aggregationMethod: 'NEAREST_VALID' | 'DISTANCE_WEIGHTED_AVERAGE' | 'SINGLE_STATION';
  createdAt: string;
}

export interface GridSpatialQueryResponse {
  totalCells: number;
  resolutionDegrees: number;
  resolutionKm: number;
  cells: WeatherGridCell[];
  queryBoundingBox?: GeoBoundingBox;
  centerPoint?: GeoPoint;
  radiusKm?: number;
}

export interface GridHistoryResponse {
  gridId: string;
  gridCode: string;
  resolutionDegrees: number;
  totalRecords: number;
  states: GridWeatherState[];
}

// ==========================================
// 4. ML Dataset & Feature Store Types (Phase 4)
// ==========================================

export interface Dataset {
  id: string;
  name: string;
  description: string;
  source: string;
  temporalResolutionMinutes: number;
  spatialResolutionDegrees: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetSplitStats {
  trainCount: number;
  valCount: number;
  testCount: number;
  trainStartDate: string;
  trainEndDate: string;
  valStartDate: string;
  valEndDate: string;
  testStartDate: string;
  testEndDate: string;
}

export interface DatasetQualityReport {
  datasetId: string;
  versionTag: string;
  totalRecords: number;
  timeRange: {
    start: string;
    end: string;
  };
  gridCount: number;
  missingnessPercentages: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    rainfall: number;
  };
  outlierCounts: {
    temperatureOutliers: number;
    pressureSpikes: number;
    extremeWindGusts: number;
  };
  classBalance: {
    noneCount: number;
    heavyRainCount: number;
    cloudburstCount: number;
    galeWindCount: number;
    convectiveSurgeCount: number;
  };
  temporalContinuityPct: number;
  overallQualityScore: number; // 0-100
}

export interface DatasetVersion {
  id: string;
  datasetId: string;
  versionTag: string;
  recordCount: number;
  splitStats: DatasetSplitStats;
  qualityReport: DatasetQualityReport;
  createdAt: string;
}

export interface FeatureVector {
  // Core Instantaneous (at time t)
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  rainfallRate: number | null;
  cloudCover: number | null;

  // Temporal Deltas (strictly <= t)
  tempDelta30m: number | null;
  pressureDelta30m: number | null;
  humidityDelta30m: number | null;
  windSpeedDelta30m: number | null;

  // Barometric Tendency (strictly <= t)
  pressureTendencyHpaPerHr: number | null;

  // Rolling Aggregations (strictly <= t)
  rollingRainAccum30m: number | null;
  rollingRainAccum60m: number | null;
  rollingMeanTemp60m: number | null;
  rollingMaxWind60m: number | null;

  // Cyclical Temporal Features
  hourSin: number;
  hourCos: number;
  dayOfYearSin: number;
  dayOfYearCos: number;
}

export interface FeatureRecord {
  id: string;
  datasetVersionId: string;
  gridId: string;
  gridCode: string;
  timestamp: string; // UTC ISO
  splitType: DatasetSplitType;
  features: FeatureVector;
  targets: {
    targetRain15m: number | null;
    targetRain30m: number | null;
    targetRain60m: number | null;
    targetConvectiveEvent: ConvectiveLabelType;
  };
  createdAt: string;
}

// ==========================================
// 5. ML Baseline Prediction & Model Registry (Phase 5)
// ==========================================

export interface PredictiveFeatureContribution {
  featureName: string;
  featureValue: number | string | null;
  relativeContribution: number; // 0-1 score of importance
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
}

export interface MLPredictionResult {
  id: string;
  gridId: string;
  gridCode: string;
  task: PredictionTaskType;
  horizonMinutes: number;
  prediction: boolean;
  probability: number; // 0.0 - 1.0 calibrated
  decisionThreshold: number;
  severityLevel: SeverityLevel;
  modelVersion: string;
  algorithm: string;
  generatedAt: string;
  featureTimestamp: string;
  dataFreshnessSeconds: number;
  status: MLModelStatusType;
  topFeatures: PredictiveFeatureContribution[];
  explanationSummary: string;
}

export interface ModelSkillMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  decisionThreshold: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
}

export interface ModelCard {
  modelId: string;
  modelVersion: string;
  task: PredictionTaskType;
  horizonMinutes: number;
  algorithm: 'LogisticRegression' | 'RandomForestClassifier' | 'GradientBoostingClassifier';
  datasetVersion: string;
  trainingSamplesCount: number;
  validationSamplesCount: number;
  testSamplesCount: number;
  trainingPeriod: { start: string; end: string };
  testPeriod: { start: string; end: string };
  metrics: ModelSkillMetrics;
  featureNames: string[];
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CANDIDATE';
}

export interface ModelComparisonResult {
  task: PredictionTaskType;
  horizonMinutes: number;
  models: ModelCard[];
  bestModelVersion: string;
  selectionRationale: string;
}

// ==========================================
// 6. Telemetry & Real Weather Observation
// ==========================================

export interface WeatherAttribution {
  providerName: string;
  sourceUrl: string;
  license: string;
}

export interface WeatherMetricValue<T = number> {
  value: T | null;
  unit: string;
  status: 'LIVE' | 'AWAITING_DATA' | 'CALCULATING' | 'SENSOR_OFFLINE';
  timestamp?: string;
  anomalyDetected?: boolean;
}

export interface NormalizedWeatherObservation {
  id: string;
  provider: string;
  locationId?: string;
  gridId?: string;
  latitude: number;
  longitude: number;
  observedAt: string; // ISO UTC
  receivedAt: string; // ISO UTC
  freshnessSeconds: number;
  dataFreshness: DataFreshnessLevel;
  qualityStatus: QualityStatus;
  temperature: number | null; // °C
  feelsLike: number | null; // °C
  humidity: number | null; // %
  pressure: number | null; // hPa
  windSpeed: number | null; // km/h
  windDirection: number | null; // Degrees (0-360)
  windGust: number | null; // km/h
  rainfall: number | null; // mm
  precipitationRate: number | null; // mm/h
  visibility: number | null; // km
  cloudCover: number | null; // %
  weatherCondition: string | null;
  weatherCode: number | null; // WMO Code
  attribution: WeatherAttribution;
}

export interface WeatherObservation {
  id: string;
  locationId: string;
  gridId?: string;
  timestamp: string;
  temperature: WeatherMetricValue<number>;
  humidity: WeatherMetricValue<number>;
  windSpeed: WeatherMetricValue<number>;
  windDirection: WeatherMetricValue<number>;
  pressure: WeatherMetricValue<number>;
  rainfallRate: WeatherMetricValue<number>;
  rainfallAccumulation1h: WeatherMetricValue<number>;
  cloudTopHeight: WeatherMetricValue<number>;
  radarReflectivityDbz: WeatherMetricValue<number>;
  lightningStrikeDensity: WeatherMetricValue<number>;
  sourceStation: string;
}

// ==========================================
// 7. Ingestion Telemetry & Provider Status
// ==========================================

export interface WeatherIngestionStatusResponse {
  provider: string;
  activeProvider: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'STANDBY' | 'ERROR';
  lastSuccessfulFetch: string | null;
  lastAttempt: string | null;
  lastError: string | null;
  recordsProcessed: number;
  cachedEntries: number;
  refreshIntervalSeconds: number;
  attribution: WeatherAttribution;
}

// ==========================================
// 8. Nowcast & AI Prediction Contracts
// ==========================================

export interface StormVector {
  speedKmh: number;
  directionHeadingDeg: number;
  bearingCardinal: string;
  estimatedLeadTimeMin: number;
}

export interface PredictionConfidenceBreakdown {
  ensembleAgreementPct: number;
  radarEchoCorrelation: number;
  spatialEntropy: number;
  overallScore: number;
}

export interface NowcastPredictionInterval {
  stepMinutes: number;
  forecastTime: string;
  rainfallIntensityMmPerHour: number | null;
  convectiveRiskPct: number | null;
  severity: SeverityLevel | null;
  confidenceScore: number | null;
}

export interface NowcastPredictionResult {
  id: string;
  modelRunId: string;
  modelName: string;
  modelVersion: string;
  targetGridId: string;
  generatedAt: string;
  leadTimeMinutes: number;
  hazardType: WeatherHazardType;
  overallSeverity: SeverityLevel;
  intervals: NowcastPredictionInterval[];
  stormVector: StormVector | null;
  confidence: PredictionConfidenceBreakdown | null;
  affectedRadiusKm: number | null;
  estimatedImpactPopulation: number | null;
  modelEngineStatus: 'IDLE_AWAITING_WEIGHTS' | 'ACTIVE' | 'CALIBRATING';
}

// ==========================================
// 9. Emergency Alerts & Common Alerting Protocol (CAP)
// ==========================================

export interface WeatherAlert {
  id: string;
  identifier: string;
  sender: string;
  sentAt: string;
  status: 'ACTUAL' | 'EXERCISE' | 'SYSTEM' | 'TEST';
  msgType: 'ALERT' | 'UPDATE' | 'CANCEL';
  scope: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
  hazardType: WeatherHazardType;
  severity: SeverityLevel;
  urgency: AlertUrgency;
  certainty: AlertCertainty;
  headline: string;
  description: string;
  instruction: string;
  effectiveAt: string;
  expiresAt: string;
  affectedAreas: {
    areaDesc: string;
    polygon?: GeoPoint[];
    circle?: { center: GeoPoint; radiusKm: number };
  }[];
  issuedByAuthority: string;
  verified: boolean;
}

// ==========================================
// 10. System Health & Telemetry
// ==========================================

export interface ServiceTelemetry {
  status: ServiceHealthStatus;
  latencyMs: number;
  uptimeSeconds: number;
  lastSyncAt: string | null;
  details?: Record<string, unknown>;
}

export interface SystemStatusResponse {
  platform: 'ERROR 404 — Severe Weather Nowcasting Platform';
  version: string;
  environment: string;
  timestamp: string;
  overallStatus: ServiceHealthStatus;
  services: {
    apiGateway: ServiceTelemetry;
    database: ServiceTelemetry;
    mlEngine: ServiceTelemetry;
    radarIngest: ServiceTelemetry;
    alertDispatch: ServiceTelemetry;
  };
  metrics: {
    activeConnections: number;
    memoryUsageMb: number;
    cpuLoadPercent: number;
  };
}

// ==========================================
// 11. Spatio-Temporal Nowcasting Types (Phase 6)
// ==========================================

export type SpatioTemporalModelType = 'ConvLSTM' | 'SpatialEncoderGRU' | 'TemporalConvNet';

export interface RainfallConfidenceInterval {
  lower: number;
  upper: number;
  confidenceLevel: number; // e.g. 0.90 (90%)
}

export interface HorizonNowcast {
  horizonMinutes: number; // +10, +20, +30, +60
  forecastTimestamp: string;
  expectedRainfall: number; // mm/h
  rainfallConfidenceInterval: RainfallConfidenceInterval;
  expectedWindSpeed: number; // km/h
  eventProbabilities: {
    heavyRain: number; // 0.0 - 1.0
    severeConvective: number; // 0.0 - 1.0
    galeWind: number; // 0.0 - 1.0
  };
  uncertaintyScore: number; // 0.0 (high certainty) to 1.0 (high uncertainty)
  severity: SeverityLevel;
}

export interface SpatialRiskContribution {
  gridId: string;
  relativeWeight: number;
  isUpwind: boolean;
  distanceKm: number;
}

export interface SpatioTemporalPredictionResult {
  id: string;
  gridId: string;
  gridCode: string;
  modelType: SpatioTemporalModelType;
  modelVersion: string;
  featureScalerVersion: string;
  device: 'cuda' | 'mps' | 'cpu';
  generatedAt: string;
  inputSequenceLength: number;
  inputSequenceEndTimestamp: string;
  dataFreshnessSeconds: number;
  status: MLModelStatusType | 'INSUFFICIENT_HISTORY';
  horizons: HorizonNowcast[];
  spatialNeighborhood: {
    height: number;
    width: number;
    centerGridId: string;
    neighborhoodCellsCount: number;
  };
  explainability: {
    spatialRiskContributions: SpatialRiskContribution[];
    topTemporalFeatures: PredictiveFeatureContribution[];
    summary: string;
  };
}

export interface SpatioTemporalModelCard {
  modelId: string;
  modelVersion: string;
  modelType: SpatioTemporalModelType;
  datasetVersion: string;
  featureScalerVersion: string;
  inputSequenceLength: number;
  spatialNeighborhoodSize: string; // "3x3 (1.1km grid)"
  horizons: number[]; // [10, 20, 30, 60]
  channels: string[];
  trainingSamplesCount: number;
  validationSamplesCount: number;
  testSamplesCount: number;
  trainingPeriod: { start: string; end: string };
  testPeriod: { start: string; end: string };
  metrics: {
    rainfallMae: number;
    rainfallRmse: number;
    f1Score: number;
    precision: number;
    recall: number;
    prAuc: number;
    brierScore: number;
  };
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CANDIDATE';
}

export interface ModelBenchmarkComparison {
  task: string;
  horizonMinutes: number;
  baselineModel: {
    name: string;
    version: string;
    precision: number;
    recall: number;
    f1Score: number;
    prAuc: number;
    brierScore: number;
  };
  advancedModel: {
    name: string;
    version: string;
    mae: number;
    rmse: number;
    precision: number;
    recall: number;
    f1Score: number;
    prAuc: number;
    brierScore: number;
  };
  performanceDelta: {
    f1DeltaPct: number;
    brierImprovementPct: number;
    summary: string;
  };
}

// ============================================================================
// PHASE 7: MULTI-SOURCE WEATHER INTELLIGENCE & DATA FUSION TYPES
// ============================================================================

export type WeatherSourceType =
  | 'OBSERVATION'
  | 'RADAR'
  | 'SATELLITE'
  | 'LIGHTNING'
  | 'NUMERICAL_MODEL'
  | 'ALERT_FEED';

export type SourceHealthStatus =
  | 'ACTIVE'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'NOT_CONFIGURED';

export type SourceQualityFlag =
  | 'VALID'
  | 'PARTIAL'
  | 'STALE'
  | 'SUSPECT'
  | 'INVALID'
  | 'UNAVAILABLE';

export interface WeatherSourceMetadata {
  sourceId: string;
  sourceName: string;
  sourceType: WeatherSourceType;
  provider: string;
  version: string;
  coverage: string;
  spatialResolution: string;
  temporalResolution: string;
  status: SourceHealthStatus;
  lastSuccessfulFetch: string | null;
  attribution: string;
  configurationStatus: 'CONFIGURED' | 'NOT_CONFIGURED';
  latencyMs?: number;
  updateIntervalMinutes: number;
}

export interface RadarObservation {
  id: string;
  source: string;
  timestamp: string;
  coverage: string;
  resolutionKm: number;
  productType: 'REFLECTIVITY_DBZ' | 'RAIN_RATE_MMH' | 'RADIAL_VELOCITY_KMH';
  value: number;
  quality: SourceQualityFlag;
  createdAt: string;
}

export interface SatelliteObservation {
  id: string;
  source: string;
  timestamp: string;
  productType: 'CLOUD_COVER_PCT' | 'CLOUD_TOP_TEMP_C' | 'SOLAR_IRRADIANCE_WM2';
  resolutionKm: number;
  value: number;
  quality: SourceQualityFlag;
}

export interface LightningObservation {
  id: string;
  source: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  strikeCount: number;
  spatialDensityPerKm2: number;
  peakCurrentKa?: number;
  quality: SourceQualityFlag;
}

export interface NWPObservation {
  id: string;
  source: string;
  modelName: string;
  forecastTime: string;
  temperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  precipitationRate: number;
  quality: SourceQualityFlag;
}

export interface FusedGridWeatherState {
  id: string;
  gridId: string;
  gridCode: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windGust: number | null;
  windDirection: number | null;
  rainfall: number | null;
  precipitationRate: number | null;
  radarReflectivityDbz: number | null;
  satelliteCloudCover: number | null;
  lightningStrikeDensity: number | null;
  nwpExpectedRain: number | null;
  dataQuality: SourceQualityFlag;
  dataFreshnessSeconds: number;
  sourceMetadata: Array<{
    sourceId: string;
    sourceType: WeatherSourceType;
    provider: string;
    weight: number;
  }>;
  qualityMetadata: {
    overallReliabilityScore: number;
    conflictDetected: boolean;
    conflictResolutionReason?: string;
  };
  fusionVersion: string;
}

export interface FusionLineage {
  id: string;
  fusedStateId: string;
  variableName: string;
  selectedSourceId: string;
  contributingSources: Array<{
    sourceId: string;
    provider: string;
    rawValue: number;
    weight: number;
  }>;
  conflictResolutionReason: string;
  timestamp: string;
}

// ============================================================================
// PHASE 8: HYPER-LOCAL RISK INTELLIGENCE & EARLY WARNING ENGINE TYPES
// ============================================================================

export type HazardType =
  | 'HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'STRONG_WIND'
  | 'EXTREME_RAINFALL'
  | 'SEVERE_WEATHER';

export type RiskLevel =
  | 'NORMAL'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'
  | 'SEVERE';

export type RiskDataQualityStatus =
  | 'VALID'
  | 'PARTIAL'
  | 'STALE'
  | 'INSUFFICIENT_DATA'
  | 'MODEL_UNAVAILABLE';

export type RiskAssessmentStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUPERSEDED'
  | 'INVALID'
  | 'RISK_UNAVAILABLE';

export interface RiskExplanationFactor {
  factorName: string;
  factorValue: number | string;
  relativeContribution: number;
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
  explanationText: string;
}

export interface RiskTimelineStep {
  horizonMinutes: number;
  validFrom: string;
  validUntil: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0–100 Application Risk Score
  modelProbability: number; // 0.0–1.0 Model Probability
  uncertaintyScore: number; // 0.0–1.0 Predictive Uncertainty
  primaryHazard: HazardType;
  summary: string;
}

export interface RiskAssessmentResult {
  riskId: string;
  gridId: string;
  gridCode: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  riskScore: number; // 0–100 Application Risk Score
  modelProbability: number; // 0.0–1.0 Model Probability
  uncertaintyScore: number; // 0.0–1.0 Predictive Dispersion
  validFrom: string;
  validUntil: string;
  generatedAt: string;
  status: RiskAssessmentStatus;
  dataQuality: RiskDataQualityStatus;
  modelVersion: string;
  fusionVersion: string;
  explanation: {
    primaryDrivers: RiskExplanationFactor[];
    summary: string;
  };
  timeline: RiskTimelineStep[];
  disclaimer: string;
}

export interface RiskHotspotCluster {
  hotspotId: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  peakRiskScore: number;
  affectedGridCount: number;
  centroid: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  gridIds: string[];
  estimatedSpeedKmh: number;
  estimatedDirectionDeg: number;
  validUntil: string;
}

export interface RiskOverviewSummary {
  activeHotspotsCount: number;
  highestRiskHazard: HazardType;
  highestRiskLevel: RiskLevel;
  peakRiskScore: number;
  maxModelProbability: number;
  dataQualityStatus: RiskDataQualityStatus;
  evaluatedGridsCount: number;
  generatedAt: string;
}

export interface RiskStateTransitionRecord {
  id: string;
  gridId: string;
  hazardType: HazardType;
  fromLevel: RiskLevel;
  toLevel: RiskLevel;
  riskScore: number;
  reason: string;
  timestamp: string;
}

export interface RiskVerificationRecord {
  id: string;
  assessmentId: string;
  gridId: string;
  hazardType: HazardType;
  predictedRiskScore: number;
  predictedRiskLevel: RiskLevel;
  observedMetricValue: number;
  outcomeClass: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'TRUE_NEGATIVE' | 'FALSE_NEGATIVE';
  verifiedAt: string;
}

// ============================================================================
// PHASE 9: EARLY-WARNING DELIVERY & NOTIFICATION INFRASTRUCTURE TYPES
// ============================================================================

export type AlertEventStatus = 'ACTIVE' | 'UPDATED' | 'EXPIRED' | 'CANCELLED';

export type AlertEventOrigin =
  | 'AI_MODEL_ASSESSMENT'
  | 'OFFICIAL_EXTERNAL_ALERT'
  | 'VERIFIED_OBSERVATION';

export type AlertDecisionType =
  | 'NO_ALERT'
  | 'CREATE_ALERT'
  | 'UPDATE_ALERT'
  | 'EXPIRE_ALERT';

export interface AlertEvent {
  alertId: string;
  hazardType: HazardType;
  gridId: string;
  gridCode: string;
  riskLevel: RiskLevel;
  riskScore: number;
  probability: number;
  uncertaintyScore: number;
  title: string;
  description: string;
  origin: AlertEventOrigin;
  validFrom: string;
  validUntil: string;
  modelVersion: string;
  fusionVersion: string;
  status: AlertEventStatus;
  explanationSummary?: string;
  contributingSources?: string[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'IN_APP' | 'WEB_PUSH' | 'EMAIL';

export type NotificationStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'EXPIRED'
  | 'SKIPPED'
  | 'DEAD_LETTER';

export type NotificationSkipReason =
  | 'WRONG_HAZARD'
  | 'WRONG_LOCATION'
  | 'RISK_BELOW_PREFERENCE'
  | 'EXPIRED_ALERT'
  | 'USER_DISABLED_CHANNEL'
  | 'DUPLICATE_NOTIFICATION'
  | 'QUIET_HOURS'
  | 'PROVIDER_UNAVAILABLE'
  | 'CHANNEL_NOT_CONFIGURED';

export interface UserSubscription {
  subscriptionId: string;
  userId: string;
  userName?: string;
  channel: NotificationChannel;
  endpoint: string; // e.g. in-app user ID, push endpoint JSON, or email address
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  gridId?: string | null;
  hazardPreferences: HazardType[];
  minimumRiskLevel: RiskLevel;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null; // e.g. "23:00"
  quietHoursEnd?: string | null; // e.g. "07:00"
  bypassQuietHoursForSevere: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  notificationId: string;
  alertId: string;
  subscriptionId: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  gridId: string;
  origin: AlertEventOrigin;
  status: NotificationStatus;
  skipReason?: NotificationSkipReason | null;
  retryCount: number;
  maxRetries: number;
  nextAttemptAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failureReason?: string | null;
  deduplicationKey: string;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDeliveryReceipt {
  receiptId: string;
  notificationId: string;
  channel: NotificationChannel;
  providerStatus: string;
  providerMessageId?: string | null;
  attemptNumber: number;
  latencyMs: number;
  timestamp: string;
}

export interface NotificationPolicyDecision {
  shouldSend: boolean;
  action: 'SEND' | 'SKIP';
  reason?: NotificationSkipReason;
  matchedCriteria: {
    locationMatched: boolean;
    hazardMatched: boolean;
    riskThresholdMatched: boolean;
    quietHoursSuppressed: boolean;
  };
}

export interface NotificationMetrics {
  alertsCreated: number;
  alertsActive: number;
  alertsExpired: number;
  notificationsQueued: number;
  notificationsSent: number;
  notificationsDelivered: number;
  notificationsFailed: number;
  notificationsSkipped: number;
  deadLetterCount: number;
  queueDepth: number;
  activeSubscriptionsCount: number;
  providersStatus: Record<
    NotificationChannel,
    'AVAILABLE' | 'NOT_CONFIGURED' | 'DISABLED' | 'FAILED'
  >;
  timestamp: string;
}
