import { gridWeatherAggregator } from '../services/geospatial/gridAggregator.js';
import { gridEngine } from '../services/geospatial/gridEngine.js';
import { NormalizedWeatherData } from '../services/weather/types.js';

export function runGridAggregatorTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const cell = gridEngine.getGridCell(28.6139, 77.209, 0.01);

  const createObs = (overrides: Partial<NormalizedWeatherData> = {}): NormalizedWeatherData => ({
    id: 'obs-1',
    provider: 'open-meteo',
    latitude: 28.614,
    longitude: 77.208,
    observedAt: '2026-08-22T17:00:00.000Z',
    receivedAt: '2026-08-22T17:00:05.000Z',
    freshnessSeconds: 10,
    dataFreshness: 'FRESH',
    qualityStatus: 'VALID',
    temperature: 30.0,
    feelsLike: 34.0,
    humidity: 70,
    pressure: 1008.0,
    windSpeed: 15.0,
    windDirection: 180,
    windGust: 22.0,
    rainfall: 2.5,
    precipitationRate: 5.0,
    visibility: 10.0,
    cloudCover: 50,
    weatherCondition: 'Moderate Rain',
    weatherCode: 63,
    attribution: { providerName: 'Open-Meteo', sourceUrl: '', license: '' },
    ...overrides,
  });

  // Test 1: Single Observation Mapping
  try {
    const obs = createObs();
    const state = gridWeatherAggregator.deriveGridWeatherState(cell, [obs]);

    const isSingleValid =
      state !== null &&
      state.aggregationMethod === 'SINGLE_STATION' &&
      state.temperature === 30.0 &&
      state.sourceCount === 1;

    results.push({
      name: 'GridAggregator: Single observation maps to GridWeatherState',
      passed: isSingleValid,
      error: JSON.stringify(state),
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridAggregator: Single observation maps to GridWeatherState',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Multiple Observations Inverse Distance Weighted Average
  try {
    const obs1 = createObs({ id: 'obs-1', latitude: 28.615, longitude: 77.205, temperature: 28.0 }); // Center of cell
    const obs2 = createObs({ id: 'obs-2', latitude: 28.619, longitude: 77.209, temperature: 32.0 }); // Farther edge

    const state = gridWeatherAggregator.deriveGridWeatherState(cell, [obs1, obs2]);

    // Since obs1 is at the exact center (distance ~0), its weight is heavily dominant
    const isWeightedValid =
      state !== null &&
      state.aggregationMethod === 'DISTANCE_WEIGHTED_AVERAGE' &&
      state.sourceCount === 2 &&
      state.temperature !== null &&
      state.temperature < 30.0; // Biased towards obs1 (28°C)

    results.push({
      name: 'GridAggregator: Multiple observations use IDW spatial averaging',
      passed: isWeightedValid,
      error: `Calculated weighted temperature: ${state?.temperature}°C`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridAggregator: Multiple observations use IDW spatial averaging',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Raw Observation Immutability
  try {
    const rawObs = createObs({ temperature: 31.2 });
    const originalTemp = rawObs.temperature;

    gridWeatherAggregator.deriveGridWeatherState(cell, [rawObs]);

    const isImmutable = rawObs.temperature === originalTemp;

    results.push({
      name: 'GridAggregator: Preserves raw observation immutability',
      passed: isImmutable,
    });
  } catch (err: unknown) {
    results.push({
      name: 'GridAggregator: Preserves raw observation immutability',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
