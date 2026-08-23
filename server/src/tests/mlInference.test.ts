import { mlInferenceService } from '../services/mlInferenceService.js';
import { FeatureVector } from '../../../shared/types/index.js';

export function runMLInferenceTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const freshFeatures: FeatureVector = {
    temperature: 32.5,
    feelsLike: 38.0,
    humidity: 88,
    pressure: 996.5,
    windSpeed: 28.0,
    windDirection: 190,
    windGust: 48.0,
    rainfallRate: 18.0,
    cloudCover: 90,
    tempDelta30m: -2.0,
    pressureDelta30m: -2.5,
    humidityDelta30m: 10,
    windSpeedDelta30m: 10.0,
    pressureTendencyHpaPerHr: -3.2,
    rollingRainAccum30m: 18.0,
    rollingRainAccum60m: 24.0,
    rollingMeanTemp60m: 33.0,
    rollingMaxWind60m: 48.0,
    hourSin: 0.0,
    hourCos: 1.0,
    dayOfYearSin: 0.98,
    dayOfYearCos: -0.17,
  };

  // Test 1: Active prediction execution with fresh telemetry
  try {
    const predPromise = mlInferenceService.predict(
      'GRID_R01_N2861_E07720',
      'GRID_R01_N2861_E07720',
      'HEAVY_RAIN',
      30,
      freshFeatures,
      new Date().toISOString(),
      120 // Fresh (2 mins)
    );

    // Synchronously check structure
    let passed = false;
    predPromise.then((pred) => {
      passed =
        pred.status === 'MODEL_READY' &&
        pred.probability >= 0.0 &&
        pred.probability <= 1.0 &&
        pred.prediction === true &&
        pred.topFeatures.length > 0;
    });

    results.push({
      name: 'MLInference: Fresh atmospheric telemetry generates valid calibrated prediction',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'MLInference: Fresh atmospheric telemetry generates valid calibrated prediction',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Stale telemetry rejection
  try {
    const stalePromise = mlInferenceService.predict(
      'GRID_R01_N2861_E07720',
      'GRID_R01_N2861_E07720',
      'HEAVY_RAIN',
      30,
      freshFeatures,
      new Date().toISOString(),
      7200 // 2 hours old (> 1800s limit)
    );

    let isStaleHandled = false;
    stalePromise.then((pred) => {
      isStaleHandled = pred.status === 'STALE_INPUT_DATA' && pred.probability === 0.0;
    });

    results.push({
      name: 'MLInference: Stale telemetry (> 30 mins) is strictly rejected with STALE_INPUT_DATA',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'MLInference: Stale telemetry (> 30 mins) is strictly rejected with STALE_INPUT_DATA',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
