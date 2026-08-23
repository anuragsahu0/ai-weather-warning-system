import { WeatherGridCell, GridWeatherState } from '@shared/types/index.js';
import { NormalizedWeatherData } from '../weather/types.js';
import { gridEngine } from './gridEngine.js';
import { qualityEngine } from '../weather/qualityEngine.js';

export class GridWeatherAggregator {
  deriveGridWeatherState(
    cell: WeatherGridCell,
    observations: NormalizedWeatherData[]
  ): GridWeatherState | null {
    if (!observations || observations.length === 0) {
      return null;
    }

    // Filter to observations within or near the cell (e.g. within 2x resolution)
    const validObs = observations.filter((obs) => obs.temperature !== null || obs.pressure !== null);
    if (validObs.length === 0) {
      return null;
    }

    // Sort by latest observation timestamp first
    validObs.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
    const latestObs = validObs[0];

    const stateId = `gws-${cell.gridCode}-${new Date(latestObs.observedAt).getTime()}`;
    const rawIds = validObs.map((o) => o.id);

    // Case 1: Single observation
    if (validObs.length === 1) {
      const obs = validObs[0];
      return {
        id: stateId,
        gridId: cell.id,
        gridCode: cell.gridCode,
        timestamp: obs.observedAt,
        temperature: obs.temperature,
        feelsLike: obs.feelsLike,
        humidity: obs.humidity,
        pressure: obs.pressure,
        windSpeed: obs.windSpeed,
        windDirection: obs.windDirection,
        windGust: obs.windGust,
        rainfall: obs.rainfall,
        precipitationRate: obs.precipitationRate,
        visibility: obs.visibility,
        cloudCover: obs.cloudCover,
        weatherCondition: obs.weatherCondition,
        weatherCode: obs.weatherCode,
        dataQuality: obs.qualityStatus,
        dataFreshness: obs.dataFreshness,
        freshnessSeconds: obs.freshnessSeconds,
        sourceCount: 1,
        rawObservationIds: rawIds,
        aggregationMethod: 'SINGLE_STATION',
        createdAt: new Date().toISOString(),
      };
    }

    // Case 2: Multiple observations (Inverse Distance Weighted Averaging)
    const weights: number[] = [];
    let totalWeight = 0;

    for (const obs of validObs) {
      const distKm = gridEngine.calculateDistanceKm(cell.center, {
        latitude: obs.latitude,
        longitude: obs.longitude,
      });
      // Inverse distance weighting with small epsilon to avoid divide by zero
      const weight = 1 / Math.max(distKm * distKm, 0.01);
      weights.push(weight);
      totalWeight += weight;
    }

    // Weighted continuous metrics
    const weightedAvg = (getter: (o: NormalizedWeatherData) => number | null): number | null => {
      let sum = 0;
      let wSum = 0;
      for (let i = 0; i < validObs.length; i++) {
        const val = getter(validObs[i]);
        if (val !== null) {
          sum += val * weights[i];
          wSum += weights[i];
        }
      }
      return wSum > 0 ? Number((sum / wSum).toFixed(1)) : null;
    };

    // Find nearest station for discrete/directional values
    let nearestObs = validObs[0];
    let minDistance = Infinity;
    for (const obs of validObs) {
      const dist = gridEngine.calculateDistanceKm(cell.center, {
        latitude: obs.latitude,
        longitude: obs.longitude,
      });
      if (dist < minDistance) {
        minDistance = dist;
        nearestObs = obs;
      }
    }

    const temperature = weightedAvg((o) => o.temperature);
    const humidity = weightedAvg((o) => o.humidity);
    const pressure = weightedAvg((o) => o.pressure);
    const windSpeed = weightedAvg((o) => o.windSpeed);
    const feelsLike = weightedAvg((o) => o.feelsLike);
    const visibility = weightedAvg((o) => o.visibility);
    const cloudCover = weightedAvg((o) => o.cloudCover);

    // Max localized precipitation across reporting stations in the cell
    const rainfalls = validObs.map((o) => o.rainfall).filter((r): r is number => r !== null);
    const peakRainfall = rainfalls.length > 0 ? Math.max(...rainfalls) : null;

    const precipRates = validObs.map((o) => o.precipitationRate).filter((p): p is number => p !== null);
    const peakPrecipRate = precipRates.length > 0 ? Math.max(...precipRates) : null;

    const freshnessSeconds = qualityEngine.calculateFreshnessSeconds(latestObs.observedAt);
    const dataFreshness = qualityEngine.evaluateFreshness(freshnessSeconds);
    const dataQuality = qualityEngine.evaluateQuality({
      provider: 'grid-ensemble',
      latitude: cell.center.latitude,
      longitude: cell.center.longitude,
      observedAt: latestObs.observedAt,
      receivedAt: new Date().toISOString(),
      freshnessSeconds,
      dataFreshness,
      temperature,
      feelsLike,
      humidity,
      pressure,
      windSpeed,
      windDirection: nearestObs.windDirection,
      windGust: nearestObs.windGust,
      rainfall: peakRainfall,
      precipitationRate: peakPrecipRate,
      visibility,
      cloudCover,
      weatherCondition: nearestObs.weatherCondition,
      weatherCode: nearestObs.weatherCode,
      attribution: nearestObs.attribution,
    });

    return {
      id: stateId,
      gridId: cell.id,
      gridCode: cell.gridCode,
      timestamp: latestObs.observedAt,
      temperature,
      feelsLike,
      humidity: humidity !== null ? Math.round(humidity) : null,
      pressure,
      windSpeed,
      windDirection: nearestObs.windDirection,
      windGust: nearestObs.windGust,
      rainfall: peakRainfall,
      precipitationRate: peakPrecipRate,
      visibility,
      cloudCover: cloudCover !== null ? Math.round(cloudCover) : null,
      weatherCondition: nearestObs.weatherCondition,
      weatherCode: nearestObs.weatherCode,
      dataQuality,
      dataFreshness,
      freshnessSeconds,
      sourceCount: validObs.length,
      rawObservationIds: rawIds,
      aggregationMethod: 'DISTANCE_WEIGHTED_AVERAGE',
      createdAt: new Date().toISOString(),
    };
  }
}

export const gridWeatherAggregator = new GridWeatherAggregator();
