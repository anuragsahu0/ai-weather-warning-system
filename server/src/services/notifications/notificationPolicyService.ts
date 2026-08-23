import {
  AlertEvent,
  UserSubscription,
  NotificationPolicyDecision,
  RiskLevel,
} from './notificationTypes.js';
import { gridEngine } from '../geospatial/gridEngine.js';

const RISK_LEVEL_WEIGHTS: Record<RiskLevel, number> = {
  NORMAL: 1,
  WATCH: 2,
  ELEVATED: 3,
  HIGH: 4,
  SEVERE: 5,
};

export class NotificationPolicyService {
  evaluatePolicy(
    alert: AlertEvent,
    subscription: UserSubscription
  ): NotificationPolicyDecision {
    // 1. Subscription Channel Disabled
    if (!subscription.enabled) {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'USER_DISABLED_CHANNEL',
        matchedCriteria: {
          locationMatched: false,
          hazardMatched: false,
          riskThresholdMatched: false,
          quietHoursSuppressed: false,
        },
      };
    }

    // 2. Alert Validity Check
    const nowMs = Date.now();
    const validUntilMs = new Date(alert.validUntil).getTime();
    if (validUntilMs <= nowMs || alert.status === 'EXPIRED' || alert.status === 'CANCELLED') {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'EXPIRED_ALERT',
        matchedCriteria: {
          locationMatched: false,
          hazardMatched: false,
          riskThresholdMatched: false,
          quietHoursSuppressed: false,
        },
      };
    }

    // 3. Hazard Preference Match
    const hazardMatched =
      subscription.hazardPreferences.includes(alert.hazardType) ||
      subscription.hazardPreferences.includes('SEVERE_WEATHER');

    if (!hazardMatched) {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'WRONG_HAZARD',
        matchedCriteria: {
          locationMatched: false,
          hazardMatched: false,
          riskThresholdMatched: false,
          quietHoursSuppressed: false,
        },
      };
    }

    // 4. Minimum Risk Level Match
    const alertLevelWeight = RISK_LEVEL_WEIGHTS[alert.riskLevel] || 1;
    const subMinWeight = RISK_LEVEL_WEIGHTS[subscription.minimumRiskLevel] || 4; // default HIGH (4)

    const riskThresholdMatched = alertLevelWeight >= subMinWeight;
    if (!riskThresholdMatched) {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'RISK_BELOW_PREFERENCE',
        matchedCriteria: {
          locationMatched: false,
          hazardMatched: true,
          riskThresholdMatched: false,
          quietHoursSuppressed: false,
        },
      };
    }

    // 5. Geographic Location Matching (Grid & Radius)
    let locationMatched = true;

    if (subscription.gridId) {
      locationMatched = subscription.gridId === alert.gridId;
    } else if (
      subscription.latitude !== null &&
      subscription.latitude !== undefined &&
      subscription.longitude !== null &&
      subscription.longitude !== undefined
    ) {
      // Decode alert grid center coordinate
      const alertCell = gridEngine.getGridCell(
        subscription.latitude,
        subscription.longitude,
        0.01
      );
      const distanceKm = gridEngine.calculateDistanceKm(
        { latitude: subscription.latitude, longitude: subscription.longitude },
        alertCell.center
      );
      const allowedRadius = subscription.radiusKm || 5.0;
      locationMatched = distanceKm <= allowedRadius;
    }

    if (!locationMatched) {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'WRONG_LOCATION',
        matchedCriteria: {
          locationMatched: false,
          hazardMatched: true,
          riskThresholdMatched: true,
          quietHoursSuppressed: false,
        },
      };
    }

    // 6. Quiet Hours Check
    let quietHoursSuppressed = false;
    if (subscription.quietHoursEnabled && subscription.quietHoursStart && subscription.quietHoursEnd) {
      const isQuiet = this.isCurrentTimeInQuietHours(
        subscription.quietHoursStart,
        subscription.quietHoursEnd
      );
      if (isQuiet) {
        if (subscription.bypassQuietHoursForSevere && alert.riskLevel === 'SEVERE') {
          quietHoursSuppressed = false; // Bypassed for Severe event
        } else {
          quietHoursSuppressed = true;
        }
      }
    }

    if (quietHoursSuppressed) {
      return {
        shouldSend: false,
        action: 'SKIP',
        reason: 'QUIET_HOURS',
        matchedCriteria: {
          locationMatched: true,
          hazardMatched: true,
          riskThresholdMatched: true,
          quietHoursSuppressed: true,
        },
      };
    }

    // All criteria passed
    return {
      shouldSend: true,
      action: 'SEND',
      matchedCriteria: {
        locationMatched: true,
        hazardMatched: true,
        riskThresholdMatched: true,
        quietHoursSuppressed: false,
      },
    };
  }

  private isCurrentTimeInQuietHours(startStr: string, endStr: string): boolean {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [sH, sM] = startStr.split(':').map(Number);
      const [eH, eM] = endStr.split(':').map(Number);

      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;

      if (startMin <= endMin) {
        return currentMinutes >= startMin && currentMinutes < endMin;
      } else {
        // Crosses midnight (e.g. 23:00 to 07:00)
        return currentMinutes >= startMin || currentMinutes < endMin;
      }
    } catch {
      return false;
    }
  }
}

export const notificationPolicyService = new NotificationPolicyService();
