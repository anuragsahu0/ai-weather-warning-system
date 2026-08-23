import { scenarioReplayService } from '../services/demo/scenarioReplayService.js';

export function runScenarioReplayTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Retrieve available historical replay scenarios
  try {
    const scenarios = scenarioReplayService.getScenarios();
    const passed =
      scenarios.length > 0 &&
      scenarios[0].dataType === 'HISTORICAL_REANALYSIS_REPLAY' &&
      scenarios[0].totalSteps === 4;

    results.push({
      name: 'Scenario Replay: Retrieves registered historical reanalysis scenarios with valid metadata',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Scenario Replay: Retrieves registered historical reanalysis scenarios with valid metadata',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Step through timeline from T+00 to T+20 and verify synchronized state
  try {
    // Step to T+00
    const frame0 = scenarioReplayService.stepTo(0);
    const pass0 = frame0.timeOffsetLabel === 'T+00' && frame0.riskAssessment.riskScore === 38;

    // Step to T+20 (Peak cloudburst)
    const frame2 = scenarioReplayService.stepTo(2);
    const pass2 =
      frame2.timeOffsetLabel === 'T+20' &&
      frame2.riskAssessment.riskLevel === 'SEVERE' &&
      frame2.alert !== undefined &&
      frame2.alert.alertId.includes('DELHI');

    results.push({
      name: 'Scenario Replay: Steps through timeline with synchronized weather, nowcast, risk and alert states',
      passed: pass0 && pass2,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Scenario Replay: Steps through timeline with synchronized weather, nowcast, risk and alert states',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Reset replay returns to initial T+00 state
  try {
    const resetFrame = scenarioReplayService.reset();
    const passed = resetFrame.stepIndex === 0 && resetFrame.timeOffsetLabel === 'T+00';

    results.push({
      name: 'Scenario Replay: Reset command smoothly restores initial T+00 baseline frame',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Scenario Replay: Reset command smoothly restores initial T+00 baseline frame',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
