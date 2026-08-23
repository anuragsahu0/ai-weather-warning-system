import { WeatherGridCell, GeoBoundingBox } from '@shared/types/index.js';
import { gridEngine } from './gridEngine.js';
import { gridGenerator } from './gridGenerator.js';
import { regionService } from './regionService.js';
import { GridRadiusQuery, GridBoundingBoxQuery } from './types.js';

export class SpatialQueries {
  findGridContaining(
    latitude: number,
    longitude: number,
    resolution: number = 0.01
  ): WeatherGridCell {
    const region = regionService.findRegionByCoordinates(latitude, longitude);
    const cell = gridEngine.getGridCell(latitude, longitude, resolution, region?.id);
    if (region) {
      cell.regionName = region.name;
    }
    return cell;
  }

  findGridsInRadius(query: GridRadiusQuery): WeatherGridCell[] {
    const { latitude, longitude, radiusKm, resolution = 0.01 } = query;

    gridEngine.validateCoordinates(latitude, longitude);

    // Approximate bounding box based on radius (1 deg latitude ~ 111 km)
    const latDelta = radiusKm / 111.0;
    const lonDelta = radiusKm / (111.0 * Math.cos((latitude * Math.PI) / 180));

    const bounds: GeoBoundingBox = {
      north: Number((latitude + latDelta).toFixed(4)),
      south: Number((latitude - latDelta).toFixed(4)),
      east: Number((longitude + lonDelta).toFixed(4)),
      west: Number((longitude - lonDelta).toFixed(4)),
    };

    const candidateCells = gridGenerator.generateGridsForBoundingBox(bounds, {
      resolution,
      maxCells: 500,
    });

    const origin = { latitude, longitude };
    const matchingCells: WeatherGridCell[] = [];

    for (const cell of candidateCells) {
      const dist = gridEngine.calculateDistanceKm(origin, cell.center);
      if (dist <= radiusKm) {
        matchingCells.push(cell);
      }
    }

    // Sort by distance from center
    matchingCells.sort((a, b) => {
      const distA = gridEngine.calculateDistanceKm(origin, a.center);
      const distB = gridEngine.calculateDistanceKm(origin, b.center);
      return distA - distB;
    });

    return matchingCells;
  }

  findGridsInBoundingBox(query: GridBoundingBoxQuery): WeatherGridCell[] {
    return gridGenerator.generateGridsForBoundingBox(
      {
        north: query.north,
        south: query.south,
        east: query.east,
        west: query.west,
      },
      {
        resolution: query.resolution ?? 0.01,
        maxCells: query.limit ?? 500,
      }
    );
  }
}

export const spatialQueries = new SpatialQueries();
