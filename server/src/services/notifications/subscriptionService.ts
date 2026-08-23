import { UserSubscription, HazardType, RiskLevel, NotificationChannel } from './notificationTypes.js';
import { prisma } from '../../config/db.js';

export interface CreateSubscriptionInput {
  userId: string;
  userName?: string;
  channel?: NotificationChannel;
  endpoint: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  gridId?: string | null;
  hazardPreferences?: HazardType[];
  minimumRiskLevel?: RiskLevel;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  bypassQuietHoursForSevere?: boolean;
  enabled?: boolean;
}

export class SubscriptionService {
  private inMemorySubscriptions = new Map<string, UserSubscription>();

  async createSubscription(input: CreateSubscriptionInput): Promise<UserSubscription> {
    const nowIso = new Date().toISOString();
    const subscriptionId = `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const sub: UserSubscription = {
      subscriptionId,
      userId: input.userId,
      userName: input.userName,
      channel: input.channel || 'IN_APP',
      endpoint: input.endpoint,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      radiusKm: input.radiusKm ?? 5.0,
      gridId: input.gridId ?? null,
      hazardPreferences: input.hazardPreferences || ['HEAVY_RAIN', 'THUNDERSTORM'],
      minimumRiskLevel: input.minimumRiskLevel || 'HIGH',
      quietHoursEnabled: input.quietHoursEnabled || false,
      quietHoursStart: input.quietHoursStart ?? null,
      quietHoursEnd: input.quietHoursEnd ?? null,
      bypassQuietHoursForSevere: input.bypassQuietHoursForSevere ?? true,
      enabled: input.enabled ?? true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.inMemorySubscriptions.set(sub.subscriptionId, sub);
    this.persistSubscriptionToDb(sub).catch(() => {});

    return sub;
  }

  async getSubscriptionsByUser(userId: string): Promise<UserSubscription[]> {
    const memSubs = Array.from(this.inMemorySubscriptions.values()).filter(
      (s) => s.userId === userId
    );
    if (memSubs.length > 0) return memSubs;

    try {
      const records = await prisma.userSubscriptionRecord.findMany({
        where: { userId },
      });
      return records.map((r) => this.mapRecordToSubscription(r));
    } catch {
      return [];
    }
  }

  async getAllActiveSubscriptions(): Promise<UserSubscription[]> {
    const memSubs = Array.from(this.inMemorySubscriptions.values()).filter((s) => s.enabled);
    if (memSubs.length > 0) return memSubs;

    try {
      const records = await prisma.userSubscriptionRecord.findMany({
        where: { enabled: true },
      });
      return records.map((r) => this.mapRecordToSubscription(r));
    } catch {
      return [];
    }
  }

  async updateSubscription(
    subscriptionId: string,
    userId: string,
    updates: Partial<CreateSubscriptionInput>
  ): Promise<UserSubscription | null> {
    const existing = this.inMemorySubscriptions.get(subscriptionId);
    if (existing && existing.userId === userId) {
      const updated: UserSubscription = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.inMemorySubscriptions.set(subscriptionId, updated);
      this.persistSubscriptionToDb(updated).catch(() => {});
      return updated;
    }

    try {
      const rec = await prisma.userSubscriptionRecord.findUnique({
        where: { subscriptionId },
      });
      if (!rec || rec.userId !== userId) return null;

      const updated = await prisma.userSubscriptionRecord.update({
        where: { subscriptionId },
        data: {
          ...(updates.channel ? { channel: updates.channel } : {}),
          ...(updates.endpoint ? { endpoint: updates.endpoint } : {}),
          ...(updates.latitude !== undefined ? { latitude: updates.latitude } : {}),
          ...(updates.longitude !== undefined ? { longitude: updates.longitude } : {}),
          ...(updates.radiusKm !== undefined ? { radiusKm: updates.radiusKm } : {}),
          ...(updates.gridId !== undefined ? { gridId: updates.gridId } : {}),
          ...(updates.hazardPreferences ? { hazardPreferencesJson: updates.hazardPreferences as object } : {}),
          ...(updates.minimumRiskLevel ? { minimumRiskLevel: updates.minimumRiskLevel } : {}),
          ...(updates.quietHoursEnabled !== undefined ? { quietHoursEnabled: updates.quietHoursEnabled } : {}),
          ...(updates.quietHoursStart !== undefined ? { quietHoursStart: updates.quietHoursStart } : {}),
          ...(updates.quietHoursEnd !== undefined ? { quietHoursEnd: updates.quietHoursEnd } : {}),
          ...(updates.bypassQuietHoursForSevere !== undefined ? { bypassQuietHoursForSevere: updates.bypassQuietHoursForSevere } : {}),
          ...(updates.enabled !== undefined ? { enabled: updates.enabled } : {}),
        },
      });

      return this.mapRecordToSubscription(updated);
    } catch {
      return null;
    }
  }

  async deleteSubscription(subscriptionId: string, userId: string): Promise<boolean> {
    const existing = this.inMemorySubscriptions.get(subscriptionId);
    if (existing && existing.userId === userId) {
      this.inMemorySubscriptions.delete(subscriptionId);
    }

    try {
      const rec = await prisma.userSubscriptionRecord.findUnique({
        where: { subscriptionId },
      });
      if (!rec || rec.userId !== userId) return false;

      await prisma.userSubscriptionRecord.delete({
        where: { subscriptionId },
      });
      return true;
    } catch {
      return true;
    }
  }

  private mapRecordToSubscription(r: any): UserSubscription {
    return {
      subscriptionId: r.subscriptionId,
      userId: r.userId,
      userName: r.userName || undefined,
      channel: r.channel as NotificationChannel,
      endpoint: r.endpoint,
      latitude: r.latitude,
      longitude: r.longitude,
      radiusKm: r.radiusKm,
      gridId: r.gridId,
      hazardPreferences: (r.hazardPreferencesJson as HazardType[]) || ['HEAVY_RAIN'],
      minimumRiskLevel: r.minimumRiskLevel as RiskLevel,
      quietHoursEnabled: r.quietHoursEnabled,
      quietHoursStart: r.quietHoursStart,
      quietHoursEnd: r.quietHoursEnd,
      bypassQuietHoursForSevere: r.bypassQuietHoursForSevere,
      enabled: r.enabled,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private async persistSubscriptionToDb(s: UserSubscription): Promise<void> {
    try {
      await prisma.userSubscriptionRecord.upsert({
        where: { subscriptionId: s.subscriptionId },
        update: {
          channel: s.channel,
          endpoint: s.endpoint,
          latitude: s.latitude,
          longitude: s.longitude,
          radiusKm: s.radiusKm,
          gridId: s.gridId,
          hazardPreferencesJson: s.hazardPreferences as object,
          minimumRiskLevel: s.minimumRiskLevel,
          quietHoursEnabled: s.quietHoursEnabled,
          quietHoursStart: s.quietHoursStart,
          quietHoursEnd: s.quietHoursEnd,
          bypassQuietHoursForSevere: s.bypassQuietHoursForSevere,
          enabled: s.enabled,
          updatedAt: new Date(s.updatedAt),
        },
        create: {
          subscriptionId: s.subscriptionId,
          userId: s.userId,
          userName: s.userName,
          channel: s.channel,
          endpoint: s.endpoint,
          latitude: s.latitude,
          longitude: s.longitude,
          radiusKm: s.radiusKm,
          gridId: s.gridId,
          hazardPreferencesJson: s.hazardPreferences as object,
          minimumRiskLevel: s.minimumRiskLevel,
          quietHoursEnabled: s.quietHoursEnabled,
          quietHoursStart: s.quietHoursStart,
          quietHoursEnd: s.quietHoursEnd,
          bypassQuietHoursForSevere: s.bypassQuietHoursForSevere,
          enabled: s.enabled,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        },
      });
    } catch {
      // Resilient DB catch
    }
  }
}

export const subscriptionService = new SubscriptionService();
