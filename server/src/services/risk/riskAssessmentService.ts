import {
  HazardType,
  RiskAssessmentResult,
  RiskTimelineStep,
  HazardEvaluationContext,
} from './riskTypes.js';
import { HAZARD_STRATEGIES } from './hazardStrategies.js';
import { riskStateMachine } from './riskStateMachine.js';
import { riskExplanationService } from './riskExplanationService.js';
import { nowcastService } from '../nowcastService.js';
import { weatherFusionService } from '../fusion/weatherFusionService.js';
import { gridEngine } from '../geospatial/gridEngine.js';
import { prisma } from '../../config/db.js';

export class RiskAssessmentService {
  async assessRisk(
    gridId?: string,
    lat?: number,
    lon?: number,
    hazard: HazardType = 'HEAVY_RAIN',
    horizonMinutes = 30
  ): Promise<RiskAssessmentResult> {
    const nowIso = new Date().toISOString();
    const targetLat = lat ?? 28.6139;
    const targetLon = lon ?? 77.209;

    const cell = gridEngine.getGridCell(targetLat, targetLon, 0.01);
    const resolvedGridId = gridId || cell.id;
    const resolvedGridCode = cell.gridCode || resolvedGridId;

    // 1. Fetch Multi-Source Fused State
    const { fusedState } = await weatherFusionService.fuseWeatherForGrid(targetLat, targetLon, resolvedGridId);

    // 2. Data Quality Gate Check
    if (fusedState.dataFreshnessSeconds > 1800 || fusedState.dataQuality === 'INVALID') {
      return this.buildUnavailableResponse(
        resolvedGridId,
        resolvedGridCode,
        hazard,
        nowIso,
        fusedState.dataFreshnessSeconds,
        `Telemetry data is stale (${fusedState.dataFreshnessSeconds}s old > 30 min limit). Risk assessment halted to prevent misleading output.`
      );
    }

    // 3. Fetch Spatio-Temporal Nowcast
    const nowcast = await nowcastService.getSpatioTemporalNowcast(
      resolvedGridId,
      targetLat,
      targetLon,
      horizonMinutes
    );

    const horizonsList = [0, 10, 20, 30, 60];
    const timeline: RiskTimelineStep[] = [];

    const strategy = HAZARD_STRATEGIES[hazard] || HAZARD_STRATEGIES.HEAVY_RAIN;

    for (const h of horizonsList) {
      const hData = nowcast.horizons?.find((item) => item.horizonMinutes === h) ||
        nowcast.horizons?.[2] || {
          expectedRainfall: fusedState.rainfall ?? 0.0,
          expectedWindSpeed: fusedState.windSpeed ?? 10.0,
          eventProbabilities: { heavyRain: 0.05, severeConvective: 0.03, galeWind: 0.02 },
          uncertaintyScore: 0.1,
        };

      const prob =
        hazard === 'HEAVY_RAIN'
          ? hData.eventProbabilities.heavyRain
          : hazard === 'THUNDERSTORM'
          ? hData.eventProbabilities.severeConvective
          : hazard === 'STRONG_WIND'
          ? hData.eventProbabilities.galeWind
          : hData.eventProbabilities.heavyRain;

      const evalCtx: HazardEvaluationContext = {
        gridId: resolvedGridId,
        gridCode: resolvedGridCode,
        timestamp: nowIso,
        dataFreshnessSeconds: fusedState.dataFreshnessSeconds,
        dataQuality: 'VALID',
        temperature: fusedState.temperature,
        humidity: fusedState.humidity,
        pressure: fusedState.pressure,
        windSpeed: fusedState.windSpeed,
        windGust: fusedState.windGust,
        rainfallRate: fusedState.rainfall,
        rollingRainAccum60m: fusedState.rainfall,
        pressureTendencyHpaPerHr: -0.5,
        modelProbability: prob,
        expectedRainfallRate: hData.expectedRainfall,
        expectedWindSpeed: hData.expectedWindSpeed,
        uncertaintyScore: hData.uncertaintyScore,
        horizonMinutes: h,
      };

      const res = strategy.evaluate(evalCtx);
      const stepValidUntil = new Date(Date.now() + (h === 0 ? 10 : h) * 60000).toISOString();

      timeline.push({
        horizonMinutes: h,
        validFrom: nowIso,
        validUntil: stepValidUntil,
        riskLevel: res.riskLevel,
        riskScore: res.finalRiskScore,
        modelProbability: prob,
        uncertaintyScore: hData.uncertaintyScore,
        primaryHazard: hazard,
        summary: res.summary,
      });
    }

    // Active Horizon Evaluation (e.g. at selected horizon)
    const activeStep = timeline.find((t) => t.horizonMinutes === (horizonMinutes === 0 ? 30 : horizonMinutes)) || timeline[3];

    // State Transition Check with Hysteresis
    const transitionState = riskStateMachine.evaluateTransition(
      resolvedGridId,
      hazard,
      activeStep.riskScore
    );

    const activeEvalCtx: HazardEvaluationContext = {
      gridId: resolvedGridId,
      gridCode: resolvedGridCode,
      timestamp: nowIso,
      dataFreshnessSeconds: fusedState.dataFreshnessSeconds,
      dataQuality: 'VALID',
      temperature: fusedState.temperature,
      humidity: fusedState.humidity,
      pressure: fusedState.pressure,
      windSpeed: fusedState.windSpeed,
      windGust: fusedState.windGust,
      rainfallRate: fusedState.rainfall,
      rollingRainAccum60m: fusedState.rainfall,
      pressureTendencyHpaPerHr: -0.5,
      modelProbability: activeStep.modelProbability,
      expectedRainfallRate: (nowcast.horizons?.[2]?.expectedRainfall) ?? 0.0,
      expectedWindSpeed: (nowcast.horizons?.[2]?.expectedWindSpeed) ?? 10.0,
      uncertaintyScore: activeStep.uncertaintyScore,
      horizonMinutes,
    };

    const activeStrategyResult = strategy.evaluate(activeEvalCtx);
    const narrative = riskExplanationService.generateExplanationNarrative(
      hazard,
      activeStep.riskScore,
      activeStrategyResult.contributingFactors
    );

    const validUntilIso = new Date(Date.now() + horizonMinutes * 60000).toISOString();
    const riskAssessmentId = `risk-${Date.now().toString(36)}`;

    const assessmentResult: RiskAssessmentResult = {
      riskId: riskAssessmentId,
      gridId: resolvedGridId,
      gridCode: resolvedGridCode,
      hazardType: hazard,
      riskLevel: transitionState.level,
      riskScore: activeStep.riskScore,
      modelProbability: activeStep.modelProbability,
      uncertaintyScore: activeStep.uncertaintyScore,
      validFrom: nowIso,
      validUntil: validUntilIso,
      generatedAt: nowIso,
      status: 'ACTIVE',
      dataQuality: 'VALID',
      modelVersion: nowcast.modelVersion || 'spatiotemporal-convlstm-v1',
      fusionVersion: fusedState.fusionVersion || 'fusion-v1.0',
      explanation: {
        primaryDrivers: activeStrategyResult.contributingFactors,
        summary: narrative,
      },
      timeline,
      disclaimer: 'AI/Model-based experimental assessment — Not an official government weather warning.',
    };

    // 8. Persist to Database asynchronously
    this.persistAssessmentToDb(assessmentResult).catch(() => {});

    return assessmentResult;
  }

  private buildUnavailableResponse(
    gridId: string,
    gridCode: string,
    hazard: HazardType,
    nowIso: string,
    freshness: number,
    reason: string
  ): RiskAssessmentResult {
    return {
      riskId: `risk-unavail-${Date.now().toString(36)}`,
      gridId,
      gridCode,
      hazardType: hazard,
      riskLevel: 'NORMAL',
      riskScore: 0,
      modelProbability: 0.0,
      uncertaintyScore: 1.0,
      validFrom: nowIso,
      validUntil: nowIso,
      generatedAt: nowIso,
      status: 'RISK_UNAVAILABLE',
      dataQuality: freshness > 1800 ? 'STALE' : 'INSUFFICIENT_DATA',
      modelVersion: 'spatiotemporal-convlstm-v1',
      fusionVersion: 'fusion-v1.0',
      explanation: {
        primaryDrivers: [],
        summary: reason,
      },
      timeline: [],
      disclaimer: 'AI/Model-based experimental assessment — Not an official government weather warning.',
    };
  }

  private async persistAssessmentToDb(r: RiskAssessmentResult): Promise<void> {
    try {
      const record = await prisma.riskAssessmentRecord.create({
        data: {
          id: r.riskId,
          gridId: r.gridId,
          hazardType: r.hazardType,
          riskLevel: r.riskLevel,
          riskScore: r.riskScore,
          modelProbability: r.modelProbability,
          uncertaintyScore: r.uncertaintyScore,
          validFrom: new Date(r.validFrom),
          validUntil: new Date(r.validUntil),
          generatedAt: new Date(r.generatedAt),
          status: r.status,
          dataQuality: r.dataQuality,
          modelVersion: r.modelVersion,
          fusionVersion: r.fusionVersion,
          summaryText: r.explanation.summary,
        },
      });

      for (const f of r.explanation.primaryDrivers) {
        await prisma.riskExplanationRecord.create({
          data: {
            assessmentId: record.id,
            factorName: f.factorName,
            factorValue: typeof f.factorValue === 'number' ? f.factorValue : 0.0,
            relativeContribution: f.relativeContribution,
            direction: f.direction,
            explanationText: f.explanationText,
          },
        });
      }
    } catch {
      // Resilient DB catch
    }
  }
}

export const riskAssessmentService = new RiskAssessmentService();
