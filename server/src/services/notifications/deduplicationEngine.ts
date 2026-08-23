import { createHash } from 'crypto';
import { NotificationChannel, RiskLevel } from './notificationTypes.js';

export class DeduplicationEngine {
  private dispatchedKeys = new Set<string>();

  generateKey(
    alertId: string,
    subscriptionId: string,
    riskLevel: RiskLevel,
    channel: NotificationChannel
  ): string {
    const raw = `${alertId}_${subscriptionId}_${riskLevel}_${channel}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  isDuplicate(key: string): boolean {
    return this.dispatchedKeys.has(key);
  }

  recordKey(key: string): void {
    this.dispatchedKeys.add(key);
  }

  clear(): void {
    this.dispatchedKeys.clear();
  }
}

export const deduplicationEngine = new DeduplicationEngine();
