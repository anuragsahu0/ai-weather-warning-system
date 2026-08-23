import { NormalizedWeatherData } from './types.js';

export class DeduplicationService {
  private recentKeys = new Map<string, number>();
  private readonly ttlMs = 15 * 60 * 1000; // Keep keys for 15 minutes

  getObservationKey(data: NormalizedWeatherData): string {
    const latRounded = data.latitude.toFixed(3);
    const lonRounded = data.longitude.toFixed(3);
    return `${data.provider}:${latRounded}:${lonRounded}:${data.observedAt}`;
  }

  isDuplicate(data: NormalizedWeatherData): boolean {
    this.cleanExpiredKeys();
    const key = this.getObservationKey(data);
    return this.recentKeys.has(key);
  }

  recordObservation(data: NormalizedWeatherData): void {
    const key = this.getObservationKey(data);
    this.recentKeys.set(key, Date.now());
  }

  private cleanExpiredKeys(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.recentKeys.entries()) {
      if (now - timestamp > this.ttlMs) {
        this.recentKeys.delete(key);
      }
    }
  }

  clear(): void {
    this.recentKeys.clear();
  }
}

export const deduplicationService = new DeduplicationService();
