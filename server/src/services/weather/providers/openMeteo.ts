import { WeatherProvider } from './base.js';
import { RawProviderWeatherData, WeatherProviderStatus, WeatherAttribution } from '../types.js';
import { weatherHttpClient } from '../httpClient.js';
import { ApiError } from '../../../utils/apiError.js';

interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    surface_pressure?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
    cloud_cover?: number;
    visibility?: number; // In meters from Open-Meteo
  };
}

export class OpenMeteoProvider implements WeatherProvider {
  public readonly name = 'open-meteo';
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  getAttribution(): WeatherAttribution {
    return {
      providerName: 'Open-Meteo Weather API',
      sourceUrl: 'https://open-meteo.com/',
      license: 'WMO & National Weather Services Open Meteorological Data (CC BY 4.0)',
    };
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<RawProviderWeatherData> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'cloud_cover',
        'visibility',
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'UTC',
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    const data = await weatherHttpClient.get<OpenMeteoCurrentResponse>(url);

    if (!data || !data.current) {
      throw ApiError.serviceUnavailable('Malformed response structure received from Open-Meteo');
    }

    const current = data.current;
    const weatherCode = current.weather_code ?? null;
    const weatherCondition = this.mapWmoCodeToCondition(weatherCode);

    // Convert visibility from meters to kilometers if provided
    const visibilityKm = current.visibility != null ? current.visibility / 1000 : null;

    return {
      provider: this.name,
      latitude: data.latitude,
      longitude: data.longitude,
      observedAt: current.time ? new Date(current.time + 'Z').toISOString() : new Date().toISOString(),
      temperature: current.temperature_2m ?? null,
      feelsLike: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      pressure: current.surface_pressure ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windDirection: current.wind_direction_10m ?? null,
      windGust: current.wind_gusts_10m ?? null,
      rainfall: current.rain ?? current.precipitation ?? null,
      precipitationRate: current.precipitation ?? null,
      visibility: visibilityKm,
      cloudCover: current.cloud_cover ?? null,
      weatherCode,
      weatherCondition,
      rawPayload: data as unknown as Record<string, unknown>,
      attribution: this.getAttribution(),
    };
  }

  async getStatus(): Promise<WeatherProviderStatus> {
    const startTime = Date.now();
    try {
      // Test ping with New Delhi coordinates
      await this.getCurrentWeather(28.6139, 77.209);
      const latency = Date.now() - startTime;
      return {
        name: this.name,
        isOperational: true,
        latencyMs: latency,
        lastSuccessfulQuery: new Date().toISOString(),
        lastError: null,
        attribution: this.getAttribution(),
      };
    } catch (err: unknown) {
      return {
        name: this.name,
        isOperational: false,
        latencyMs: Date.now() - startTime,
        lastSuccessfulQuery: null,
        lastError: err instanceof Error ? err.message : 'Provider query failed',
        attribution: this.getAttribution(),
      };
    }
  }

  /**
   * Standard WMO Code 4677 weather interpretation
   */
  private mapWmoCodeToCondition(code: number | null): string {
    if (code === null) return 'Atmospheric Observation';
    switch (code) {
      case 0:
        return 'Clear Sky';
      case 1:
        return 'Mainly Clear';
      case 2:
        return 'Partly Cloudy';
      case 3:
        return 'Overcast';
      case 45:
        return 'Fog';
      case 48:
        return 'Depositing Rime Fog';
      case 51:
        return 'Light Drizzle';
      case 53:
        return 'Moderate Drizzle';
      case 55:
        return 'Dense Drizzle';
      case 61:
        return 'Slight Rain';
      case 63:
        return 'Moderate Rain';
      case 65:
        return 'Heavy Rain / Cloudburst Potential';
      case 71:
        return 'Slight Snow';
      case 73:
        return 'Moderate Snow';
      case 75:
        return 'Heavy Snow Fall';
      case 80:
        return 'Slight Rain Showers';
      case 81:
        return 'Moderate Rain Showers';
      case 82:
        return 'Violent Rain Showers';
      case 95:
        return 'Thunderstorm with Convective Surge';
      case 96:
        return 'Thunderstorm with Slight Hail';
      case 99:
        return 'Severe Thunderstorm with Heavy Hail';
      default:
        return `WMO Weather Code ${code}`;
    }
  }
}
