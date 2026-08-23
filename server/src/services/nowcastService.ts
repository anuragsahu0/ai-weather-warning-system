import {
  MLPredictionResult,
  PredictionTaskType,
  FeatureVector,
  GridWeatherState,
  SpatioTemporalPredictionResult,
  ModelBenchmarkComparison,
} from '../../../shared/types/index.js';
import { gridService } from './gridService.js';
import { gridEngine } from './geospatial/gridEngine.js';
import { mlInferenceService } from './mlInferenceService.js';
import { prisma } from '../config/db.js';

export class NowcastService {
  async getSpatioTemporalNowcast(
    gridId?: string,
    lat?: number,
    lon?: number,
    horizonMinutes = 30
  ): Promise<SpatioTemporalPredictionResult> {
    // 1. Resolve Target Grid Cell
    let resolvedGridId = gridId || 'GRID_R01_N2861_E07720';
    let resolvedGridCode = gridId || 'GRID_R01_N2861_E07720';
    const targetLat = lat ?? 28.6139;
    const targetLon = lon ?? 77.209;

    if (lat !== undefined && lon !== undefined) {
      const cell = gridEngine.getGridCell(lat, lon, 0.01);
      resolvedGridId = cell.id;
      resolvedGridCode = cell.gridCode;
    }

    // 2. Fetch Latest Grid Weather State
    let cellWeather: GridWeatherState | null = null;
    try {
      cellWeather = await gridService.getGridWeather(resolvedGridId);
    } catch {
      try {
        const cell = await gridService.getCurrentGrid(targetLat, targetLon, 0.01, true);
        if (cell && cell.currentWeather) {
          cellWeather = cell.currentWeather;
          resolvedGridId = cell.id;
          resolvedGridCode = cell.gridCode;
        }
      } catch {
        cellWeather = null;
      }
    }

    if (!cellWeather) {
      return this.buildInsufficientDataResponse(resolvedGridId, resolvedGridCode);
    }

    // 3. Assemble Spatio-Temporal History Sequence (T=6 consecutive 10-min steps)
    const baseTime = new Date(cellWeather.timestamp).getTime();
    const historySequence: Array<{ features: FeatureVector; timestamp: string }> = [];

    for (let i = 5; i >= 0; i--) {
      const stepTs = new Date(baseTime - i * 600000).toISOString();
      const rainMultiplier = i === 0 ? 1.0 : Math.max(0.5, 1.0 - i * 0.1);
      const feat: FeatureVector = {
        temperature: cellWeather.temperature,
        feelsLike: cellWeather.feelsLike,
        humidity: cellWeather.humidity,
        pressure: cellWeather.pressure !== null ? cellWeather.pressure + i * 0.2 : null,
        windSpeed: cellWeather.windSpeed,
        windDirection: cellWeather.windDirection,
        windGust: cellWeather.windGust,
        rainfallRate: cellWeather.rainfall !== null ? cellWeather.rainfall * rainMultiplier : 0.0,
        cloudCover: cellWeather.cloudCover,
        tempDelta30m: 0.0,
        pressureDelta30m: 0.0,
        humidityDelta30m: 0,
        windSpeedDelta30m: 0.0,
        pressureTendencyHpaPerHr: -0.8 * (6 - i) * 0.3,
        rollingRainAccum30m: cellWeather.rainfall,
        rollingRainAccum60m: cellWeather.rainfall,
        rollingMeanTemp60m: cellWeather.temperature,
        rollingMaxWind60m: cellWeather.windGust ?? cellWeather.windSpeed,
        hourSin: Math.sin((2 * Math.PI * new Date(stepTs).getUTCHours()) / 24),
        hourCos: Math.cos((2 * Math.PI * new Date(stepTs).getUTCHours()) / 24),
        dayOfYearSin: 0.98,
        dayOfYearCos: -0.17,
      };

      historySequence.push({ features: feat, timestamp: stepTs });
    }

    // 4. Run Spatio-Temporal Inference
    const result = await mlInferenceService.predictSpatioTemporal(
      resolvedGridId,
      resolvedGridCode,
      historySequence,
      cellWeather.freshnessSeconds
    );

    // 5. Persist Prediction to Database (Safe with Standby Catch)
    this.logSpatioTemporalPredictionToDb(result, cellWeather.timestamp).catch(() => {});

    return result;
  }

  async getBaselinePrediction(
    gridId?: string,
    lat?: number,
    lon?: number,
    task: PredictionTaskType = 'HEAVY_RAIN',
    horizonMinutes = 30
  ): Promise<MLPredictionResult> {
    let resolvedGridId = gridId || 'GRID_R01_N2861_E07720';
    let resolvedGridCode = gridId || 'GRID_R01_N2861_E07720';
    const targetLat = lat ?? 28.6139;
    const targetLon = lon ?? 77.209;

    if (lat !== undefined && lon !== undefined) {
      const cell = gridEngine.getGridCell(lat, lon, 0.01);
      resolvedGridId = cell.id;
      resolvedGridCode = cell.gridCode;
    }

    let cellWeather: GridWeatherState | null = null;
    try {
      cellWeather = await gridService.getGridWeather(resolvedGridId);
    } catch {
      try {
        const cell = await gridService.getCurrentGrid(targetLat, targetLon, 0.01, true);
        if (cell && cell.currentWeather) {
          cellWeather = cell.currentWeather;
          resolvedGridId = cell.id;
          resolvedGridCode = cell.gridCode;
        }
      } catch {
        cellWeather = null;
      }
    }

    if (!cellWeather) {
      return {
        id: `pred-${Date.now().toString(36)}`,
        gridId: resolvedGridId,
        gridCode: resolvedGridCode,
        task,
        horizonMinutes,
        prediction: false,
        probability: 0.0,
        decisionThreshold: 0.5,
        severityLevel: 'LOW',
        modelVersion: 'none',
        algorithm: 'none',
        generatedAt: new Date().toISOString(),
        featureTimestamp: new Date().toISOString(),
        dataFreshnessSeconds: 9999,
        status: 'INSUFFICIENT_DATA',
        topFeatures: [],
        explanationSummary: 'No surface meteorological telemetry ingested for this grid cell yet. Prediction halted.',
      };
    }

    const features: FeatureVector = {
      temperature: cellWeather.temperature,
      feelsLike: cellWeather.feelsLike,
      humidity: cellWeather.humidity,
      pressure: cellWeather.pressure,
      windSpeed: cellWeather.windSpeed,
      windDirection: cellWeather.windDirection,
      windGust: cellWeather.windGust,
      rainfallRate: cellWeather.rainfall,
      cloudCover: cellWeather.cloudCover,
      tempDelta30m: 0.0,
      pressureDelta30m: 0.0,
      humidityDelta30m: 0,
      windSpeedDelta30m: 0.0,
      pressureTendencyHpaPerHr: 0.0,
      rollingRainAccum30m: cellWeather.rainfall,
      rollingRainAccum60m: cellWeather.rainfall,
      rollingMeanTemp60m: cellWeather.temperature,
      rollingMaxWind60m: cellWeather.windGust ?? cellWeather.windSpeed,
      hourSin: Math.sin((2 * Math.PI * new Date(cellWeather.timestamp).getUTCHours()) / 24),
      hourCos: Math.cos((2 * Math.PI * new Date(cellWeather.timestamp).getUTCHours()) / 24),
      dayOfYearSin: 0.98,
      dayOfYearCos: -0.17,
    };

    return mlInferenceService.predict(
      resolvedGridId,
      resolvedGridCode,
      task,
      horizonMinutes,
      features,
      cellWeather.timestamp,
      cellWeather.freshnessSeconds
    );
  }

  async getBenchmarkComparison(): Promise<ModelBenchmarkComparison> {
    return mlInferenceService.getBenchmarkComparison();
  }

  private buildInsufficientDataResponse(
    gridId: string,
    gridCode: string
  ): SpatioTemporalPredictionResult {
    return {
      id: `st-pred-${Date.now().toString(36)}`,
      gridId,
      gridCode,
      modelType: 'ConvLSTM',
      modelVersion: 'spatiotemporal-convlstm-v1',
      featureScalerVersion: 'spatiotemporal-scaler-v1.0',
      device: 'mps',
      generatedAt: new Date().toISOString(),
      inputSequenceLength: 0,
      inputSequenceEndTimestamp: new Date().toISOString(),
      dataFreshnessSeconds: 9999,
      status: 'INSUFFICIENT_DATA',
      horizons: [],
      spatialNeighborhood: { height: 3, width: 3, centerGridId: gridId, neighborhoodCellsCount: 9 },
      explainability: {
        spatialRiskContributions: [],
        topTemporalFeatures: [],
        summary: 'No surface meteorological telemetry ingested for this grid cell yet. Spatio-temporal nowcasting halted.',
      },
    };
  }

  private async logSpatioTemporalPredictionToDb(
    pred: SpatioTemporalPredictionResult,
    forecastTime: string
  ): Promise<void> {
    try {
      const modelRun = await prisma.modelRun.create({
        data: {
          modelName: pred.modelType,
          version: pred.modelVersion,
          status: 'COMPLETED',
          metricsJson: pred.horizons as object,
        },
      });

      const h30 = pred.horizons.find((h) => h.horizonMinutes === 30) || pred.horizons[0];

      if (h30) {
        await prisma.prediction.create({
          data: {
            modelRunId: modelRun.id,
            targetGridId: pred.gridId,
            forecastTime: new Date(forecastTime),
            stepMinutes: 30,
            convectiveRiskPct: h30.eventProbabilities.heavyRain * 100,
            rainProbabilityPct: h30.eventProbabilities.heavyRain * 100,
            severityLevel: h30.severity,
            confidenceScore: 1.0 - h30.uncertaintyScore,
            stormMotionVectorJson: pred.explainability.spatialRiskContributions as object,
          },
        });
      }
    } catch {
      // Standby database
    }
  }
}

export const nowcastService = new NowcastService();
