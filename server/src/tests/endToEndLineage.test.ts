import { lineageTraceService } from '../services/demo/lineageTraceService.js';
import { scenarioReplayService } from '../services/demo/scenarioReplayService.js';

export function runEndToEndLineageTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Complete 6-stage end-to-end data lineage chain
  try {
    // Step to T+20 frame where full alert and notifications are active
    const frame2 = scenarioReplayService.stepTo(2);
    const trace = lineageTraceService.generateLineageTrace(frame2);

    const hasWeather = trace.summary.weatherRecordId.length > 0;
    const hasFused = trace.summary.fusedStateId.length > 0;
    const hasNowcast = trace.summary.predictionId.length > 0;
    const hasRisk = trace.summary.riskId.length > 0;
    const hasAlert = trace.summary.alertId !== undefined && trace.summary.alertId.length > 0;
    const hasNotif = trace.summary.notificationIds.length > 0;

    const stagesMatch =
      trace.nodes.some((n) => n.stage === 'WEATHER_INGESTION') &&
      trace.nodes.some((n) => n.stage === 'DATA_FUSION') &&
      trace.nodes.some((n) => n.stage === 'NOWCASTING') &&
      trace.nodes.some((n) => n.stage === 'RISK_INTELLIGENCE') &&
      trace.nodes.some((n) => n.stage === 'ALERT_DECISION') &&
      trace.nodes.some((n) => n.stage === 'EARLY_WARNING_DISPATCH');

    const passed =
      trace.isTraceValid &&
      hasWeather &&
      hasFused &&
      hasNowcast &&
      hasRisk &&
      hasAlert &&
      hasNotif &&
      stagesMatch;

    results.push({
      name: 'End-to-End Lineage: Verifies full traceability from Weather Record to Notification Dispatch',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'End-to-End Lineage: Verifies full traceability from Weather Record to Notification Dispatch',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Invariant audit traceability across all lineage nodes
  try {
    const trace = lineageTraceService.generateLineageTrace();
    const allNodesHaveTimestamps = trace.nodes.every((n) => typeof n.timestamp === 'string' && n.timestamp.length > 0);
    const allNodesHaveDetails = trace.nodes.every((n) => n.details && Object.keys(n.details).length > 0);

    results.push({
      name: 'End-to-End Lineage: All audit nodes preserve valid timestamps, identifiers and operational metadata',
      passed: allNodesHaveTimestamps && allNodesHaveDetails,
    });
  } catch (err: unknown) {
    results.push({
      name: 'End-to-End Lineage: All audit nodes preserve valid timestamps, identifiers and operational metadata',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
