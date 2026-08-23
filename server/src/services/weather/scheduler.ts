import { weatherIngestionService } from './weatherIngestionService.js';
import { config } from '../../config/index.js';

export const MONITORED_SECTORS = [
  { id: 'loc-delhi-ncr', name: 'Delhi NCR', lat: 28.6139, lon: 77.209 },
  { id: 'loc-mumbai-mmr', name: 'Mumbai MMR', lat: 18.922, lon: 72.8347 },
  { id: 'loc-dehradun-val', name: 'Dehradun Valley', lat: 30.3165, lon: 78.0322 },
  { id: 'loc-kolkata-cyclone', name: 'Kolkata Gangetic', lat: 22.5726, lon: 88.3639 },
  { id: 'loc-bengaluru-tech', name: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946 },
];

export class IngestionScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isIngesting = false;
  private intervalMs: number;

  constructor(intervalSeconds = config.WEATHER_REFRESH_INTERVAL_SECONDS) {
    this.intervalMs = intervalSeconds * 1000;
  }

  start(): void {
    if (this.timer) return;

    console.log(`[IngestionScheduler] Initialized background weather ingestion (Interval: ${this.intervalMs / 1000}s)`);

    // Immediate initial sync
    this.runIngestionCycle();

    // Schedule recurring timer
    this.timer = setInterval(() => {
      this.runIngestionCycle();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[IngestionScheduler] Stopped scheduled weather ingestion worker.');
    }
  }

  async runIngestionCycle(): Promise<void> {
    if (this.isIngesting) {
      console.log('[IngestionScheduler] Previous ingestion cycle in progress. Skipping overlapping run.');
      return;
    }

    this.isIngesting = true;
    console.log(`[IngestionScheduler] Starting ingestion cycle for ${MONITORED_SECTORS.length} meteorological sectors...`);

    for (const sector of MONITORED_SECTORS) {
      try {
        await weatherIngestionService.ingestCoordinates(sector.lat, sector.lon, sector.id);
      } catch (err: unknown) {
        console.error(`[IngestionScheduler] Error ingesting sector ${sector.name}:`, (err as Error)?.message);
      }
    }

    this.isIngesting = false;
    console.log('[IngestionScheduler] Finished weather ingestion cycle.');
  }
}

export const ingestionScheduler = new IngestionScheduler();
