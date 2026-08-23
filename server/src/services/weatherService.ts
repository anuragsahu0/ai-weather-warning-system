import { weatherIngestionService } from './weather/weatherIngestionService.js';
import { NormalizedWeatherData } from './weather/types.js';
import { WeatherIngestionStatusResponse } from '@shared/types/index.js';
import { MONITORED_SECTORS } from './weather/scheduler.js';

export class WeatherService {
  async getCurrentWeather(latitude: number, longitude: number, locationId?: string): Promise<NormalizedWeatherData> {
    const result = await weatherIngestionService.ingestCoordinates(latitude, longitude, locationId);
    if (!result.observation) {
      throw new Error(result.error || 'Failed to retrieve weather observation');
    }
    return result.observation;
  }

  async getIngestionStatus(): Promise<WeatherIngestionStatusResponse> {
    return await weatherIngestionService.getStatus();
  }

  async manualIngest(
    latitude?: number,
    longitude?: number,
    locationId?: string,
    force = true
  ): Promise<{ message: string; observation?: NormalizedWeatherData }> {
    const targetLat = latitude ?? 28.6139;
    const targetLon = longitude ?? 77.209;

    const result = await weatherIngestionService.ingestCoordinates(targetLat, targetLon, locationId, force);
    return {
      message: 'Weather ingestion completed successfully',
      observation: result.observation,
    };
  }

  searchPresetLocations(query?: string) {
    if (!query) return MONITORED_SECTORS;
    const q = query.toLowerCase();
    return MONITORED_SECTORS.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }
}

export const weatherService = new WeatherService();
