import {
  NotificationRecord,
  UserSubscription,
  AlertEvent,
  NotificationMetrics,
  HazardType,
  RiskLevel,
  NotificationChannel,
} from '@shared/types/index.js';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchNotifications(
  userId = 'ANONYMOUS',
  status?: string,
  channel?: string,
  limit = 20
): Promise<{ total: number; notifications: NotificationRecord[] }> {
  const params = new URLSearchParams();
  params.set('userId', userId);
  if (status) params.set('status', status);
  if (channel) params.set('channel', channel);
  params.set('limit', limit.toString());

  const res = await fetch(`/api/notifications?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications (${res.status})`);
  }
  const json: ApiResponse<{ total: number; notifications: NotificationRecord[] }> =
    await res.json();
  return json.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    throw new Error(`Failed to mark notification as read (${res.status})`);
  }
}

export async function markAllNotificationsRead(userId = 'ANONYMOUS'): Promise<number> {
  const res = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to mark all as read (${res.status})`);
  }
  const json: ApiResponse<{ updatedCount: number }> = await res.json();
  return json.data.updatedCount;
}

export async function fetchNotificationMetrics(): Promise<NotificationMetrics> {
  const res = await fetch('/api/notifications/metrics');
  if (!res.ok) {
    throw new Error(`Failed to fetch notification metrics (${res.status})`);
  }
  const json: ApiResponse<NotificationMetrics> = await res.json();
  return json.data;
}

export async function fetchSubscriptions(
  userId = 'ANONYMOUS'
): Promise<{ total: number; subscriptions: UserSubscription[] }> {
  const params = new URLSearchParams();
  params.set('userId', userId);

  const res = await fetch(`/api/subscriptions?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch subscriptions (${res.status})`);
  }
  const json: ApiResponse<{ total: number; subscriptions: UserSubscription[] }> =
    await res.json();
  return json.data;
}

export async function createSubscription(payload: {
  userId: string;
  userName?: string;
  channel: NotificationChannel;
  endpoint: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  gridId?: string | null;
  hazardPreferences: HazardType[];
  minimumRiskLevel: RiskLevel;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  bypassQuietHoursForSevere: boolean;
  enabled: boolean;
}): Promise<UserSubscription> {
  const res = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create subscription (${res.status})`);
  }
  const json: ApiResponse<UserSubscription> = await res.json();
  return json.data;
}

export async function deleteSubscription(id: string, userId = 'ANONYMOUS'): Promise<void> {
  const res = await fetch(`/api/subscriptions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete subscription (${res.status})`);
  }
}

export async function fetchAlerts(
  status?: string,
  hazard?: string,
  gridId?: string
): Promise<{ total: number; alerts: AlertEvent[] }> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (hazard) params.set('hazard', hazard);
  if (gridId) params.set('gridId', gridId);

  const res = await fetch(`/api/alerts?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch alert events (${res.status})`);
  }
  const json: ApiResponse<{ total: number; alerts: AlertEvent[] }> = await res.json();
  return json.data;
}

export async function fetchAlertById(id: string): Promise<AlertEvent> {
  const res = await fetch(`/api/alerts/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch alert detail (${res.status})`);
  }
  const json: ApiResponse<AlertEvent> = await res.json();
  return json.data;
}

export async function triggerAlertEvaluation(
  lat?: number,
  lon?: number,
  hazard = 'HEAVY_RAIN',
  horizon = 30
): Promise<any> {
  const res = await fetch('/api/alerts/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, hazard, horizon }),
  });
  if (!res.ok) {
    throw new Error(`Failed to evaluate alert state (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}
