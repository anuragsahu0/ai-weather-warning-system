import {
  HazardType,
  RiskLevel,
  RiskDataQualityStatus,
  RiskAssessmentStatus,
  RiskExplanationFactor,
  RiskTimelineStep,
  RiskAssessmentResult,
  RiskHotspotCluster,
  RiskOverviewSummary,
  RiskStateTransitionRecord,
  RiskVerificationRecord,
} from '../../../../shared/types/index.js';

export {
  HazardType,
  RiskLevel,
  RiskDataQualityStatus,
  RiskAssessmentStatus,
  RiskExplanationFactor,
  RiskTimelineStep,
  RiskAssessmentResult,
  RiskHotspotCluster,
  RiskOverviewSummary,
  RiskStateTransitionRecord,
  RiskVerificationRecord,
};

export interface HazardEvaluationContext {
  gridId: string;
  gridCode: string;
  timestamp: string;
  dataFreshnessSeconds: number;
  dataQuality: RiskDataQualityStatus;
  // Surface Telemetry
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windGust: number | null;
  rainfallRate: number | null;
  rollingRainAccum60m: number | null;
  pressureTendencyHpaPerHr: number | null;
  // Spatio-Temporal Nowcast Inputs
  modelProbability: number;
  expectedRainfallRate: number;
  expectedWindSpeed: number;
  uncertaintyScore: number;
  horizonMinutes: number;
}

export interface HazardStrategyResult {
  hazardType: HazardType;
  rawRiskScore: number; // 0–100 before uncertainty penalty
  finalRiskScore: number; // 0–100 after uncertainty adjustment
  riskLevel: RiskLevel;
  modelProbability: number;
  uncertaintyPenalty: number;
  contributingFactors: RiskExplanationFactor[];
  summary: string;
}
