import { gridEngine } from '../geospatial/gridEngine.js';
import { WeatherGridCell } from '../../../../shared/types/index.js';

export class SpatialAligner {
  mapPointToGrid(lat: number, lon: number, resolutionDegrees = 0.01): WeatherGridCell {
    return gridEngine.getGridCell(lat, lon, resolutionDegrees);
  }

  computeSpatialProximityWeight(
    pointLat: number,
    pointLon: number,
    gridCenterLat: number,
    gridCenterLon: number
  ): number {
    const distKm = gridEngine.calculateDistanceKm(
      { latitude: pointLat, longitude: pointLon },
      { latitude: gridCenterLat, longitude: gridCenterLon }
    );

    // Inverse distance weighting within 5km radius
    if (distKm < 0.1) return 1.0;
    const weight = 1.0 / (1.0 + distKm * 0.5);
    return Math.max(0.2, Math.min(1.0, Number(weight.toFixed(3))));
  }
}

export const spatialAligner = new SpatialAligner();
