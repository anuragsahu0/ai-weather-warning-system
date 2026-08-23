import { targetGenerator } from '../services/historical/targetGenerator.js';
import { NormalizedHistoricalObservation } from '../services/historical/types.js';

export function runTargetGeneratorTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const sampleObs: NormalizedHistoricalObservation[] = [
    {
      id: 'obs-0',
      latitude: 28.6139,
      longitude: 77.209,
      gridId: 'grid-1',
      gridCode: 'GRID_R01_N2861_E07720',
      observedAt: '2024-07-01T00:00:00.000Z',
      temperature: 30.0,
      feelsLike: 34.0,
      humidity: 70,
      pressure: 1008.0,
      windSpeed: 10.0,
      windDirection: 180,
      windGust: 15.0,
      rainfall: 0.0,
      precipitationRate: 0.0,
      cloudCover: 20,
      weatherCondition: 'Clear',
      weatherCode: 1,
      qualityFlag: 'VALID',
      imputationFlag: 'OBSERVED',
    },
    {
      id: 'obs-1',
      latitude: 28.6139,
      longitude: 77.209,
      gridId: 'grid-1',
      gridCode: 'GRID_R01_N2861_E07720',
      observedAt: '2024-07-01T00:30:00.000Z',
      temperature: 28.5,
      feelsLike: 32.0,
      humidity: 80,
      pressure: 1006.0,
      windSpeed: 20.0,
      windDirection: 190,
      windGust: 35.0,
      rainfall: 18.0, // Heavy rain threshold (>=15mm)
      precipitationRate: 36.0,
      cloudCover: 70,
      weatherCondition: 'Heavy Rain',
      weatherCode: 65,
      qualityFlag: 'VALID',
      imputationFlag: 'OBSERVED',
    },
    {
      id: 'obs-2',
      latitude: 28.6139,
      longitude: 77.209,
      gridId: 'grid-1',
      gridCode: 'GRID_R01_N2861_E07720',
      observedAt: '2024-07-01T01:00:00.000Z',
      temperature: 24.0,
      feelsLike: 27.0,
      humidity: 98,
      pressure: 998.0,
      windSpeed: 52.0, // Gale wind (>=50km/h)
      windDirection: 210,
      windGust: 75.0,
      rainfall: 55.0, // Cloudburst potential (>=50mm/h)
      precipitationRate: 110.0,
      cloudCover: 100,
      weatherCondition: 'Cloudburst Episode',
      weatherCode: 99,
      qualityFlag: 'VALID',
      imputationFlag: 'OBSERVED',
    },
  ];

  // Test 1: Target extraction at index 0 looks forward to index 1 & 2
  try {
    const targets = targetGenerator.generateTargets(sampleObs, 0);
    const hasCorrectRain30m = targets.targetRain30m === 18.0;
    const hasCorrectRain60m = targets.targetRain60m === 55.0;
    const hasCloudburstLabel = targets.targetConvectiveEvent === 'CLOUDBURST_POTENTIAL';

    results.push({
      name: 'TargetGenerator: Correctly maps future horizons and WMO cloudburst threshold',
      passed: hasCorrectRain30m && hasCorrectRain60m && hasCloudburstLabel,
      error: JSON.stringify(targets),
    });
  } catch (err: unknown) {
    results.push({
      name: 'TargetGenerator: Correctly maps future horizons and WMO cloudburst threshold',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
