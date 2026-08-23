import { SourceQualityFlag } from '../../../../shared/types/index.js';

export interface QualityEvaluation {
  quality: SourceQualityFlag;
  reliabilityScore: number; // 0.0 to 1.0
  flags: string[];
}

export class QualityController {
  evaluateSurfaceMetrics(metrics: {
    temperature?: number | null;
    humidity?: number | null;
    pressure?: number | null;
    windSpeed?: number | null;
    rainfallRate?: number | null;
    freshnessSeconds: number;
  }): QualityEvaluation {
    const flags: string[] = [];

    if (metrics.freshnessSeconds > 2700) {
      flags.push('STALE_DATA');
      return { quality: 'STALE', reliabilityScore: 0.3, flags };
    }

    if (metrics.temperature !== undefined && metrics.temperature !== null) {
      if (metrics.temperature < -50 || metrics.temperature > 65) {
        flags.push('INVALID_TEMPERATURE_BOUNDS');
        return { quality: 'INVALID', reliabilityScore: 0.0, flags };
      }
    }

    if (metrics.humidity !== undefined && metrics.humidity !== null) {
      if (metrics.humidity < 0 || metrics.humidity > 100) {
        flags.push('INVALID_HUMIDITY_BOUNDS');
        return { quality: 'INVALID', reliabilityScore: 0.0, flags };
      }
    }

    if (metrics.pressure !== undefined && metrics.pressure !== null) {
      if (metrics.pressure < 800 || metrics.pressure > 1100) {
        flags.push('INVALID_PRESSURE_BOUNDS');
        return { quality: 'SUSPECT', reliabilityScore: 0.4, flags };
      }
    }

    return {
      quality: 'VALID',
      reliabilityScore: 0.95,
      flags: ['PHYSICALLY_BOUNDED_METRICS'],
    };
  }
}

export const qualityController = new QualityController();
