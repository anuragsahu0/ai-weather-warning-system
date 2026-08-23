import { GeoBoundingBox, WeatherGridCell } from '@shared/types/index.js';
import { gridEngine } from './gridEngine.js';
import { regionService } from './regionService.js';
import { ApiError } from '../../utils/apiError.js';

export interface GridGeneratorOptions {
  resolution?: number;
  maxCells?: number;
  regionId?: string | null;
}

export class GridGenerator {
  generateGridsForBoundingBox(
    bounds: GeoBoundingBox,
    options: GridGeneratorOptions = {}
  ): WeatherGridCell[] {
    const resolution = options.resolution ?? 0.01;
    const maxCells = options.maxCells ?? 500;

    gridEngine.validateCoordinates(bounds.north, bounds.east);
    gridEngine.validateCoordinates(bounds.south, bounds.west);

    if (bounds.south >= bounds.north) {
      throw ApiError.badRequest('South latitude must be strictly less than north latitude');
    }
    if (bounds.west >= bounds.east) {
      throw ApiError.badRequest('West longitude must be strictly less than east longitude');
    }

    const latSpan = bounds.north - bounds.south;
    const lonSpan = bounds.east - bounds.west;

    const estimatedRows = Math.ceil(latSpan / resolution);
    const estimatedCols = Math.ceil(lonSpan / resolution);
    const totalEstimatedCells = estimatedRows * estimatedCols;

    if (totalEstimatedCells > maxCells) {
      throw ApiError.badRequest(
        `Requested bounding box generates ${totalEstimatedCells} grid cells at ${resolution}° resolution, which exceeds the safe limit of ${maxCells}. Please zoom in or increase resolution.`
      );
    }

    const cells: WeatherGridCell[] = [];
    const seenCodes = new Set<string>();

    for (let lat = bounds.south + resolution / 2; lat < bounds.north; lat += resolution) {
      for (let lon = bounds.west + resolution / 2; lon < bounds.east; lon += resolution) {
        const cell = gridEngine.getGridCell(lat, lon, resolution, options.regionId);
        if (!seenCodes.has(cell.gridCode)) {
          seenCodes.add(cell.gridCode);

          // Enrich with region name if in a known region
          const region = regionService.findRegionByCoordinates(cell.center.latitude, cell.center.longitude);
          if (region) {
            cell.regionId = region.id;
            cell.regionName = region.name;
          }

          cells.push(cell);
        }
      }
    }

    return cells;
  }
}

export const gridGenerator = new GridGenerator();
