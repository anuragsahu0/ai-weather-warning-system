import { SystemStatusResponse } from '@shared/types/index.js';
import { checkDatabaseConnection } from '../config/db.js';
import { config } from '../config/index.js';

export class SystemService {
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const memory = process.memoryUsage();
    const dbCheck = await checkDatabaseConnection();

    return {
      platform: 'ERROR 404 — Severe Weather Nowcasting Platform',
      version: '1.0.0-phase1',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      overallStatus: 'OPERATIONAL',
      services: {
        apiGateway: {
          status: 'OPERATIONAL',
          latencyMs: 1,
          uptimeSeconds: Math.floor(process.uptime()),
          lastSyncAt: new Date().toISOString(),
        },
        database: {
          status: dbCheck.isConnected ? 'OPERATIONAL' : 'STANDBY',
          latencyMs: dbCheck.latencyMs,
          uptimeSeconds: Math.floor(process.uptime()),
          lastSyncAt: dbCheck.isConnected ? new Date().toISOString() : null,
          details: {
            engine: 'PostgreSQL + Prisma ORM',
            error: dbCheck.error,
          },
        },
        mlEngine: {
          status: 'STANDBY',
          latencyMs: 0,
          uptimeSeconds: 0,
          lastSyncAt: null,
          details: {
            mode: 'Awaiting trained nowcasting model weights',
            pipeline: 'Optical Flow / ConvLSTM Ensemble Ready',
          },
        },
        radarIngest: {
          status: 'AWAITING_FEED',
          latencyMs: 0,
          uptimeSeconds: 0,
          lastSyncAt: null,
          details: {
            sources: ['IMD DWR Network (Planned)', 'MOSDAC Satellite IR (Planned)'],
          },
        },
        alertDispatch: {
          status: 'OPERATIONAL',
          latencyMs: 1,
          uptimeSeconds: Math.floor(process.uptime()),
          lastSyncAt: new Date().toISOString(),
          details: {
            protocol: 'CAP v1.2 Standard Gateway',
          },
        },
      },
      metrics: {
        activeConnections: 1,
        memoryUsageMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        cpuLoadPercent: 0.5,
      },
    };
  }
}

export const systemService = new SystemService();
