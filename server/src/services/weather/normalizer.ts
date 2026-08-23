import { RawProviderWeatherData, NormalizedWeatherData } from './types.js';
import { qualityEngine } from './qualityEngine.js';

export class WeatherDataNormalizer {
  normalize(raw: RawProviderWeatherData, locationId?: string): NormalizedWeatherData {
    const receivedAt = new Date().toISOString();
    const observedAtUtc = new Date(raw.observedAt).toISOString();

    const freshnessSeconds = qualityEngine.calculateFreshnessSeconds(observedAtUtc);
    const dataFreshness = qualityEngine.evaluateFreshness(freshnessSeconds);

    const partialObservation: Omit<NormalizedWeatherData, 'id' | 'qualityStatus'> = {
      provider: raw.provider,
      locationId,
      latitude: Number(raw.latitude.toFixed(4)),
      longitude: Number(raw.longitude.toFixed(4)),
      observedAt: observedAtUtc,
      receivedAt,
      freshnessSeconds,
      dataFreshness,
      temperature: raw.temperature != null ? Number(raw.temperature.toFixed(1)) : null,
      feelsLike: raw.feelsLike != null ? Number(raw.feelsLike.toFixed(1)) : null,
      humidity: raw.humidity != null ? Math.round(raw.humidity) : null,
      pressure: raw.pressure != null ? Number(raw.pressure.toFixed(1)) : null,
      windSpeed: raw.windSpeed != null ? Number(raw.windSpeed.toFixed(1)) : null,
      windDirection: raw.windDirection != null ? Math.round(raw.windDirection) : null,
      windGust: raw.windGust != null ? Number(raw.windGust.toFixed(1)) : null,
      rainfall: raw.rainfall != null ? Number(raw.rainfall.toFixed(2)) : null,
      precipitationRate: raw.precipitationRate != null ? Number(raw.precipitationRate.toFixed(2)) : null,
      visibility: raw.visibility != null ? Number(raw.visibility.toFixed(1)) : null,
      cloudCover: raw.cloudCover != null ? Math.round(raw.cloudCover) : null,
      weatherCondition: raw.weatherCondition ?? null,
      weatherCode: raw.weatherCode ?? null,
      attribution: raw.attribution,
    };

    const qualityStatus = qualityEngine.evaluateQuality(partialObservation);
    const observationId = `obs-${raw.provider}-${partialObservation.latitude}_${partialObservation.longitude}-${new Date(observedAtUtc).getTime()}`;

    return {
      ...partialObservation,
      id: observationId,
      qualityStatus,
    };
  }
}

export const weatherDataNormalizer = new WeatherDataNormalizer();
