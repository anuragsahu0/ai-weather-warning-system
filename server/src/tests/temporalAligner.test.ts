import { temporalAligner } from '../services/historical/temporalAligner.js';
import { RawHistoricalTimeSeries } from '../services/historical/types.js';

export function runTemporalAlignerTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const rawSample: RawHistoricalTimeSeries = {
    latitude: 28.6139,
    longitude: 77.209,
    elevation: 215,
    generationtime_ms: 0.5,
    utc_offset_seconds: 0,
    timezone: 'UTC',
    hourly: {
      time: [
        '2024-07-01T00:00',
        '2024-07-01T01:00',
        '2024-07-01T02:00',
        '2024-07-01T03:00',
      ],
      temperature_2m: [28.5, 27.8, 27.2, 26.5],
      relative_humidity_2m: [80, 85, 88, 92],
      surface_pressure: [1005.2, 1004.8, 1003.5, 1001.2],
      precipitation: [0.0, 0.5, 12.0, 24.5],
      wind_speed_10m: [12.0, 15.5, 28.0, 42.0],
      weather_code: [1, 2, 63, 65],
    },
  };

  // Test 1: Timestamp normalization and UTC format
  try {
    const aligned = temporalAligner.alignAndNormalize(rawSample, 0.01);
    const hasIsoUtc = aligned.every((r) => r.observedAt.endsWith('Z'));

    results.push({
      name: 'TemporalAligner: Normalizes all hourly timestamps to UTC ISO',
      passed: hasIsoUtc && aligned.length === 4,
    });
  } catch (err: unknown) {
    results.push({
      name: 'TemporalAligner: Normalizes all hourly timestamps to UTC ISO',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Chronological Ordering
  try {
    const aligned = temporalAligner.alignAndNormalize(rawSample, 0.01);
    let isChronological = true;
    for (let i = 1; i < aligned.length; i++) {
      if (new Date(aligned[i].observedAt).getTime() <= new Date(aligned[i - 1].observedAt).getTime()) {
        isChronological = false;
        break;
      }
    }

    results.push({
      name: 'TemporalAligner: Guarantees strict ascending chronological sorting',
      passed: isChronological,
    });
  } catch (err: unknown) {
    results.push({
      name: 'TemporalAligner: Guarantees strict ascending chronological sorting',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
