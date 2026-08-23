import { RawHistoricalTimeSeries } from './types.js';
import { weatherHttpClient } from '../weather/httpClient.js';
import { ApiError } from '../../utils/apiError.js';

export class OpenMeteoHistoricalProvider {
  public readonly name = 'open-meteo-archive';
  private baseUrl = 'https://archive-api.open-meteo.com/v1/archive';

  async fetchHistoricalRange(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): Promise<RawHistoricalTimeSeries> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: startDate,
      end_date: endDate,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'cloud_cover',
        'weather_code',
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'UTC',
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    const data = await weatherHttpClient.get<RawHistoricalTimeSeries>(url, { timeoutMs: 15000 });

    if (!data || !data.hourly || !Array.isArray(data.hourly.time)) {
      throw ApiError.serviceUnavailable('Malformed historical response structure received from archive provider');
    }

    return data;
  }
}

export const historicalProvider = new OpenMeteoHistoricalProvider();
