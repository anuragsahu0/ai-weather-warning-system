import { NormalizedHistoricalObservation } from './types.js';
import { ConvectiveLabelType } from '../../../../shared/types/index.js';

export interface GeneratedTargets {
  targetRain15m: number | null;
  targetRain30m: number | null;
  targetRain60m: number | null;
  targetConvectiveEvent: ConvectiveLabelType;
}

export class TargetGenerator {
  /**
   * Generates target values looking strictly into future observations (j > currentIndex).
   */
  generateTargets(
    observations: NormalizedHistoricalObservation[],
    currentIndex: number
  ): GeneratedTargets {
    const current = observations[currentIndex];
    const currentTime = new Date(current.observedAt).getTime();

    let targetRain15m: number | null = null;
    let targetRain30m: number | null = null;
    let targetRain60m: number | null = null;

    let maxFutureRain = 0;
    let maxFutureWind = 0;
    let maxFutureGust = 0;

    for (let j = currentIndex + 1; j < observations.length; j++) {
      const future = observations[j];
      const futureTime = new Date(future.observedAt).getTime();
      const diffMinutes = (futureTime - currentTime) / (60 * 1000);

      if (future.rainfall !== null) {
        if (diffMinutes <= 20 && targetRain15m === null) targetRain15m = future.rainfall;
        if (diffMinutes <= 35 && diffMinutes >= 20 && targetRain30m === null) targetRain30m = future.rainfall;
        if (diffMinutes <= 65 && diffMinutes >= 50 && targetRain60m === null) targetRain60m = future.rainfall;

        if (diffMinutes <= 65) {
          maxFutureRain = Math.max(maxFutureRain, future.rainfall);
        }
      }

      if (diffMinutes <= 65) {
        if (future.windSpeed !== null) maxFutureWind = Math.max(maxFutureWind, future.windSpeed);
        if (future.windGust !== null) maxFutureGust = Math.max(maxFutureGust, future.windGust);
      }

      if (diffMinutes > 70) break;
    }

    // Classify Event Label based on official meteorological criteria
    let targetConvectiveEvent: ConvectiveLabelType = 'NONE';
    if (maxFutureRain >= 50.0) {
      targetConvectiveEvent = 'CLOUDBURST_POTENTIAL';
    } else if (maxFutureRain >= 15.0) {
      targetConvectiveEvent = 'HEAVY_RAIN';
    } else if (maxFutureWind >= 50.0 || maxFutureGust >= 70.0) {
      targetConvectiveEvent = 'GALE_WIND';
    } else if (maxFutureRain >= 5.0 && (current.pressure !== null && current.pressure < 995)) {
      targetConvectiveEvent = 'CONVECTIVE_SURGE';
    }

    return {
      targetRain15m,
      targetRain30m,
      targetRain60m,
      targetConvectiveEvent,
    };
  }
}

export const targetGenerator = new TargetGenerator();
