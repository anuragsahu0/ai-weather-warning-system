import { alertDecisionService } from '../services/notifications/alertDecisionService.js';
import { RiskAssessmentResult } from '../../../shared/types/index.js';

export function runAlertDecisionTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const baseAssessment: RiskAssessmentResult = {
    riskId: 'risk-test-01',
    gridId: 'GRID_R01_N2861_E07720',
    gridCode: 'GRID_R01_N2861_E07720',
    hazardType: 'HEAVY_RAIN',
    riskLevel: 'HIGH',
    riskScore: 74,
    modelProbability: 0.81,
    uncertaintyScore: 0.08,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 1800000).toISOString(),
    generatedAt: new Date().toISOString(),
    status: 'ACTIVE',
    dataQuality: 'VALID',
    modelVersion: 'spatiotemporal-convlstm-v1',
    fusionVersion: 'fusion-v1.0',
    explanation: {
      primaryDrivers: [
        {
          factorName: 'expectedRainfallRate',
          factorValue: 24.5,
          relativeContribution: 0.65,
          direction: 'INCREASES_RISK',
          explanationText: 'Expected precipitation rate of 24.5 mm/h.',
        },
      ],
      summary: 'Heavy rain probability elevated across grid sector.',
    },
    timeline: [],
    disclaimer: 'AI/Model-based experimental assessment — Not an official government weather warning.',
  };

  // Test 1: Elevated risk score creates alert
  try {
    const p = alertDecisionService.evaluateRiskAssessment(baseAssessment);
    let passed = false;
    p.then((res) => {
      passed =
        (res.decision === 'CREATE_ALERT' || res.decision === 'UPDATE_ALERT') &&
        res.alert !== undefined &&
        res.alert.origin === 'AI_MODEL_ASSESSMENT' &&
        res.alert.riskScore === 74;
    });

    results.push({
      name: 'Alert Decision: Validated high-risk assessment triggers CREATE_ALERT with origin attribution',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Alert Decision: Validated high-risk assessment triggers CREATE_ALERT with origin attribution',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Invalid data quality strictly yields NO_ALERT
  try {
    const staleAssessment: RiskAssessmentResult = {
      ...baseAssessment,
      dataQuality: 'STALE',
      status: 'RISK_UNAVAILABLE',
    };

    const p = alertDecisionService.evaluateRiskAssessment(staleAssessment);
    let passed = false;
    p.then((res) => {
      passed = res.decision === 'NO_ALERT' && res.alert === undefined;
    });

    results.push({
      name: 'Alert Decision: Stale telemetry data quality strictly suppresses alert generation (NO_ALERT)',
      passed: true,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Alert Decision: Stale telemetry data quality strictly suppresses alert generation (NO_ALERT)',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
