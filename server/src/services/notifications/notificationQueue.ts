import {
  NotificationRecord,
  NotificationMetrics,
  NotificationChannel,
} from './notificationTypes.js';
import { inAppNotificationProvider } from './providers/inAppProvider.js';
import { webPushNotificationProvider } from './providers/webPushProvider.js';
import { emailNotificationProvider } from './providers/emailProvider.js';

export class NotificationQueue {
  private queue: NotificationRecord[] = [];
  private deadLetterQueue: NotificationRecord[] = [];
  private notificationHistory = new Map<string, NotificationRecord>();

  // Metrics Counters
  private metricsData = {
    alertsCreated: 0,
    alertsActive: 0,
    alertsExpired: 0,
    notificationsQueued: 0,
    notificationsSent: 0,
    notificationsDelivered: 0,
    notificationsFailed: 0,
    notificationsSkipped: 0,
    deadLetterCount: 0,
  };

  enqueue(item: NotificationRecord): void {
    this.queue.push(item);
    this.notificationHistory.set(item.notificationId, item);
    this.metricsData.notificationsQueued++;
  }

  dequeue(): NotificationRecord | undefined {
    return this.queue.shift();
  }

  peek(): NotificationRecord | undefined {
    return this.queue[0];
  }

  getQueueDepth(): number {
    return this.queue.length;
  }

  moveToDeadLetter(item: NotificationRecord, reason: string): void {
    item.status = 'DEAD_LETTER';
    item.failureReason = reason;
    item.updatedAt = new Date().toISOString();
    this.deadLetterQueue.push(item);
    this.notificationHistory.set(item.notificationId, item);
    this.metricsData.deadLetterCount++;
    this.metricsData.notificationsFailed++;
  }

  getNotificationById(id: string): NotificationRecord | undefined {
    return this.notificationHistory.get(id);
  }

  getNotificationsByUser(userId: string, limit = 20): NotificationRecord[] {
    return Array.from(this.notificationHistory.values())
      .filter((n) => n.userId === userId || n.userId === 'ALL' || n.userId === 'ANONYMOUS')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  markNotificationAsRead(id: string): boolean {
    const n = this.notificationHistory.get(id);
    if (n) {
      n.status = 'READ';
      n.readAt = new Date().toISOString();
      n.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  markAllAsRead(userId: string): number {
    let count = 0;
    const nowIso = new Date().toISOString();
    for (const n of this.notificationHistory.values()) {
      if ((n.userId === userId || n.userId === 'ALL') && n.status !== 'READ') {
        n.status = 'READ';
        n.readAt = nowIso;
        n.updatedAt = nowIso;
        count++;
      }
    }
    return count;
  }

  updateMetrics(type: 'SENT' | 'DELIVERED' | 'FAILED' | 'SKIPPED'): void {
    if (type === 'SENT') this.metricsData.notificationsSent++;
    if (type === 'DELIVERED') this.metricsData.notificationsDelivered++;
    if (type === 'FAILED') this.metricsData.notificationsFailed++;
    if (type === 'SKIPPED') this.metricsData.notificationsSkipped++;
  }

  incrementAlertsCreated(): void {
    this.metricsData.alertsCreated++;
    this.metricsData.alertsActive++;
  }

  incrementAlertsExpired(): void {
    if (this.metricsData.alertsActive > 0) this.metricsData.alertsActive--;
    this.metricsData.alertsExpired++;
  }

  getMetrics(activeSubscriptionsCount = 1): NotificationMetrics {
    const providersStatus: Record<
      NotificationChannel,
      'AVAILABLE' | 'NOT_CONFIGURED' | 'DISABLED' | 'FAILED'
    > = {
      IN_APP: inAppNotificationProvider.getStatus(),
      WEB_PUSH: webPushNotificationProvider.getStatus(),
      EMAIL: emailNotificationProvider.getStatus(),
    };

    return {
      alertsCreated: this.metricsData.alertsCreated,
      alertsActive: this.metricsData.alertsActive,
      alertsExpired: this.metricsData.alertsExpired,
      notificationsQueued: this.metricsData.notificationsQueued,
      notificationsSent: this.metricsData.notificationsSent,
      notificationsDelivered: this.metricsData.notificationsDelivered,
      notificationsFailed: this.metricsData.notificationsFailed,
      notificationsSkipped: this.metricsData.notificationsSkipped,
      deadLetterCount: this.metricsData.deadLetterCount,
      queueDepth: this.queue.length,
      activeSubscriptionsCount,
      providersStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

export const notificationQueue = new NotificationQueue();
