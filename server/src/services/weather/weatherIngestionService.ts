import { WeatherProvider } from './providers/base.js';
import { OpenMeteoProvider } from './providers/openMeteo.js';
import { OpenWeatherProvider } from './providers/openWeather.js';
import { weatherDataValidator } from './validation.js';
import { weatherDataNormalizer } from './normalizer.js';
import { deduplicationService } from './deduplication.js';
import { weatherCache } from './cache.js';
import { NormalizedWeatherData, IngestionResult, WeatherProviderStatus } from './types.js';
import { WeatherIngestionStatusResponse } from '@shared/types/index.js';
import { gridEngine } from '../geospatial/gridEngine.js';
import { gridWeatherAggregator } from '../geospatial/gridAggregator.js';
import { prisma } from '../../config/db.js';
import { config } from '../../config/index.js';
import { ApiError } from '../../utils/apiError.js';

export class WeatherIngestionService {
  private activeProvider: WeatherProvider;
  private lastSuccessfulFetch: string | null = null;
  private lastAttempt: string | null = null;
  private lastError: string | null = null;
  private recordsProcessed = 0;

  constructor() {
    this.activeProvider = this.resolveProvider(config.WEATHER_PROVIDER);
  }

  private resolveProvider(providerName: string): WeatherProvider {
    switch (providerName) {
      case 'openweathermap':
        return new OpenWeatherProvider();
      case 'open-meteo':
      default:
        return new OpenMeteoProvider();
    }
  }

  setProvider(providerName: 'open-meteo' | 'openweathermap'): void {
    this.activeProvider = this.resolveProvider(providerName);
    console.log(`[WeatherIngestionService] Switched active weather provider to: ${this.activeProvider.name}`);
  }

  getProvider(): WeatherProvider {
    return this.activeProvider;
  }

  async ingestCoordinates(
    latitude: number,
    longitude: number,
    locationId?: string,
    force = false
  ): Promise<IngestionResult> {
    this.lastAttempt = new Date().toISOString();

    // 1. Check Cache
    if (!force) {
      const cached = weatherCache.get(latitude, longitude);
      if (cached) {
        return {
          success: true,
          observation: cached,
          isDuplicate: true,
          qualityStatus: cached.qualityStatus,
        };
      }
    }

    try {
      // 2. Fetch Raw Weather Data from Provider
      const rawData = await this.activeProvider.getCurrentWeather(latitude, longitude);

      // 3. Response Validation (Physical bounds & schema)
      const validation = weatherDataValidator.validate(rawData);
      if (!validation.isValid) {
        const errorMsg = `Data validation failed: ${validation.errors.join('; ')}`;
        this.lastError = errorMsg;
        console.error(`[WeatherIngestionService] ${errorMsg}`);
        throw ApiError.badRequest(errorMsg);
      }

      // 4. Data Normalization
      const normalized = weatherDataNormalizer.normalize(rawData, locationId);

      // 5. Hyper-Local Grid Resolution (Phase 3)
      const gridCell = gridEngine.getGridCell(normalized.latitude, normalized.longitude, 0.01);
      normalized.gridId = gridCell.gridCode;

      // 6. Deduplication Check
      const isDuplicate = deduplicationService.isDuplicate(normalized);

      // 7. Derive Grid Weather State (Phase 3)
      const gridWeatherState = gridWeatherAggregator.deriveGridWeatherState(gridCell, [normalized]);

      // 8. Database Storage (Safe with DB fallback)
      await this.persistObservationAndGridToDb(normalized, gridCell, gridWeatherState);

      // 9. Record in Deduplication Filter & In-Memory Cache
      deduplicationService.recordObservation(normalized);
      weatherCache.set(latitude, longitude, normalized);

      this.recordsProcessed++;
      this.lastSuccessfulFetch = new Date().toISOString();
      this.lastError = null;

      return {
        success: true,
        observation: normalized,
        isDuplicate,
        qualityStatus: normalized.qualityStatus,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown ingestion error';
      this.lastError = errorMsg;
      throw err;
    }
  }

  private async persistObservationAndGridToDb(
    data: NormalizedWeatherData,
    gridCell: ReturnType<typeof gridEngine.getGridCell>,
    gridState: ReturnType<typeof gridWeatherAggregator.deriveGridWeatherState>
  ): Promise<void> {
    try {
      // Ensure grid record exists
      await prisma.weatherGrid.upsert({
        where: { gridCode: gridCell.gridCode },
        update: {},
        create: {
          id: gridCell.id,
          gridCode: gridCell.gridCode,
          resolutionDegrees: gridCell.resolutionDegrees,
          resolutionKm: gridCell.resolutionKm,
          northLat: gridCell.bounds.north,
          southLat: gridCell.bounds.south,
          eastLng: gridCell.bounds.east,
          westLng: gridCell.bounds.west,
          centerLat: gridCell.center.latitude,
          centerLng: gridCell.center.longitude,
          regionId: gridCell.regionId,
          boundaryPolygonJson: gridCell.polygonGeoJson as object,
        },
      });

      // Insert raw observation
      await prisma.weatherObservation.create({
        data: {
          id: data.id,
          provider: data.provider,
          locationId: data.locationId ?? null,
          gridId: gridCell.id,
          latitude: data.latitude,
          longitude: data.longitude,
          observedAt: new Date(data.observedAt),
          receivedAt: new Date(data.receivedAt),
          qualityStatus: data.qualityStatus,
          temperature: data.temperature,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
          pressure: data.pressure,
          windSpeed: data.windSpeed,
          windDirection: data.windDirection,
          windGust: data.windGust,
          rainfall: data.rainfall,
          precipitationRate: data.precipitationRate,
          visibility: data.visibility,
          cloudCover: data.cloudCover,
          weatherCondition: data.weatherCondition,
          weatherCode: data.weatherCode,
          sourceStation: `${data.provider}-station`,
        },
      });

      // Insert derived grid weather state
      if (gridState) {
        await prisma.gridWeatherState.create({
          data: {
            id: gridState.id,
            gridId: gridCell.id,
            timestamp: new Date(gridState.timestamp),
            temperature: gridState.temperature,
            feelsLike: gridState.feelsLike,
            humidity: gridState.humidity,
            pressure: gridState.pressure,
            windSpeed: gridState.windSpeed,
            windDirection: gridState.windDirection,
            windGust: gridState.windGust,
            rainfall: gridState.rainfall,
            precipitationRate: gridState.precipitationRate,
            visibility: gridState.visibility,
            cloudCover: gridState.cloudCover,
            weatherCondition: gridState.weatherCondition,
            weatherCode: gridState.weatherCode,
            dataQuality: gridState.dataQuality,
            dataFreshness: gridState.dataFreshness,
            freshnessSeconds: gridState.freshnessSeconds,
            sourceCount: gridState.sourceCount,
            rawObservationIdsJson: gridState.rawObservationIds,
            aggregationMethod: gridState.aggregationMethod,
          },
        });
      }
    } catch {
      // Database in standby or conflict - log quietly
    }
  }

  async getStatus(): Promise<WeatherIngestionStatusResponse> {
    let providerHealth: WeatherProviderStatus;
    try {
      providerHealth = await this.activeProvider.getStatus();
    } catch {
      providerHealth = {
        name: this.activeProvider.name,
        isOperational: false,
        latencyMs: 0,
        lastSuccessfulQuery: null,
        lastError: 'Provider unreachable',
        attribution: this.activeProvider.getAttribution(),
      };
    }

    return {
      provider: this.activeProvider.name,
      activeProvider: this.activeProvider.name,
      status: providerHealth.isOperational ? 'OPERATIONAL' : 'DEGRADED',
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      lastAttempt: this.lastAttempt,
      lastError: this.lastError,
      recordsProcessed: this.recordsProcessed,
      cachedEntries: weatherCache.size(),
      refreshIntervalSeconds: config.WEATHER_REFRESH_INTERVAL_SECONDS,
      attribution: this.activeProvider.getAttribution(),
    };
  }
}

export const weatherIngestionService = new WeatherIngestionService();
