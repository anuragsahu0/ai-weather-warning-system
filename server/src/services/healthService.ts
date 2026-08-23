import { checkDatabaseConnection } from '../config/db.js';
import { config } from '../config/index.js';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  dependencies: {
    database: {
      status: 'connected' | 'disconnected';
      latencyMs: number;
      error?: string;
    };
    mlService: {
      status: 'reachable' | 'unreachable' | 'standby';
      url: string;
    };
  };
}

export class HealthService {
  async getHealth(): Promise<HealthCheckResult> {
    const memory = process.memoryUsage();
    const dbCheck = await checkDatabaseConnection();

    let mlStatus: 'reachable' | 'unreachable' | 'standby' = 'standby';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${config.ML_SERVICE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        mlStatus = 'reachable';
      }
    } catch {
      mlStatus = 'standby'; // Standby in Phase 1
    }

    const overallStatus: 'ok' | 'degraded' | 'error' = 'ok';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.NODE_ENV,
      version: '1.0.0-phase1',
      memoryUsageMb: {
        rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
      dependencies: {
        database: {
          status: dbCheck.isConnected ? 'connected' : 'disconnected',
          latencyMs: dbCheck.latencyMs,
          error: dbCheck.error,
        },
        mlService: {
          status: mlStatus,
          url: config.ML_SERVICE_URL,
        },
      },
    };
  }
}

export const healthService = new HealthService();
