import { QualityStatus, DataFreshnessLevel } from '@shared/types/index.js';

export interface WeatherAttribution {
  providerName: string;
  sourceUrl: string;
  license: string;
}

export interface RawProviderWeatherData {
  provider: string;
  latitude: number;
  longitude: number;
  observedAt: string; // ISO string or epoch
  temperature?: number | null;
  feelsLike?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  windSpeed?: number | null;
  windDirection?: number | null;
  windGust?: number | null;
  rainfall?: number | null;
  precipitationRate?: number | null;
  visibility?: number | null;
  cloudCover?: number | null;
  weatherCode?: number | null;
  weatherCondition?: string | null;
  rawPayload: Record<string, unknown>;
  attribution: WeatherAttribution;
}

export interface NormalizedWeatherData {
  id: string;
  provider: string;
  locationId?: string;
  gridId?: string;
  latitude: number;
  longitude: number;
  observedAt: string; // ISO string in UTC
  receivedAt: string; // ISO string in UTC
  freshnessSeconds: number;
  dataFreshness: DataFreshnessLevel;
  qualityStatus: QualityStatus;
  temperature: number | null; // °C
  feelsLike: number | null; // °C
  humidity: number | null; // %
  pressure: number | null; // hPa
  windSpeed: number | null; // km/h
  windDirection: number | null; // 0-360 degrees
  windGust: number | null; // km/h
  rainfall: number | null; // mm
  precipitationRate: number | null; // mm/h
  visibility: number | null; // km
  cloudCover: number | null; // %
  weatherCondition: string | null;
  weatherCode: number | null;
  attribution: WeatherAttribution;
}

export interface WeatherProviderStatus {
  name: string;
  isOperational: boolean;
  latencyMs: number;
  lastSuccessfulQuery: string | null;
  lastError: string | null;
  attribution: WeatherAttribution;
}

export interface IngestionResult {
  success: boolean;
  observation?: NormalizedWeatherData;
  isDuplicate?: boolean;
  error?: string;
  qualityStatus?: QualityStatus;
}
