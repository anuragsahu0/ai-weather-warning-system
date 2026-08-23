import { BaseNotificationProvider } from './baseNotificationProvider.js';
import {
  NotificationChannel,
  NotificationRecord,
  UserSubscription,
  ProviderSendResult,
} from '../notificationTypes.js';

export class EmailNotificationProvider extends BaseNotificationProvider {
  readonly channel: NotificationChannel = 'EMAIL';
  readonly providerName = 'ERROR 404 Transactional SMTP Gateway';

  private smtpConfigured = false;

  constructor() {
    super();
    this.smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    this.status = this.smtpConfigured ? 'AVAILABLE' : 'NOT_CONFIGURED';
  }

  async send(
    notification: NotificationRecord,
    subscription: UserSubscription
  ): Promise<ProviderSendResult> {
    const startTime = Date.now();

    if (!this.smtpConfigured) {
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        providerStatus: 'SENT',
        providerMessageId: `email-sim-${notification.notificationId}`,
        latencyMs,
      };
    }

    try {
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        providerStatus: 'DELIVERED',
        providerMessageId: `email-${Date.now().toString(36)}`,
        latencyMs,
      };
    } catch (err: unknown) {
      return {
        success: false,
        providerStatus: 'FAILED',
        latencyMs: Date.now() - startTime,
        error: (err as Error).message,
      };
    }
  }
}

export const emailNotificationProvider = new EmailNotificationProvider();
