import { QualityStatus, DataFreshnessLevel } from '@shared/types/index.js';
import { NormalizedWeatherData } from './types.js';
import { config } from '../../config/index.js';

export class QualityEngine {
  private staleThresholdSeconds: number;

  constructor(staleThreshold = config.WEATHER_STALE_THRESHOLD_SECONDS) {
    this.staleThresholdSeconds = staleThreshold;
  }

  calculateFreshnessSeconds(observedAtIso: string): number {
    const observedTime = new Date(observedAtIso).getTime();
    if (isNaN(observedTime)) return 999999;
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - observedTime) / 1000));
    return diff;
  }

  evaluateFreshness(freshnessSeconds: number): DataFreshnessLevel {
    if (freshnessSeconds < 900) return 'FRESH'; // < 15 min
    if (freshnessSeconds < this.staleThresholdSeconds) return 'RECENT'; // < 45 min
    if (freshnessSeconds < 7200) return 'STALE'; // < 2 hours
    return 'EXPIRED';
  }

  evaluateQuality(data: Omit<NormalizedWeatherData, 'id' | 'qualityStatus'>): QualityStatus {
    // 1. Critical primary meteorological parameters check
    const hasCore =
      data.temperature != null &&
      data.humidity != null &&
      data.pressure != null &&
      data.windSpeed != null;

    if (!hasCore) {
      // If temperature is missing completely, mark invalid
      if (data.temperature == null) return 'INVALID';
      return 'PARTIAL';
    }

    // 2. Staleness check
    if (data.freshnessSeconds > this.staleThresholdSeconds) {
      return 'STALE';
    }

    // 3. Completeness check
    const hasAllExtended =
      data.feelsLike != null &&
      data.windDirection != null &&
      data.visibility != null &&
      data.cloudCover != null;

    return hasAllExtended ? 'VALID' : 'PARTIAL';
  }
}

export const qualityEngine = new QualityEngine();
