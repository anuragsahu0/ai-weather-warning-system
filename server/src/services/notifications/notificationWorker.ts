import { notificationQueue } from './notificationQueue.js';
import { inAppNotificationProvider } from './providers/inAppProvider.js';
import { webPushNotificationProvider } from './providers/webPushProvider.js';
import { emailNotificationProvider } from './providers/emailProvider.js';
import { UserSubscription, NotificationDeliveryReceipt } from './notificationTypes.js';
import { prisma } from '../../config/db.js';

export class NotificationWorker {
  private isProcessing = false;

  async processQueue(subscriptionMap?: Map<string, UserSubscription>): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;
    let processedCount = 0;

    try {
      while (notificationQueue.getQueueDepth() > 0) {
        const item = notificationQueue.dequeue();
        if (!item) break;

        // Skip if scheduled for future retry attempt
        if (item.nextAttemptAt && new Date(item.nextAttemptAt).getTime() > Date.now()) {
          // Put back in queue for later
          notificationQueue.enqueue(item);
          break;
        }

        item.status = 'PROCESSING';
        const dummySub: UserSubscription = {
          subscriptionId: item.subscriptionId,
          userId: item.userId,
          channel: item.channel,
          endpoint: 'default',
          hazardPreferences: [item.hazardType],
          minimumRiskLevel: item.riskLevel,
          quietHoursEnabled: false,
          bypassQuietHoursForSevere: true,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const sub = subscriptionMap?.get(item.subscriptionId) || dummySub;

        // Select channel provider
        let result: { success: boolean; providerStatus: string; providerMessageId?: string; latencyMs: number; error?: string };

        if (item.channel === 'IN_APP') {
          result = await inAppNotificationProvider.send(item, sub);
        } else if (item.channel === 'WEB_PUSH') {
          result = await webPushNotificationProvider.send(item, sub);
        } else {
          result = await emailNotificationProvider.send(item, sub);
        }

        const nowIso = new Date().toISOString();

        if (result.success) {
          item.status = result.providerStatus === 'DELIVERED' ? 'DELIVERED' : 'SENT';
          item.deliveredAt = nowIso;
          item.updatedAt = nowIso;
          notificationQueue.updateMetrics(result.providerStatus === 'DELIVERED' ? 'DELIVERED' : 'SENT');

          const receipt: NotificationDeliveryReceipt = {
            receiptId: `rcp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            notificationId: item.notificationId,
            channel: item.channel,
            providerStatus: result.providerStatus,
            providerMessageId: result.providerMessageId,
            attemptNumber: item.retryCount + 1,
            latencyMs: result.latencyMs,
            timestamp: nowIso,
          };

          this.persistReceiptAndNotification(item, receipt).catch(() => {});
        } else {
          item.retryCount++;
          item.failureReason = result.error || 'Delivery attempt failed';

          if (item.retryCount >= item.maxRetries) {
            notificationQueue.moveToDeadLetter(
              item,
              `Exceeded max retries (${item.maxRetries}). Last error: ${item.failureReason}`
            );
          } else {
            // Exponential backoff: 2^retry * 1000ms
            const delayMs = Math.pow(2, item.retryCount) * 1000;
            item.status = 'QUEUED';
            item.nextAttemptAt = new Date(Date.now() + delayMs).toISOString();
            notificationQueue.enqueue(item);
          }
        }

        processedCount++;
      }
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }

  private async persistReceiptAndNotification(
    n: any,
    r: NotificationDeliveryReceipt
  ): Promise<void> {
    try {
      await prisma.notificationRecord.upsert({
        where: { notificationId: n.notificationId },
        update: {
          status: n.status,
          deliveredAt: n.deliveredAt ? new Date(n.deliveredAt) : null,
          readAt: n.readAt ? new Date(n.readAt) : null,
          failureReason: n.failureReason,
          retryCount: n.retryCount,
          updatedAt: new Date(n.updatedAt),
        },
        create: {
          notificationId: n.notificationId,
          alertId: n.alertId,
          subscriptionId: n.subscriptionId,
          userId: n.userId,
          channel: n.channel,
          title: n.title,
          body: n.body,
          hazardType: n.hazardType,
          riskLevel: n.riskLevel,
          gridId: n.gridId,
          origin: n.origin,
          status: n.status,
          skipReason: n.skipReason,
          retryCount: n.retryCount,
          maxRetries: n.maxRetries,
          deliveredAt: n.deliveredAt ? new Date(n.deliveredAt) : null,
          deduplicationKey: n.deduplicationKey,
          disclaimer: n.disclaimer,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
        },
      });

      await prisma.notificationDeliveryRecord.create({
        data: {
          receiptId: r.receiptId,
          notificationId: r.notificationId,
          channel: r.channel,
          providerStatus: r.providerStatus,
          providerMessageId: r.providerMessageId,
          attemptNumber: r.attemptNumber,
          latencyMs: r.latencyMs,
          timestamp: new Date(r.timestamp),
        },
      });
    } catch {
      // Resilient DB catch
    }
  }
}

export const notificationWorker = new NotificationWorker();
