import { featureEngineer } from '../services/historical/featureEngineer.js';
import { NormalizedHistoricalObservation } from '../services/historical/types.js';

export function runFeatureEngineerTests(): { name: string; passed: boolean; error?: string }[] {
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
      pressure: 1006.0, // Drop of 2.0 hPa
      windSpeed: 20.0,
      windDirection: 190,
      windGust: 35.0,
      rainfall: 5.0,
      precipitationRate: 10.0,
      cloudCover: 70,
      weatherCondition: 'Moderate Rain',
      weatherCode: 63,
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
      temperature: 26.0,
      feelsLike: 29.0,
      humidity: 95,
      pressure: 1003.0, // Total drop of 5.0 hPa in 1 hr
      windSpeed: 35.0,
      windDirection: 210,
      windGust: 55.0,
      rainfall: 25.0,
      precipitationRate: 50.0,
      cloudCover: 100,
      weatherCondition: 'Heavy Rain / Convective Surge',
      weatherCode: 65,
      qualityFlag: 'VALID',
      imputationFlag: 'OBSERVED',
    },
  ];

  // Test 1: Feature Calculation Accuracy
  try {
    const feat = featureEngineer.constructFeatureVector(sampleObs, 1);
    const isPressureDeltaAccurate = feat.pressureDelta30m === -2.0;
    const isTempDeltaAccurate = feat.tempDelta30m === -1.5;
    const isRainAccumAccurate = feat.rollingRainAccum30m === 5.0;

    results.push({
      name: 'FeatureEngineer: Accurately computes deltas & rolling accumulation',
      passed: isPressureDeltaAccurate && isTempDeltaAccurate && isRainAccumAccurate,
      error: `pressureDelta30m: ${feat.pressureDelta30m}, tempDelta30m: ${feat.tempDelta30m}`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'FeatureEngineer: Accurately computes deltas & rolling accumulation',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: STRICT FUTURE LEAKAGE PROOF
  try {
    // Construct features at index 1 with full 3-element dataset (which includes future record obs-2 at t=01:00)
    const featWithFuture = featureEngineer.constructFeatureVector(sampleObs, 1);

    // Construct features at index 1 with dataset truncated so obs-2 does not even exist in memory
    const truncatedObs = [sampleObs[0], sampleObs[1]];
    const featWithoutFuture = featureEngineer.constructFeatureVector(truncatedObs, 1);

    // Assert that every single feature field is 100% identical
    const isLeakageFree = JSON.stringify(featWithFuture) === JSON.stringify(featWithoutFuture);

    results.push({
      name: 'FeatureEngineer: PROOF — Feature vector at time t is mathematically invariant to future records',
      passed: isLeakageFree,
      error: isLeakageFree ? undefined : 'Feature values differed when future records were present!',
    });
  } catch (err: unknown) {
    results.push({
      name: 'FeatureEngineer: PROOF — Feature vector at time t is mathematically invariant to future records',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
