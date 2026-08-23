import { weatherDataValidator } from '../services/weather/validation.js';
import { RawProviderWeatherData } from '../services/weather/types.js';

export function runValidationTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const createFixture = (overrides: Partial<RawProviderWeatherData> = {}): RawProviderWeatherData => ({
    provider: 'test-provider',
    latitude: 28.6139,
    longitude: 77.209,
    observedAt: new Date().toISOString(),
    temperature: 31.5,
    feelsLike: 34.0,
    humidity: 65,
    pressure: 1008.5,
    windSpeed: 14.5,
    windDirection: 180,
    windGust: 22.0,
    rainfall: 0.0,
    precipitationRate: 0.0,
    visibility: 8.5,
    cloudCover: 40,
    weatherCode: 1,
    weatherCondition: 'Mainly Clear',
    rawPayload: { fixture: true },
    attribution: {
      providerName: 'Test Provider Fixture',
      sourceUrl: 'https://test.weather',
      license: 'Test License',
    },
    ...overrides,
  });

  // Test 1: Valid observation passes validation
  try {
    const valid = createFixture();
    const res = weatherDataValidator.validate(valid);
    results.push({
      name: 'Validation: Valid observation payload passes validation',
      passed: res.isValid && res.errors.length === 0,
      error: res.errors.join(', '),
    });
  } catch (err: unknown) {
    results.push({
      name: 'Validation: Valid observation payload passes validation',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Impossible temperature (-90°C or +70°C) is rejected
  try {
    const impossibleTemp = createFixture({ temperature: 75 });
    const res = weatherDataValidator.validate(impossibleTemp);
    results.push({
      name: 'Validation: Physical bounds rejects temperature > 65°C',
      passed: !res.isValid && res.errors.some((e) => e.includes('temperature')),
    });
  } catch (err: unknown) {
    results.push({
      name: 'Validation: Physical bounds rejects temperature > 65°C',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Negative humidity is rejected
  try {
    const negativeHumidity = createFixture({ humidity: -5 });
    const res = weatherDataValidator.validate(negativeHumidity);
    results.push({
      name: 'Validation: Physical bounds rejects negative humidity',
      passed: !res.isValid && res.errors.some((e) => e.includes('humidity')),
    });
  } catch (err: unknown) {
    results.push({
      name: 'Validation: Physical bounds rejects negative humidity',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 4: Invalid coordinates (latitude > 90) is rejected
  try {
    const invalidLat = createFixture({ latitude: 120 });
    const res = weatherDataValidator.validate(invalidLat);
    results.push({
      name: 'Validation: Rejects latitude > 90',
      passed: !res.isValid && res.errors.some((e) => e.includes('latitude')),
    });
  } catch (err: unknown) {
    results.push({
      name: 'Validation: Rejects latitude > 90',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 5: Future timestamp (>1h) is rejected
  try {
    const futureTime = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
    const futureObs = createFixture({ observedAt: futureTime });
    const res = weatherDataValidator.validate(futureObs);
    results.push({
      name: 'Validation: Rejects future timestamp with clock skew',
      passed: !res.isValid && res.errors.some((e) => e.includes('future')),
    });
  } catch (err: unknown) {
    results.push({
      name: 'Validation: Rejects future timestamp with clock skew',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
