import { GeoPoint, GeoBoundingBox, WeatherGridCell } from '@shared/types/index.js';
import { SUPPORTED_RESOLUTIONS, GridResolutionConfig } from './types.js';
import { ApiError } from '../../utils/apiError.js';

export class GridEngine {
  private defaultResolution = 0.01; // Default hyper-local ~1.1km grid

  validateCoordinates(latitude: number, longitude: number): void {
    if (isNaN(latitude) || isNaN(longitude)) {
      throw ApiError.badRequest('Latitude and longitude must be valid numbers');
    }
    if (latitude < -90 || latitude > 90) {
      throw ApiError.badRequest(`Latitude ${latitude} is out of physical range [-90, 90]`);
    }
    if (longitude < -180 || longitude > 180) {
      throw ApiError.badRequest(`Longitude ${longitude} is out of physical range [-180, 180]`);
    }
  }

  getResolutionConfig(resolutionDegrees: number = this.defaultResolution): GridResolutionConfig {
    if (resolutionDegrees >= 0.08) return SUPPORTED_RESOLUTIONS.REGIONAL;
    if (resolutionDegrees >= 0.03) return SUPPORTED_RESOLUTIONS.MESO_SCALE;
    return SUPPORTED_RESOLUTIONS.HYPER_LOCAL;
  }

  generateGridCode(latitude: number, longitude: number, resolution: number = this.defaultResolution): string {
    this.validateCoordinates(latitude, longitude);

    const config = this.getResolutionConfig(resolution);
    const step = config.resolutionDegrees;

    const latIndex = Math.floor(Number((latitude / step).toFixed(6)));
    const lngIndex = Math.floor(Number((longitude / step).toFixed(6)));

    const latDir = latIndex >= 0 ? 'N' : 'S';
    const lngDir = lngIndex >= 0 ? 'E' : 'W';

    const latStr = Math.abs(latIndex).toString().padStart(4, '0');
    const lngStr = Math.abs(lngIndex).toString().padStart(5, '0');

    return `GRID_${config.codePrefix}_${latDir}${latStr}_${lngDir}${lngStr}`;
  }

  getGridCell(
    latitude: number,
    longitude: number,
    resolution: number = this.defaultResolution,
    regionId?: string | null
  ): WeatherGridCell {
    this.validateCoordinates(latitude, longitude);

    const config = this.getResolutionConfig(resolution);
    const step = config.resolutionDegrees;

    const latIndex = Math.floor(Number((latitude / step).toFixed(6)));
    const lngIndex = Math.floor(Number((longitude / step).toFixed(6)));

    const southLat = Number((latIndex * step).toFixed(5));
    const northLat = Number(((latIndex + 1) * step).toFixed(5));
    const westLng = Number((lngIndex * step).toFixed(5));
    const eastLng = Number(((lngIndex + 1) * step).toFixed(5));

    const centerLat = Number(((southLat + northLat) / 2).toFixed(5));
    const centerLng = Number(((westLng + eastLng) / 2).toFixed(5));

    const gridCode = this.generateGridCode(latitude, longitude, resolution);

    const bounds: GeoBoundingBox = {
      north: northLat,
      south: southLat,
      east: eastLng,
      west: westLng,
    };

    const center: GeoPoint = {
      latitude: centerLat,
      longitude: centerLng,
    };

    const polygonGeoJson = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [westLng, southLat],
          [eastLng, southLat],
          [eastLng, northLat],
          [westLng, northLat],
          [westLng, southLat],
        ],
      ],
    };

    return {
      id: gridCode,
      gridCode,
      resolutionDegrees: step,
      resolutionKm: config.resolutionKm,
      bounds,
      center,
      polygonGeoJson,
      regionId: regionId ?? null,
    };
  }

  /**
   * Haversine distance in kilometers between two coordinates
   */
  calculateDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(p2.latitude - p1.latitude);
    const dLon = this.deg2rad(p2.longitude - p1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(p1.latitude)) *
        Math.cos(this.deg2rad(p2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(3));
  }

  /**
   * Initial bearing in degrees (0-360) from p1 to p2
   */
  calculateBearing(p1: GeoPoint, p2: GeoPoint): number {
    const y = Math.sin(this.deg2rad(p2.longitude - p1.longitude)) * Math.cos(this.deg2rad(p2.latitude));
    const x =
      Math.cos(this.deg2rad(p1.latitude)) * Math.sin(this.deg2rad(p2.latitude)) -
      Math.sin(this.deg2rad(p1.latitude)) *
        Math.cos(this.deg2rad(p2.latitude)) *
        Math.cos(this.deg2rad(p2.longitude - p1.longitude));

    const bearing = (this.rad2deg(Math.atan2(y, x)) + 360) % 360;
    return Number(bearing.toFixed(1));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }
}

export const gridEngine = new GridEngine();
