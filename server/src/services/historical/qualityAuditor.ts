import {
  NormalizedHistoricalObservation,
} from './types.js';
import { DatasetQualityReport, FeatureRecord } from '../../../../shared/types/index.js';

export class QualityAuditor {
  generateQualityReport(
    datasetId: string,
    versionTag: string,
    observations: NormalizedHistoricalObservation[],
    features: FeatureRecord[]
  ): DatasetQualityReport {
    const totalRecords = observations.length;

    if (totalRecords === 0) {
      return {
        datasetId,
        versionTag,
        totalRecords: 0,
        timeRange: { start: '', end: '' },
        gridCount: 0,
        missingnessPercentages: {
          temperature: 0,
          humidity: 0,
          pressure: 0,
          windSpeed: 0,
          rainfall: 0,
        },
        outlierCounts: {
          temperatureOutliers: 0,
          pressureSpikes: 0,
          extremeWindGusts: 0,
        },
        classBalance: {
          noneCount: 0,
          heavyRainCount: 0,
          cloudburstCount: 0,
          galeWindCount: 0,
          convectiveSurgeCount: 0,
        },
        temporalContinuityPct: 100,
        overallQualityScore: 100,
      };
    }

    // 1. Time Range & Grids
    const timeRange = {
      start: observations[0].observedAt,
      end: observations[totalRecords - 1].observedAt,
    };
    const uniqueGrids = new Set(observations.map((o) => o.gridCode));

    // 2. Missingness Percentages
    let missingTemp = 0;
    let missingHum = 0;
    let missingPres = 0;
    let missingWind = 0;
    let missingRain = 0;

    let tempOutliers = 0;
    let pressureSpikes = 0;
    let extremeWindGusts = 0;

    for (const obs of observations) {
      if (obs.temperature === null) missingTemp++;
      else if (obs.temperature < -40 || obs.temperature > 55) tempOutliers++;

      if (obs.humidity === null) missingHum++;
      if (obs.pressure === null) missingPres++;
      else if (obs.pressure < 900 || obs.pressure > 1060) pressureSpikes++;

      if (obs.windSpeed === null) missingWind++;
      if (obs.windGust !== null && obs.windGust > 120) extremeWindGusts++;

      if (obs.rainfall === null) missingRain++;
    }

    const missingnessPercentages = {
      temperature: Number(((missingTemp / totalRecords) * 100).toFixed(2)),
      humidity: Number(((missingHum / totalRecords) * 100).toFixed(2)),
      pressure: Number(((missingPres / totalRecords) * 100).toFixed(2)),
      windSpeed: Number(((missingWind / totalRecords) * 100).toFixed(2)),
      rainfall: Number(((missingRain / totalRecords) * 100).toFixed(2)),
    };

    const outlierCounts = {
      temperatureOutliers: tempOutliers,
      pressureSpikes,
      extremeWindGusts,
    };

    // 3. Class Balance
    const classBalance = {
      noneCount: 0,
      heavyRainCount: 0,
      cloudburstCount: 0,
      galeWindCount: 0,
      convectiveSurgeCount: 0,
    };

    for (const feat of features) {
      const label = feat.targets.targetConvectiveEvent;
      if (label === 'CLOUDBURST_POTENTIAL') classBalance.cloudburstCount++;
      else if (label === 'HEAVY_RAIN') classBalance.heavyRainCount++;
      else if (label === 'GALE_WIND') classBalance.galeWindCount++;
      else if (label === 'CONVECTIVE_SURGE') classBalance.convectiveSurgeCount++;
      else classBalance.noneCount++;
    }

    // 4. Overall Score Calculation
    const avgMissingness =
      (missingnessPercentages.temperature +
        missingnessPercentages.humidity +
        missingnessPercentages.pressure +
        missingnessPercentages.windSpeed +
        missingnessPercentages.rainfall) /
      5;

    const outlierRate = ((tempOutliers + pressureSpikes + extremeWindGusts) / totalRecords) * 100;
    const overallQualityScore = Math.max(0, Math.min(100, Number((100 - avgMissingness - outlierRate * 2).toFixed(1))));

    return {
      datasetId,
      versionTag,
      totalRecords,
      timeRange,
      gridCount: uniqueGrids.size,
      missingnessPercentages,
      outlierCounts,
      classBalance,
      temporalContinuityPct: Number((100 - avgMissingness).toFixed(1)),
      overallQualityScore,
    };
  }
}

export const qualityAuditor = new QualityAuditor();
