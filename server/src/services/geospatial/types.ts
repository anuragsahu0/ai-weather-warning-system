import { GeoPoint, GeoBoundingBox, WeatherGridCell, GridWeatherState, Region } from '@shared/types/index.js';

export interface GridResolutionConfig {
  resolutionDegrees: number; // e.g. 0.01
  resolutionKm: number; // ~1.11km at equator
  codePrefix: string; // e.g. "R01"
  description: string;
}

export const SUPPORTED_RESOLUTIONS: Record<string, GridResolutionConfig> = {
  HYPER_LOCAL: {
    resolutionDegrees: 0.01,
    resolutionKm: 1.1,
    codePrefix: 'R01',
    description: 'Hyper-Local ~1.1km Convective Core Grid',
  },
  MESO_SCALE: {
    resolutionDegrees: 0.05,
    resolutionKm: 5.5,
    codePrefix: 'R05',
    description: 'Meso-Scale ~5.5km Radar Super-Cell Grid',
  },
  REGIONAL: {
    resolutionDegrees: 0.1,
    resolutionKm: 11.0,
    codePrefix: 'R10',
    description: 'Regional ~11km Synoptic Sector Grid',
  },
};

export interface SpatialDistanceResult {
  cell: WeatherGridCell;
  distanceKm: number;
  bearingDeg: number;
}

export interface GridBoundingBoxQuery {
  north: number;
  south: number;
  east: number;
  west: number;
  resolution?: number;
  limit?: number;
  includeWeather?: boolean;
}

export interface GridRadiusQuery {
  latitude: number;
  longitude: number;
  radiusKm: number;
  resolution?: number;
  includeWeather?: boolean;
}
