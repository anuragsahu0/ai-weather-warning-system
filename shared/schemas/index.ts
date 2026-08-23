/**
 * ERROR 404 — Shared Zod Validation Schemas
 * AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
 */

import { z } from 'zod';

// ==========================================
// 1. Severity & Core Enums
// ==========================================

export const SeverityLevelSchema = z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']);

export const AlertUrgencySchema = z.enum(['IMMEDIATE', 'EXPECTED', 'FUTURE', 'PAST', 'UNKNOWN']);

export const AlertCertaintySchema = z.enum(['OBSERVED', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'UNKNOWN']);

export const QualityStatusSchema = z.enum(['VALID', 'PARTIAL', 'STALE', 'INVALID']);

export const DataFreshnessLevelSchema = z.enum(['FRESH', 'RECENT', 'STALE', 'EXPIRED', 'UNAVAILABLE']);

export const WeatherHazardTypeSchema = z.enum([
  'HEAVY_RAINFALL',
  'CLOUDBURST',
  'THUNDERSTORM',
  'LIGHTNING',
  'FLASH_FLOOD',
  'GALE_WIND',
  'HAILSTORM',
  'CYCLONIC_GUST',
  'EXTREME_CONVECTION',
]);

export const ServiceHealthStatusSchema = z.enum([
  'OPERATIONAL',
  'DEGRADED',
  'STANDBY',
  'OFFLINE',
  'AWAITING_FEED',
]);

export const RegionTypeSchema = z.enum(['COUNTRY', 'STATE', 'DISTRICT', 'CITY', 'CUSTOM']);

export const DatasetSplitTypeSchema = z.enum(['TRAIN', 'VAL', 'TEST']);

export const ConvectiveLabelTypeSchema = z.enum([
  'NONE',
  'HEAVY_RAIN',
  'CLOUDBURST_POTENTIAL',
  'GALE_WIND',
  'CONVECTIVE_SURGE',
]);

export const PredictionTaskTypeSchema = z.enum([
  'HEAVY_RAIN',
  'SEVERE_CONVECTIVE',
  'GALE_WIND',
]);

export const MLModelStatusTypeSchema = z.enum([
  'MODEL_READY',
  'MODEL_UNAVAILABLE',
  'INSUFFICIENT_DATA',
  'STALE_INPUT_DATA',
  'INFERENCE_ERROR',
]);

// ==========================================
// 2. Geographic Schemas
// ==========================================

export const GeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeMeters: z.number().optional(),
});

export const GeoBoundingBoxSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

export const WeatherAttributionSchema = z.object({
  providerName: z.string(),
  sourceUrl: z.string(),
  license: z.string(),
});

// ==========================================
// 3. Hyper-Local Grid Schemas
// ==========================================

export const GridCoordinateQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  resolution: z.coerce.number().min(0.001).max(1.0).default(0.01),
  includeWeather: z.coerce.boolean().default(true),
});

export const GridNearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.5).max(100).default(10),
  resolution: z.coerce.number().min(0.001).max(1.0).default(0.01),
  includeWeather: z.coerce.boolean().default(true),
});

export const GridBoundsQuerySchema = z.object({
  north: z.coerce.number().min(-90).max(90),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  west: z.coerce.number().min(-180).max(180),
  resolution: z.coerce.number().min(0.001).max(1.0).default(0.01),
  includeWeather: z.coerce.boolean().default(true),
  limit: z.coerce.number().min(1).max(1000).default(500),
});

export const GridHistoryQuerySchema = z.object({
  gridId: z.string().min(1),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
});

// ==========================================
// 4. ML Dataset & Feature Store Schemas (Phase 4)
// ==========================================

export const FeatureQuerySchema = z.object({
  gridId: z.string().optional(),
  datasetVersion: z.string().optional(),
  split: DatasetSplitTypeSchema.optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
});

export const DatasetImportRequestSchema = z.object({
  datasetName: z.string().default('error404-convective-reanalysis-v1'),
  regionCode: z.string().default('DELHI_NCR'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  temporalResolutionMinutes: z.coerce.number().default(60),
  spatialResolutionDegrees: z.coerce.number().default(0.01),
});

export const FeatureVectorSchema = z.object({
  temperature: z.number().nullable(),
  feelsLike: z.number().nullable(),
  humidity: z.number().nullable(),
  pressure: z.number().nullable(),
  windSpeed: z.number().nullable(),
  windDirection: z.number().nullable(),
  windGust: z.number().nullable(),
  rainfallRate: z.number().nullable(),
  cloudCover: z.number().nullable(),
  tempDelta30m: z.number().nullable(),
  pressureDelta30m: z.number().nullable(),
  humidityDelta30m: z.number().nullable(),
  windSpeedDelta30m: z.number().nullable(),
  pressureTendencyHpaPerHr: z.number().nullable(),
  rollingRainAccum30m: z.number().nullable(),
  rollingRainAccum60m: z.number().nullable(),
  rollingMeanTemp60m: z.number().nullable(),
  rollingMaxWind60m: z.number().nullable(),
  hourSin: z.number(),
  hourCos: z.number(),
  dayOfYearSin: z.number(),
  dayOfYearCos: z.number(),
});

export const FeatureRecordSchema = z.object({
  id: z.string(),
  datasetVersionId: z.string(),
  gridId: z.string(),
  gridCode: z.string(),
  timestamp: z.string(),
  splitType: DatasetSplitTypeSchema,
  features: FeatureVectorSchema,
  targets: z.object({
    targetRain15m: z.number().nullable(),
    targetRain30m: z.number().nullable(),
    targetRain60m: z.number().nullable(),
    targetConvectiveEvent: ConvectiveLabelTypeSchema,
  }),
  createdAt: z.string(),
});

// ==========================================
// 5. ML Baseline Prediction Schemas (Phase 5)
// ==========================================

export const BaselineNowcastQuerySchema = z.object({
  gridId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  task: PredictionTaskTypeSchema.default('HEAVY_RAIN'),
  horizon: z.coerce.number().min(10).max(120).default(30),
});

export const PredictiveFeatureContributionSchema = z.object({
  featureName: z.string(),
  featureValue: z.union([z.number(), z.string(), z.null()]),
  relativeContribution: z.number().min(0).max(1),
  direction: z.enum(['INCREASES_RISK', 'DECREASES_RISK', 'NEUTRAL']),
});

export const MLPredictionResultSchema = z.object({
  id: z.string(),
  gridId: z.string(),
  gridCode: z.string(),
  task: PredictionTaskTypeSchema,
  horizonMinutes: z.number(),
  prediction: z.boolean(),
  probability: z.number().min(0).max(1),
  decisionThreshold: z.number().min(0).max(1),
  severityLevel: SeverityLevelSchema,
  modelVersion: z.string(),
  algorithm: z.string(),
  generatedAt: z.string(),
  featureTimestamp: z.string(),
  dataFreshnessSeconds: z.number(),
  status: MLModelStatusTypeSchema,
  topFeatures: z.array(PredictiveFeatureContributionSchema),
  explanationSummary: z.string(),
});

// ==========================================
// 6. Telemetry Queries & Normalized Observation
// ==========================================

export const WeatherCoordinatesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  locationId: z.string().optional(),
});

export const TelemetryQuerySchema = z.object({
  locationId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  gridId: z.string().optional(),
});

export const ManualIngestRequestSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationId: z.string().optional(),
  force: z.boolean().default(false),
});

export const NormalizedWeatherObservationSchema = z.object({
  id: z.string(),
  provider: z.string(),
  locationId: z.string().optional(),
  gridId: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observedAt: z.string(),
  receivedAt: z.string(),
  freshnessSeconds: z.number().nonnegative(),
  dataFreshness: DataFreshnessLevelSchema,
  qualityStatus: QualityStatusSchema,
  temperature: z.number().min(-80).max(65).nullable(),
  feelsLike: z.number().min(-80).max(75).nullable(),
  humidity: z.number().min(0).max(100).nullable(),
  pressure: z.number().min(850).max(1100).nullable(),
  windSpeed: z.number().min(0).max(400).nullable(),
  windDirection: z.number().min(0).max(360).nullable(),
  windGust: z.number().min(0).max(450).nullable(),
  rainfall: z.number().min(0).nullable(),
  precipitationRate: z.number().min(0).nullable(),
  visibility: z.number().min(0).max(100).nullable(),
  cloudCover: z.number().min(0).max(100).nullable(),
  weatherCondition: z.string().nullable(),
  weatherCode: z.number().nullable(),
  attribution: WeatherAttributionSchema,
});

export const WeatherIngestionStatusSchema = z.object({
  provider: z.string(),
  activeProvider: z.string(),
  status: z.enum(['OPERATIONAL', 'DEGRADED', 'STANDBY', 'ERROR']),
  lastSuccessfulFetch: z.string().nullable(),
  lastAttempt: z.string().nullable(),
  lastError: z.string().nullable(),
  recordsProcessed: z.number(),
  cachedEntries: z.number(),
  refreshIntervalSeconds: z.number(),
  attribution: WeatherAttributionSchema,
});

export const NowcastQuerySchema = z.object({
  gridId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  leadTimeMinutes: z.coerce.number().min(15).max(360).default(60),
});

// ==========================================
// 7. Alert Filtering Schema
// ==========================================

export const AlertFilterSchema = z.object({
  severity: SeverityLevelSchema.optional(),
  hazardType: WeatherHazardTypeSchema.optional(),
  district: z.string().optional(),
  activeOnly: z.coerce.boolean().default(true),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ==========================================
// 8. System Health Response Schema
// ==========================================

export const ServiceTelemetrySchema = z.object({
  status: ServiceHealthStatusSchema,
  latencyMs: z.number(),
  uptimeSeconds: z.number(),
  lastSyncAt: z.string().nullable(),
  details: z.record(z.unknown()).optional(),
});

export const SystemStatusResponseSchema = z.object({
  platform: z.literal('ERROR 404 — Severe Weather Nowcasting Platform'),
  version: z.string(),
  environment: z.string(),
  timestamp: z.string(),
  overallStatus: ServiceHealthStatusSchema,
  services: z.object({
    apiGateway: ServiceTelemetrySchema,
    database: ServiceTelemetrySchema,
    mlEngine: ServiceTelemetrySchema,
    radarIngest: ServiceTelemetrySchema,
    alertDispatch: ServiceTelemetrySchema,
  }),
  metrics: z.object({
    activeConnections: z.number(),
    memoryUsageMb: z.number(),
    cpuLoadPercent: z.number(),
  }),
});

// ==========================================
// 9. Spatio-Temporal Nowcasting Schemas (Phase 6)
// ==========================================

export const SpatioTemporalNowcastQuerySchema = z.object({
  gridId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  horizon: z.coerce.number().min(10).max(120).default(30),
  task: PredictionTaskTypeSchema.default('HEAVY_RAIN'),
});

export const RainfallConfidenceIntervalSchema = z.object({
  lower: z.number(),
  upper: z.number(),
  confidenceLevel: z.number(),
});

export const HorizonNowcastSchema = z.object({
  horizonMinutes: z.number(),
  forecastTimestamp: z.string(),
  expectedRainfall: z.number(),
  rainfallConfidenceInterval: RainfallConfidenceIntervalSchema,
  expectedWindSpeed: z.number(),
  eventProbabilities: z.object({
    heavyRain: z.number(),
    severeConvective: z.number(),
    galeWind: z.number(),
  }),
  uncertaintyScore: z.number(),
  severity: SeverityLevelSchema,
});

export const SpatialRiskContributionSchema = z.object({
  gridId: z.string(),
  relativeWeight: z.number(),
  isUpwind: z.boolean(),
  distanceKm: z.number(),
});

export const SpatioTemporalPredictionResultSchema = z.object({
  id: z.string(),
  gridId: z.string(),
  gridCode: z.string(),
  modelType: z.enum(['ConvLSTM', 'SpatialEncoderGRU', 'TemporalConvNet']),
  modelVersion: z.string(),
  featureScalerVersion: z.string(),
  device: z.enum(['cuda', 'mps', 'cpu']),
  generatedAt: z.string(),
  inputSequenceLength: z.number(),
  inputSequenceEndTimestamp: z.string(),
  dataFreshnessSeconds: z.number(),
  status: z.union([MLModelStatusTypeSchema, z.literal('INSUFFICIENT_HISTORY')]),
  horizons: z.array(HorizonNowcastSchema),
  spatialNeighborhood: z.object({
    height: z.number(),
    width: z.number(),
    centerGridId: z.string(),
    neighborhoodCellsCount: z.number(),
  }),
  explainability: z.object({
    spatialRiskContributions: z.array(SpatialRiskContributionSchema),
    topTemporalFeatures: z.array(PredictiveFeatureContributionSchema),
    summary: z.string(),
  }),
});

// ============================================================================
// PHASE 7: MULTI-SOURCE WEATHER INTELLIGENCE & DATA FUSION SCHEMAS
// ============================================================================

export const WeatherSourceTypeSchema = z.enum([
  'OBSERVATION',
  'RADAR',
  'SATELLITE',
  'LIGHTNING',
  'NUMERICAL_MODEL',
  'ALERT_FEED',
]);

export const SourceHealthStatusSchema = z.enum([
  'ACTIVE',
  'DEGRADED',
  'UNAVAILABLE',
  'NOT_CONFIGURED',
]);

export const SourceQualityFlagSchema = z.enum([
  'VALID',
  'PARTIAL',
  'STALE',
  'SUSPECT',
  'INVALID',
  'UNAVAILABLE',
]);

export const FusedWeatherQuerySchema = z.object({
  gridId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  timestamp: z.string().optional(),
});

// ============================================================================
// PHASE 8: HYPER-LOCAL RISK INTELLIGENCE & EARLY WARNING SCHEMAS
// ============================================================================

export const HazardTypeSchema = z.enum([
  'HEAVY_RAIN',
  'THUNDERSTORM',
  'STRONG_WIND',
  'EXTREME_RAINFALL',
  'SEVERE_WEATHER',
]);

export const RiskLevelSchema = z.enum([
  'NORMAL',
  'WATCH',
  'ELEVATED',
  'HIGH',
  'SEVERE',
]);

export const RiskDataQualityStatusSchema = z.enum([
  'VALID',
  'PARTIAL',
  'STALE',
  'INSUFFICIENT_DATA',
  'MODEL_UNAVAILABLE',
]);

export const RiskAssessmentStatusSchema = z.enum([
  'ACTIVE',
  'EXPIRED',
  'SUPERSEDED',
  'INVALID',
  'RISK_UNAVAILABLE',
]);

export const RiskQuerySchema = z.object({
  gridId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  hazard: HazardTypeSchema.optional().default('HEAVY_RAIN'),
  horizon: z.coerce.number().int().min(0).max(60).optional().default(30),
});

export const RiskHotspotQuerySchema = z.object({
  hazard: HazardTypeSchema.optional(),
  horizon: z.coerce.number().int().min(0).max(60).optional().default(30),
});

// ============================================================================
// PHASE 9: EARLY-WARNING DELIVERY & NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationChannelSchema = z.enum(['IN_APP', 'WEB_PUSH', 'EMAIL']);

export const NotificationStatusSchema = z.enum([
  'QUEUED',
  'PROCESSING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'EXPIRED',
  'SKIPPED',
  'DEAD_LETTER',
]);

export const CreateSubscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().optional(),
  channel: NotificationChannelSchema.default('IN_APP'),
  endpoint: z.string().min(1, 'Endpoint / Target is required'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  radiusKm: z.number().min(0.5).max(100).optional().default(5.0),
  gridId: z.string().optional().nullable(),
  hazardPreferences: z
    .array(HazardTypeSchema)
    .min(1, 'Select at least one hazard preference')
    .default(['HEAVY_RAIN', 'THUNDERSTORM']),
  minimumRiskLevel: RiskLevelSchema.default('HIGH'),
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().optional().nullable(),
  quietHoursEnd: z.string().optional().nullable(),
  bypassQuietHoursForSevere: z.boolean().default(true),
  enabled: z.boolean().default(true),
});

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export const NotificationQuerySchema = z.object({
  userId: z.string().optional(),
  status: NotificationStatusSchema.optional(),
  channel: NotificationChannelSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const AlertEventQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'UPDATED', 'EXPIRED', 'CANCELLED']).optional(),
  hazard: HazardTypeSchema.optional(),
  gridId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
