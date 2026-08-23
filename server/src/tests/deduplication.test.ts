import { DeduplicationService } from '../services/weather/deduplication.js';
import { NormalizedWeatherData } from '../services/weather/types.js';

export function runDeduplicationTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];
  const dedup = new DeduplicationService();

  const sampleObs: NormalizedWeatherData = {
    id: 'test-1',
    provider: 'open-meteo',
    latitude: 28.6139,
    longitude: 77.209,
    observedAt: '2026-08-22T17:00:00.000Z',
    receivedAt: '2026-08-22T17:00:05.000Z',
    freshnessSeconds: 5,
    dataFreshness: 'FRESH',
    qualityStatus: 'VALID',
    temperature: 30.2,
    feelsLike: 33.1,
    humidity: 70,
    pressure: 1007.2,
    windSpeed: 15.0,
    windDirection: 180,
    windGust: null,
    rainfall: 0.0,
    precipitationRate: 0.0,
    visibility: 10.0,
    cloudCover: 50,
    weatherCondition: 'Overcast',
    weatherCode: 3,
    attribution: { providerName: 'Open-Meteo', sourceUrl: '', license: '' },
  };

  // Test 1: New observation is not detected as duplicate
  try {
    const isDup = dedup.isDuplicate(sampleObs);
    results.push({
      name: 'Deduplication: Fresh observation is not marked as duplicate',
      passed: !isDup,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Deduplication: Fresh observation is not marked as duplicate',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Recorded observation is detected as duplicate
  try {
    dedup.recordObservation(sampleObs);
    const isDup = dedup.isDuplicate(sampleObs);
    results.push({
      name: 'Deduplication: Re-ingested identical observation is recognized as duplicate',
      passed: isDup,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Deduplication: Re-ingested identical observation is recognized as duplicate',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
