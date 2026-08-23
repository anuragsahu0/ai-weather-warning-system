import { notificationPolicyService } from '../services/notifications/notificationPolicyService.js';
import { AlertEvent, UserSubscription } from '../services/notifications/notificationTypes.js';

export function runNotificationPolicyTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const baseAlert: AlertEvent = {
    alertId: 'alt-test-pol-01',
    hazardType: 'HEAVY_RAIN',
    gridId: 'GRID_R01_N2861_E07720',
    gridCode: 'GRID_R01_N2861_E07720',
    riskLevel: 'HIGH',
    riskScore: 75,
    probability: 0.82,
    uncertaintyScore: 0.08,
    title: 'Heavy Rain High Risk',
    description: 'Elevated precipitation detected.',
    origin: 'AI_MODEL_ASSESSMENT',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 1800000).toISOString(),
    modelVersion: 'spatiotemporal-convlstm-v1',
    fusionVersion: 'fusion-v1.0',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const matchingSubscription: UserSubscription = {
    subscriptionId: 'sub-pol-01',
    userId: 'usr-1',
    channel: 'IN_APP',
    endpoint: 'inapp-target',
    gridId: 'GRID_R01_N2861_E07720',
    hazardPreferences: ['HEAVY_RAIN', 'THUNDERSTORM'],
    minimumRiskLevel: 'HIGH',
    quietHoursEnabled: false,
    bypassQuietHoursForSevere: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Test 1: Matching criteria produces SEND
  try {
    const decision = notificationPolicyService.evaluatePolicy(baseAlert, matchingSubscription);
    const passed = decision.shouldSend === true && decision.action === 'SEND';

    results.push({
      name: 'Notification Policy: Matched location, hazard & risk threshold permits dispatch (SEND)',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Notification Policy: Matched location, hazard & risk threshold permits dispatch (SEND)',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 2: Unmatched hazard produces SKIP (WRONG_HAZARD)
  try {
    const windOnlySub: UserSubscription = {
      ...matchingSubscription,
      hazardPreferences: ['STRONG_WIND'],
    };
    const decision = notificationPolicyService.evaluatePolicy(baseAlert, windOnlySub);
    const passed = decision.shouldSend === false && decision.reason === 'WRONG_HAZARD';

    results.push({
      name: 'Notification Policy: Unsubscribed hazard type correctly suppresses delivery (WRONG_HAZARD)',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Notification Policy: Unsubscribed hazard type correctly suppresses delivery (WRONG_HAZARD)',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 3: Unmatched location produces SKIP (WRONG_LOCATION)
  try {
    const otherGridSub: UserSubscription = {
      ...matchingSubscription,
      gridId: 'GRID_R01_N1907_E07287', // Mumbai grid vs Delhi alert
    };
    const decision = notificationPolicyService.evaluatePolicy(baseAlert, otherGridSub);
    const passed = decision.shouldSend === false && decision.reason === 'WRONG_LOCATION';

    results.push({
      name: 'Notification Policy: Unmatched spatial grid correctly suppresses delivery (WRONG_LOCATION)',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Notification Policy: Unmatched spatial grid correctly suppresses delivery (WRONG_LOCATION)',
      passed: false,
      error: (err as Error).message,
    });
  }

  // Test 4: Higher minimum threshold produces SKIP (RISK_BELOW_PREFERENCE)
  try {
    const severeOnlySub: UserSubscription = {
      ...matchingSubscription,
      minimumRiskLevel: 'SEVERE', // Minimum is SEVERE (5), but alert is HIGH (4)
    };
    const decision = notificationPolicyService.evaluatePolicy(baseAlert, severeOnlySub);
    const passed = decision.shouldSend === false && decision.reason === 'RISK_BELOW_PREFERENCE';

    results.push({
      name: 'Notification Policy: Risk score below minimum user preference suppresses delivery (RISK_BELOW_PREFERENCE)',
      passed,
    });
  } catch (err: unknown) {
    results.push({
      name: 'Notification Policy: Risk score below minimum user preference suppresses delivery (RISK_BELOW_PREFERENCE)',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
