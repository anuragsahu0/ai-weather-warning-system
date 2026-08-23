import { BaseNotificationProvider } from './baseNotificationProvider.js';
import {
  NotificationChannel,
  NotificationRecord,
  UserSubscription,
  ProviderSendResult,
} from '../notificationTypes.js';

export class InAppNotificationProvider extends BaseNotificationProvider {
  readonly channel: NotificationChannel = 'IN_APP';
  readonly providerName = 'ERROR 404 In-App Message Center';

  constructor() {
    super();
    this.status = 'AVAILABLE';
  }

  async send(
    notification: NotificationRecord,
    _subscription: UserSubscription
  ): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      // In-app notifications are stored directly and immediately available to the user's notification drawer
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        providerStatus: 'DELIVERED',
        providerMessageId: `inapp-${notification.notificationId}`,
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

export const inAppNotificationProvider = new InAppNotificationProvider();
