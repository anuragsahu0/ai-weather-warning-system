import {
  Dataset,
  DatasetVersion,
  DatasetSplitStats,
  DatasetQualityReport,
  FeatureVector,
  FeatureRecord,
  DatasetSplitType,
  ConvectiveLabelType,
  ImputationFlag,
} from '../../../../shared/types/index.js';

export interface RawHistoricalTimeSeries {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m?: (number | null)[];
    relative_humidity_2m?: (number | null)[];
    apparent_temperature?: (number | null)[];
    precipitation?: (number | null)[];
    rain?: (number | null)[];
    surface_pressure?: (number | null)[];
    wind_speed_10m?: (number | null)[];
    wind_direction_10m?: (number | null)[];
    wind_gusts_10m?: (number | null)[];
    cloud_cover?: (number | null)[];
    weather_code?: (number | null)[];
  };
}

export interface NormalizedHistoricalObservation {
  id: string;
  latitude: number;
  longitude: number;
  gridId: string;
  gridCode: string;
  observedAt: string; // UTC ISO
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  rainfall: number | null;
  precipitationRate: number | null;
  cloudCover: number | null;
  weatherCondition: string | null;
  weatherCode: number | null;
  qualityFlag: 'VALID' | 'SUSPECT' | 'INVALID';
  imputationFlag: ImputationFlag;
}

export interface HistoricalImportOptions {
  datasetName: string;
  regionCode: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  temporalResolutionMinutes?: number;
  spatialResolutionDegrees?: number;
  trainRatio?: number;
  valRatio?: number;
  testRatio?: number;
}

export interface HistoricalPipelineResult {
  dataset: Dataset;
  version: DatasetVersion;
  totalRecords: number;
  splitStats: DatasetSplitStats;
  qualityReport: DatasetQualityReport;
  featureRecords: FeatureRecord[];
}
