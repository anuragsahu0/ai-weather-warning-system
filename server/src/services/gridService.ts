import { WeatherGridCell, GridSpatialQueryResponse, GridHistoryResponse, GridWeatherState, Region } from '@shared/types/index.js';
import { spatialQueries } from './geospatial/spatialQueries.js';
import { gridEngine } from './geospatial/gridEngine.js';
import { gridWeatherAggregator } from './geospatial/gridAggregator.js';
import { regionService } from './geospatial/regionService.js';
import { weatherService } from './weatherService.js';
import { weatherCache } from './weather/cache.js';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';

export class GridService {
  private gridWeatherStateMemory = new Map<string, GridWeatherState[]>();

  async getCurrentGrid(
    latitude: number,
    longitude: number,
    resolution = 0.01,
    includeWeather = true
  ): Promise<WeatherGridCell> {
    const cell = spatialQueries.findGridContaining(latitude, longitude, resolution);

    if (includeWeather) {
      try {
        const observation = await weatherService.getCurrentWeather(latitude, longitude);
        const derivedState = gridWeatherAggregator.deriveGridWeatherState(cell, [observation]);
        cell.currentWeather = derivedState;

        if (derivedState) {
          this.recordGridWeatherState(cell.gridCode, derivedState);
        }
      } catch (err: unknown) {
        console.warn(`[GridService] Could not attach weather observation to grid ${cell.gridCode}:`, (err as Error)?.message);
        cell.currentWeather = null;
      }
    }

    return cell;
  }

  async getNearbyGrids(
    latitude: number,
    longitude: number,
    radiusKm = 10,
    resolution = 0.01,
    includeWeather = true
  ): Promise<GridSpatialQueryResponse> {
    const cells = spatialQueries.findGridsInRadius({
      latitude,
      longitude,
      radiusKm,
      resolution,
      includeWeather,
    });

    if (includeWeather && cells.length > 0) {
      // Attach weather to center and nearby cells if cached
      for (const cell of cells) {
        const cached = weatherCache.get(cell.center.latitude, cell.center.longitude);
        if (cached) {
          cell.currentWeather = gridWeatherAggregator.deriveGridWeatherState(cell, [cached]);
        }
      }

      // If center cell has no weather, fetch live
      if (!cells[0].currentWeather) {
        try {
          const obs = await weatherService.getCurrentWeather(latitude, longitude);
          cells[0].currentWeather = gridWeatherAggregator.deriveGridWeatherState(cells[0], [obs]);
        } catch {
          // Keep null
        }
      }
    }

    const config = gridEngine.getResolutionConfig(resolution);

    return {
      totalCells: cells.length,
      resolutionDegrees: config.resolutionDegrees,
      resolutionKm: config.resolutionKm,
      cells,
      centerPoint: { latitude, longitude },
      radiusKm,
    };
  }

  async getBoundsGrids(
    north: number,
    south: number,
    east: number,
    west: number,
    resolution = 0.01,
    includeWeather = true,
    limit = 500
  ): Promise<GridSpatialQueryResponse> {
    const cells = spatialQueries.findGridsInBoundingBox({
      north,
      south,
      east,
      west,
      resolution,
      limit,
      includeWeather,
    });

    if (includeWeather) {
      for (const cell of cells) {
        const cached = weatherCache.get(cell.center.latitude, cell.center.longitude);
        if (cached) {
          cell.currentWeather = gridWeatherAggregator.deriveGridWeatherState(cell, [cached]);
        }
      }
    }

    const config = gridEngine.getResolutionConfig(resolution);

    return {
      totalCells: cells.length,
      resolutionDegrees: config.resolutionDegrees,
      resolutionKm: config.resolutionKm,
      cells,
      queryBoundingBox: { north, south, east, west },
    };
  }

  async getGridWeather(gridId: string): Promise<GridWeatherState> {
    // Check in-memory state history first
    const memoryStates = this.gridWeatherStateMemory.get(gridId);
    if (memoryStates && memoryStates.length > 0) {
      return memoryStates[memoryStates.length - 1];
    }

    // Check DB
    try {
      const dbState = await prisma.gridWeatherState.findFirst({
        where: { grid: { gridCode: gridId } },
        orderBy: { timestamp: 'desc' },
      });

      if (dbState) {
        return {
          id: dbState.id,
          gridId: dbState.gridId,
          gridCode: gridId,
          timestamp: dbState.timestamp.toISOString(),
          temperature: dbState.temperature,
          feelsLike: dbState.feelsLike,
          humidity: dbState.humidity,
          pressure: dbState.pressure,
          windSpeed: dbState.windSpeed,
          windDirection: dbState.windDirection,
          windGust: dbState.windGust,
          rainfall: dbState.rainfall,
          precipitationRate: dbState.precipitationRate,
          visibility: dbState.visibility,
          cloudCover: dbState.cloudCover,
          weatherCondition: dbState.weatherCondition,
          weatherCode: dbState.weatherCode,
          dataQuality: dbState.dataQuality as GridWeatherState['dataQuality'],
          dataFreshness: dbState.dataFreshness as GridWeatherState['dataFreshness'],
          freshnessSeconds: dbState.freshnessSeconds,
          sourceCount: dbState.sourceCount,
          rawObservationIds: (dbState.rawObservationIdsJson as string[]) || [],
          aggregationMethod: dbState.aggregationMethod as GridWeatherState['aggregationMethod'],
          createdAt: dbState.createdAt.toISOString(),
        };
      }
    } catch {
      // DB standby
    }

    throw ApiError.notFound(`No weather state found for grid cell ${gridId}`);
  }

  async getGridHistory(
    gridId: string,
    startIso?: string,
    endIso?: string,
    limit = 50
  ): Promise<GridHistoryResponse> {
    let states: GridWeatherState[] = [];

    // Query DB
    try {
      const whereClause: Record<string, unknown> = {
        grid: { gridCode: gridId },
      };
      if (startIso || endIso) {
        whereClause.timestamp = {};
        if (startIso) (whereClause.timestamp as Record<string, Date>).gte = new Date(startIso);
        if (endIso) (whereClause.timestamp as Record<string, Date>).lte = new Date(endIso);
      }

      const dbStates = await prisma.gridWeatherState.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      states = dbStates.map((s) => ({
        id: s.id,
        gridId: s.gridId,
        gridCode: gridId,
        timestamp: s.timestamp.toISOString(),
        temperature: s.temperature,
        feelsLike: s.feelsLike,
        humidity: s.humidity,
        pressure: s.pressure,
        windSpeed: s.windSpeed,
        windDirection: s.windDirection,
        windGust: s.windGust,
        rainfall: s.rainfall,
        precipitationRate: s.precipitationRate,
        visibility: s.visibility,
        cloudCover: s.cloudCover,
        weatherCondition: s.weatherCondition,
        weatherCode: s.weatherCode,
        dataQuality: s.dataQuality as GridWeatherState['dataQuality'],
        dataFreshness: s.dataFreshness as GridWeatherState['dataFreshness'],
        freshnessSeconds: s.freshnessSeconds,
        sourceCount: s.sourceCount,
        rawObservationIds: (s.rawObservationIdsJson as string[]) || [],
        aggregationMethod: s.aggregationMethod as GridWeatherState['aggregationMethod'],
        createdAt: s.createdAt.toISOString(),
      }));
    } catch {
      // Fallback to memory
      const mem = this.gridWeatherStateMemory.get(gridId) || [];
      states = mem.slice(-limit).reverse();
    }

    return {
      gridId,
      gridCode: gridId,
      resolutionDegrees: 0.01,
      totalRecords: states.length,
      states,
    };
  }

  async getAllRegions(): Promise<Region[]> {
    return await regionService.getAllRegions();
  }

  recordGridWeatherState(gridCode: string, state: GridWeatherState): void {
    const list = this.gridWeatherStateMemory.get(gridCode) || [];
    list.push(state);
    if (list.length > 100) list.shift();
    this.gridWeatherStateMemory.set(gridCode, list);
  }
}

export const gridService = new GridService();
