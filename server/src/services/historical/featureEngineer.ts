import { NormalizedHistoricalObservation } from './types.js';
import { FeatureVector } from '../../../../shared/types/index.js';

export class FeatureEngineer {
  /**
   * Constructs the feature vector for a specific index i in a strictly chronological array.
   * Guaranteed ZERO future leakage: only accesses records at index j <= i.
   */
  constructFeatureVector(
    observations: NormalizedHistoricalObservation[],
    currentIndex: number
  ): FeatureVector {
    if (currentIndex < 0 || currentIndex >= observations.length) {
      throw new Error(`Index ${currentIndex} out of bounds for observations length ${observations.length}`);
    }

    const current = observations[currentIndex];
    const currentTime = new Date(current.observedAt).getTime();

    // 1. Instantaneous Features at time t
    const temperature = current.temperature;
    const feelsLike = current.feelsLike;
    const humidity = current.humidity;
    const pressure = current.pressure;
    const windSpeed = current.windSpeed;
    const windDirection = current.windDirection;
    const windGust = current.windGust;
    const rainfallRate = current.rainfall;
    const cloudCover = current.cloudCover;

    // 2. Backward Historical Window Lookups (j <= currentIndex ONLY)
    let obs30mPrior: NormalizedHistoricalObservation | null = null;
    let obs60mPrior: NormalizedHistoricalObservation | null = null;

    const rolling30mObs: NormalizedHistoricalObservation[] = [current];
    const rolling60mObs: NormalizedHistoricalObservation[] = [current];

    for (let j = currentIndex - 1; j >= 0; j--) {
      const past = observations[j];
      const pastTime = new Date(past.observedAt).getTime();
      const diffMinutes = (currentTime - pastTime) / (60 * 1000);

      if (diffMinutes <= 35 && diffMinutes >= 25 && !obs30mPrior) {
        obs30mPrior = past;
      }
      if (diffMinutes <= 65 && diffMinutes >= 55 && !obs60mPrior) {
        obs60mPrior = past;
      }

      if (diffMinutes <= 35) {
        rolling30mObs.push(past);
      }
      if (diffMinutes <= 65) {
        rolling60mObs.push(past);
      }

      // Beyond 65m, stop searching
      if (diffMinutes > 70) break;
    }

    // Deltas (t - 30m)
    const tempDelta30m =
      obs30mPrior?.temperature != null && temperature != null
        ? Number((temperature - obs30mPrior.temperature).toFixed(1))
        : null;

    const pressureDelta30m =
      obs30mPrior?.pressure != null && pressure != null
        ? Number((pressure - obs30mPrior.pressure).toFixed(1))
        : null;

    const humidityDelta30m =
      obs30mPrior?.humidity != null && humidity != null
        ? Math.round(humidity - obs30mPrior.humidity)
        : null;

    const windSpeedDelta30m =
      obs30mPrior?.windSpeed != null && windSpeed != null
        ? Number((windSpeed - obs30mPrior.windSpeed).toFixed(1))
        : null;

    // Barometric Tendency (t - 60m drop in hPa/hr)
    const pressureTendencyHpaPerHr =
      obs60mPrior?.pressure != null && pressure != null
        ? Number((pressure - obs60mPrior.pressure).toFixed(1))
        : pressureDelta30m !== null
        ? Number((pressureDelta30m * 2).toFixed(1))
        : null;

    // Rolling Accumulations & Statistics (strictly <= t)
    const rollingRainAccum30m = Number(
      rolling30mObs
        .reduce((sum, o) => sum + (o.rainfall ?? 0), 0)
        .toFixed(2)
    );

    const rollingRainAccum60m = Number(
      rolling60mObs
        .reduce((sum, o) => sum + (o.rainfall ?? 0), 0)
        .toFixed(2)
    );

    const validTemps60m = rolling60mObs
      .map((o) => o.temperature)
      .filter((t): t is number => t !== null);

    const rollingMeanTemp60m =
      validTemps60m.length > 0
        ? Number((validTemps60m.reduce((a, b) => a + b, 0) / validTemps60m.length).toFixed(1))
        : null;

    const validWinds60m = rolling60mObs
      .map((o) => o.windGust ?? o.windSpeed)
      .filter((w): w is number => w !== null);

    const rollingMaxWind60m =
      validWinds60m.length > 0 ? Math.max(...validWinds60m) : null;

    // 3. Cyclical Temporal Encodings
    const dateObj = new Date(current.observedAt);
    const hour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60;
    const hourSin = Number(Math.sin((2 * Math.PI * hour) / 24).toFixed(4));
    const hourCos = Number(Math.cos((2 * Math.PI * hour) / 24).toFixed(4));

    const startOfYear = new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 1)).getTime();
    const dayOfYear = (currentTime - startOfYear) / (24 * 3600 * 1000);
    const dayOfYearSin = Number(Math.sin((2 * Math.PI * dayOfYear) / 365.25).toFixed(4));
    const dayOfYearCos = Number(Math.cos((2 * Math.PI * dayOfYear) / 365.25).toFixed(4));

    return {
      temperature,
      feelsLike,
      humidity,
      pressure,
      windSpeed,
      windDirection,
      windGust,
      rainfallRate,
      cloudCover,
      tempDelta30m,
      pressureDelta30m,
      humidityDelta30m,
      windSpeedDelta30m,
      pressureTendencyHpaPerHr,
      rollingRainAccum30m,
      rollingRainAccum60m,
      rollingMeanTemp60m,
      rollingMaxWind60m,
      hourSin,
      hourCos,
      dayOfYearSin,
      dayOfYearCos,
    };
  }
}

export const featureEngineer = new FeatureEngineer();
