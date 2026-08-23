import {
  AlertEvent,
  AlertEventStatus,
  AlertEventOrigin,
  AlertDecisionType,
  NotificationChannel,
  NotificationStatus,
  NotificationSkipReason,
  UserSubscription,
  NotificationRecord,
  NotificationDeliveryReceipt,
  NotificationPolicyDecision,
  NotificationMetrics,
  HazardType,
  RiskLevel,
} from '../../../../shared/types/index.js';

export {
  AlertEvent,
  AlertEventStatus,
  AlertEventOrigin,
  AlertDecisionType,
  NotificationChannel,
  NotificationStatus,
  NotificationSkipReason,
  UserSubscription,
  NotificationRecord,
  NotificationDeliveryReceipt,
  NotificationPolicyDecision,
  NotificationMetrics,
  HazardType,
  RiskLevel,
};

export interface AlertThresholdConfig {
  minimumRiskLevelForAlert: RiskLevel; // Default 'HIGH' or 'SEVERE'
  allowWatchAlerts: boolean;
  allowElevatedAlerts: boolean;
  minRiskScore: number; // e.g. 60
}

export interface ProviderSendResult {
  success: boolean;
  providerStatus: 'DELIVERED' | 'SENT' | 'FAILED' | 'RETRY_LATER';
  providerMessageId?: string;
  latencyMs: number;
  error?: string;
}
