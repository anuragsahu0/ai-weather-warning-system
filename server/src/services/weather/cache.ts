import { NormalizedWeatherData } from './types.js';

interface CacheEntry {
  data: NormalizedWeatherData;
  expiresAt: number;
}

export class WeatherCache {
  private store = new Map<string, CacheEntry>();
  private defaultTtlMs: number;

  constructor(defaultTtlSeconds = 300) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  private makeKey(latitude: number, longitude: number): string {
    // Spatial grid binning (~1km resolution)
    const latBin = latitude.toFixed(2);
    const lonBin = longitude.toFixed(2);
    return `weather_grid_${latBin}_${lonBin}`;
  }

  get(latitude: number, longitude: number): NormalizedWeatherData | null {
    const key = this.makeKey(latitude, longitude);
    const entry = this.store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(latitude: number, longitude: number, data: NormalizedWeatherData, ttlSeconds?: number): void {
    const key = this.makeKey(latitude, longitude);
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(latitude: number, longitude: number): boolean {
    return this.get(latitude, longitude) !== null;
  }

  size(): number {
    this.cleanExpired();
    return this.store.size;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const weatherCache = new WeatherCache();
