import { WeatherProvider } from './base.js';
import { RawProviderWeatherData, WeatherProviderStatus, WeatherAttribution } from '../types.js';
import { weatherHttpClient } from '../httpClient.js';
import { ApiError } from '../../../utils/apiError.js';
import { config } from '../../../config/index.js';

interface OpenWeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility?: number; // In meters
  wind?: {
    speed: number; // m/s by default in metric
    deg: number;
    gust?: number; // m/s
  };
  clouds?: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  dt: number; // Epoch seconds
}

export class OpenWeatherProvider implements WeatherProvider {
  public readonly name = 'openweathermap';
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  getAttribution(): WeatherAttribution {
    return {
      providerName: 'OpenWeatherMap API',
      sourceUrl: 'https://openweathermap.org/',
      license: 'OpenWeatherMap Proprietary & Meteorological Feeds',
    };
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<RawProviderWeatherData> {
    if (!config.WEATHER_API_KEY) {
      throw ApiError.badRequest(
        'OpenWeatherMap provider requires WEATHER_API_KEY environment variable. Switch to open-meteo or supply key.'
      );
    }

    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      appid: config.WEATHER_API_KEY,
      units: 'metric',
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    const data = await weatherHttpClient.get<OpenWeatherResponse>(url);

    if (!data || !data.main) {
      throw ApiError.serviceUnavailable('Malformed response structure received from OpenWeatherMap');
    }

    // Convert wind speed & gust from m/s to km/h (multiply by 3.6)
    const windSpeedKmh = data.wind?.speed != null ? data.wind.speed * 3.6 : null;
    const windGustKmh = data.wind?.gust != null ? data.wind.gust * 3.6 : null;
    const visibilityKm = data.visibility != null ? data.visibility / 1000 : null;
    const rain1h = data.rain?.['1h'] ?? null;

    const weatherCondition = data.weather && data.weather[0] ? data.weather[0].description : 'Atmospheric Observation';
    const weatherCode = data.weather && data.weather[0] ? data.weather[0].id : null;

    return {
      provider: this.name,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      observedAt: new Date(data.dt * 1000).toISOString(),
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: windSpeedKmh,
      windDirection: data.wind?.deg ?? null,
      windGust: windGustKmh,
      rainfall: rain1h,
      precipitationRate: rain1h,
      visibility: visibilityKm,
      cloudCover: data.clouds?.all ?? null,
      weatherCode,
      weatherCondition,
      rawPayload: data as unknown as Record<string, unknown>,
      attribution: this.getAttribution(),
    };
  }

  async getStatus(): Promise<WeatherProviderStatus> {
    if (!config.WEATHER_API_KEY) {
      return {
        name: this.name,
        isOperational: false,
        latencyMs: 0,
        lastSuccessfulQuery: null,
        lastError: 'WEATHER_API_KEY missing in environment configuration',
        attribution: this.getAttribution(),
      };
    }

    const startTime = Date.now();
    try {
      await this.getCurrentWeather(28.6139, 77.209);
      return {
        name: this.name,
        isOperational: true,
        latencyMs: Date.now() - startTime,
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
}
