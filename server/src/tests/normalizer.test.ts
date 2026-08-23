import { weatherDataNormalizer } from '../services/weather/normalizer.js';
import { RawProviderWeatherData } from '../services/weather/types.js';

export function runNormalizerTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const sampleRaw: RawProviderWeatherData = {
    provider: 'open-meteo',
    latitude: 28.613928,
    longitude: 77.209012,
    observedAt: '2026-08-22T17:00:00Z',
    temperature: 31.432,
    feelsLike: 35.811,
    humidity: 62.4,
    pressure: 1009.28,
    windSpeed: 12.38,
    windDirection: 140.2,
    windGust: 18.72,
    rainfall: 0.0,
    precipitationRate: 0.0,
    visibility: 9.2,
    cloudCover: 25.1,
    weatherCode: 2,
    weatherCondition: 'Partly Cloudy',
    rawPayload: { test: true },
    attribution: {
      providerName: 'Open-Meteo Weather API',
      sourceUrl: 'https://open-meteo.com/',
      license: 'CC BY 4.0',
    },
  };

  // Test 1: Coordinates and metrics rounded to standard precision
  try {
    const normalized = weatherDataNormalizer.normalize(sampleRaw, 'loc-delhi-ncr');
    const isRoundedCorrectly =
      normalized.latitude === 28.6139 &&
      normalized.longitude === 77.209 &&
      normalized.temperature === 31.4 &&
      normalized.humidity === 62 &&
      normalized.pressure === 1009.3 &&
      normalized.windSpeed === 12.4;

    results.push({
      name: 'Normalizer: Rounds coordinates and metrics to standard precision',
      passed: isRoundedCorrectly,
      error: isRoundedCorrectly ? undefined : `Received: ${JSON.stringify(normalized)}`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Normalizer: Rounds coordinates and metrics to standard precision',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Formats observedAt to standard UTC ISO string
  try {
    const normalized = weatherDataNormalizer.normalize(sampleRaw);
    const isIsoUtc = normalized.observedAt.endsWith('Z') && !isNaN(new Date(normalized.observedAt).getTime());

    results.push({
      name: 'Normalizer: Guarantees UTC ISO string timestamp',
      passed: isIsoUtc,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Normalizer: Guarantees UTC ISO string timestamp',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Assigns deterministic observation ID
  try {
    const normalized = weatherDataNormalizer.normalize(sampleRaw);
    const hasValidId = normalized.id.startsWith('obs-open-meteo-28.6139_77.209-');

    results.push({
      name: 'Normalizer: Generates unique deterministic observation ID',
      passed: hasValidId,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Normalizer: Generates unique deterministic observation ID',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
