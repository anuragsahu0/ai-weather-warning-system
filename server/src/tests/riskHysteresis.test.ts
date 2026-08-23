import { RiskStateMachine } from '../services/risk/riskStateMachine.js';

export function runRiskHysteresisTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const sm = new RiskStateMachine();
  const testGrid = 'GRID_TEST_HYSTERESIS_01';

  try {
    // 1. Trigger HIGH with score = 65 (>= 61)
    const t1 = sm.evaluateTransition(testGrid, 'HEAVY_RAIN', 65);
    const step1Pass = t1.level === 'HIGH' && t1.transitioned === true;

    // 2. Score drops slightly to 58 (below 61, but above deactivation 56) -> Should stay HIGH
    const t2 = sm.evaluateTransition(testGrid, 'HEAVY_RAIN', 58);
    const step2Pass = t2.level === 'HIGH' && t2.transitioned === false;

    // 3. Score drops to 52 (below deactivation 56) -> Should transition to ELEVATED
    const t3 = sm.evaluateTransition(testGrid, 'HEAVY_RAIN', 52);
    const step3Pass = t3.level === 'ELEVATED' && t3.transitioned === true;

    results.push({
      name: 'Risk State Machine: Hysteresis damping prevents flapping on minor score fluctuations',
      passed: step1Pass && step2Pass && step3Pass,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Risk State Machine: Hysteresis damping prevents flapping on minor score fluctuations',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
