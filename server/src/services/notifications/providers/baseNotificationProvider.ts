import {
  NotificationChannel,
  NotificationRecord,
  UserSubscription,
  ProviderSendResult,
} from '../notificationTypes.js';

export abstract class BaseNotificationProvider {
  abstract readonly channel: NotificationChannel;
  abstract readonly providerName: string;

  protected status: 'AVAILABLE' | 'NOT_CONFIGURED' | 'DISABLED' | 'FAILED' = 'AVAILABLE';

  getStatus(): 'AVAILABLE' | 'NOT_CONFIGURED' | 'DISABLED' | 'FAILED' {
    return this.status;
  }

  abstract send(
    notification: NotificationRecord,
    subscription: UserSubscription
  ): Promise<ProviderSendResult>;
}
