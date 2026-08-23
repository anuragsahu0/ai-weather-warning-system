import { qualityEngine } from '../services/weather/qualityEngine.js';

export function runQualityEngineTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Freshness evaluation under 15 minutes is FRESH
  try {
    const freshness = qualityEngine.evaluateFreshness(300); // 5 min
    results.push({
      name: 'QualityEngine: Classifies observation < 15 min as FRESH',
      passed: freshness === 'FRESH',
    });
  } catch (err: unknown) {
    results.push({
      name: 'QualityEngine: Classifies observation < 15 min as FRESH',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Freshness evaluation between 15 and 45 minutes is RECENT
  try {
    const freshness = qualityEngine.evaluateFreshness(1800); // 30 min
    results.push({
      name: 'QualityEngine: Classifies observation between 15m and 45m as RECENT',
      passed: freshness === 'RECENT',
    });
  } catch (err: unknown) {
    results.push({
      name: 'QualityEngine: Classifies observation between 15m and 45m as RECENT',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Freshness evaluation over 45 minutes is STALE
  try {
    const freshness = qualityEngine.evaluateFreshness(3600); // 60 min
    results.push({
      name: 'QualityEngine: Classifies observation > 45 min as STALE',
      passed: freshness === 'STALE',
    });
  } catch (err: unknown) {
    results.push({
      name: 'QualityEngine: Classifies observation > 45 min as STALE',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 4: Quality grading with missing primary fields is PARTIAL / INVALID
  try {
    const qualityWithNullTemp = qualityEngine.evaluateQuality({
      provider: 'test',
      latitude: 28.6,
      longitude: 77.2,
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      freshnessSeconds: 100,
      dataFreshness: 'FRESH',
      temperature: null,
      feelsLike: null,
      humidity: 50,
      pressure: 1010,
      windSpeed: 10,
      windDirection: 90,
      windGust: null,
      rainfall: null,
      precipitationRate: null,
      visibility: null,
      cloudCover: null,
      weatherCondition: null,
      weatherCode: null,
      attribution: { providerName: 'Test', sourceUrl: '', license: '' },
    });

    results.push({
      name: 'QualityEngine: Flags missing critical temperature as INVALID',
      passed: qualityWithNullTemp === 'INVALID',
    });
  } catch (err: unknown) {
    results.push({
      name: 'QualityEngine: Flags missing critical temperature as INVALID',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
