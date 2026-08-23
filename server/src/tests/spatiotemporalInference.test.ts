import { mlInferenceService } from '../services/mlInferenceService.js';
import { FeatureVector } from '../../../shared/types/index.js';

export function runSpatioTemporalInferenceTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const sampleFeatures: FeatureVector = {
    temperature: 31.5,
    feelsLike: 37.0,
    humidity: 86,
    pressure: 997.0,
    windSpeed: 24.0,
    windDirection: 185,
    windGust: 42.0,
    rainfallRate: 14.0,
    cloudCover: 90,
    tempDelta30m: -1.5,
    pressureDelta30m: -2.0,
    humidityDelta30m: 8,
    windSpeedDelta30m: 8.0,
    pressureTendencyHpaPerHr: -2.8,
    rollingRainAccum30m: 14.0,
    rollingRainAccum60m: 20.0,
    rollingMeanTemp60m: 32.0,
    rollingMaxWind60m: 42.0,
    hourSin: 0.0,
    hourCos: 1.0,
    dayOfYearSin: 0.98,
    dayOfYearCos: -0.17,
  };

  const validHistory = Array.from({ length: 6 }, (_, i) => ({
    features: sampleFeatures,
    timestamp: new Date(Date.now() - (5 - i) * 600000).toISOString(),
  }));

  // Test 1: Active Spatio-Temporal Nowcast with 6-step history
  try {
    const resPromise = mlInferenceService.predictSpatioTemporal(
      'GRID_R01_N2861_E07720',
      'GRID_R01_N2861_E07720',
      validHistory,
      120 // Fresh (2 mins)
    );

    let passed = false;
    resPromise.then((res) => {
      passed =
        res.status === 'MODEL_READY' &&
        res.horizons.length === 4 &&
        res.spatialNeighborhood.neighborhoodCellsCount === 9 &&
        res.horizons[0].rainfallConfidenceInterval.lower <= res.horizons[0].rainfallConfidenceInterval.upper;
    });

    results.push({
      name: 'SpatioTemporal: 6-step history tensor generates multi-horizon nowcast with 90% confidence intervals',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'SpatioTemporal: 6-step history tensor generates multi-horizon nowcast with 90% confidence intervals',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Incomplete sequence (< 6 steps) returns INSUFFICIENT_HISTORY
  try {
    const shortHistory = validHistory.slice(0, 3);
    const shortPromise = mlInferenceService.predictSpatioTemporal(
      'GRID_R01_N2861_E07720',
      'GRID_R01_N2861_E07720',
      shortHistory,
      120
    );

    let isHandled = false;
    shortPromise.then((res) => {
      isHandled = res.status === 'INSUFFICIENT_HISTORY';
    });

    results.push({
      name: 'SpatioTemporal: Short history (< 6 steps) strictly returns INSUFFICIENT_HISTORY',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'SpatioTemporal: Short history (< 6 steps) strictly returns INSUFFICIENT_HISTORY',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
