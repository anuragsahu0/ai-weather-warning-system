import { RiskAssessmentResult } from '../../../../shared/types/index.js';
import { alertDecisionService } from './alertDecisionService.js';
import { subscriptionService } from './subscriptionService.js';
import { notificationPolicyService } from './notificationPolicyService.js';
import { deduplicationEngine } from './deduplicationEngine.js';
import { notificationQueue } from './notificationQueue.js';
import { notificationWorker } from './notificationWorker.js';
import { NotificationRecord, AlertEvent } from './notificationTypes.js';
import { prisma } from '../../config/db.js';

export class AlertProcessor {
  async processRiskAssessment(assessment: RiskAssessmentResult): Promise<{
    alertCreated: boolean;
    alert?: AlertEvent;
    queuedCount: number;
    skippedCount: number;
  }> {
    const decision = await alertDecisionService.evaluateRiskAssessment(assessment);

    if (decision.decision === 'NO_ALERT' || !decision.alert) {
      return { alertCreated: false, queuedCount: 0, skippedCount: 0 };
    }

    const alert = decision.alert;
    if (decision.decision === 'CREATE_ALERT') {
      notificationQueue.incrementAlertsCreated();
    } else if (decision.decision === 'EXPIRE_ALERT') {
      notificationQueue.incrementAlertsExpired();
      return { alertCreated: false, alert, queuedCount: 0, skippedCount: 0 };
    }

    // 1. Retrieve all active user subscriptions
    const subscriptions = await subscriptionService.getAllActiveSubscriptions();

    // Default global broadcast subscription for anonymous in-app user if none exist
    if (subscriptions.length === 0) {
      subscriptions.push({
        subscriptionId: 'sub-default-inapp',
        userId: 'ANONYMOUS',
        channel: 'IN_APP',
        endpoint: 'inapp-default',
        hazardPreferences: ['HEAVY_RAIN', 'THUNDERSTORM', 'STRONG_WIND', 'EXTREME_RAINFALL', 'SEVERE_WEATHER'],
        minimumRiskLevel: 'HIGH',
        quietHoursEnabled: false,
        bypassQuietHoursForSevere: true,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    let queuedCount = 0;
    let skippedCount = 0;
    const subMap = new Map<string, typeof subscriptions[0]>();

    for (const sub of subscriptions) {
      subMap.set(sub.subscriptionId, sub);

      // 2. Evaluate Policy
      const policyDecision = notificationPolicyService.evaluatePolicy(alert, sub);
      if (!policyDecision.shouldSend) {
        notificationQueue.updateMetrics('SKIPPED');
        skippedCount++;
        continue;
      }

      // 3. Deduplication Check
      const dedupKey = deduplicationEngine.generateKey(
        alert.alertId,
        sub.subscriptionId,
        alert.riskLevel,
        sub.channel
      );

      if (deduplicationEngine.isDuplicate(dedupKey)) {
        notificationQueue.updateMetrics('SKIPPED');
        skippedCount++;
        continue;
      }

      // 4. Create Notification Record
      const notificationId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const nowIso = new Date().toISOString();

      const notification: NotificationRecord = {
        notificationId,
        alertId: alert.alertId,
        subscriptionId: sub.subscriptionId,
        userId: sub.userId,
        channel: sub.channel,
        title: alert.title,
        body: alert.description,
        hazardType: alert.hazardType,
        riskLevel: alert.riskLevel,
        gridId: alert.gridId,
        origin: alert.origin,
        status: 'QUEUED',
        retryCount: 0,
        maxRetries: 3,
        deduplicationKey: dedupKey,
        disclaimer: 'AI/Model-based assessment — Not an official weather warning.',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      deduplicationEngine.recordKey(dedupKey);
      notificationQueue.enqueue(notification);
      queuedCount++;
    }

    // 5. Trigger async worker in background
    notificationWorker.processQueue(subMap).catch(() => {});

    // 6. Record Audit Log
    this.recordAuditLog(
      'ALERT_DECISION_EXECUTED',
      `Alert ${alert.alertId} processed with ${queuedCount} notifications queued and ${skippedCount} skipped.`,
      alert.alertId
    ).catch(() => {});

    return {
      alertCreated: true,
      alert,
      queuedCount,
      skippedCount,
    };
  }

  private async recordAuditLog(event: string, reason: string, relatedId?: string): Promise<void> {
    try {
      await prisma.notificationAuditLogRecord.create({
        data: {
          id: `audit-${Date.now().toString(36)}`,
          timestamp: new Date(),
          actor: 'ALERT_PROCESSOR',
          event,
          reason,
          relatedId,
        },
      });
    } catch {
      // Resilient DB catch
    }
  }
}

export const alertProcessor = new AlertProcessor();
