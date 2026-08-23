import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SystemStatusResponse } from '@shared/types/index.js';

interface SystemStatusContextType {
  status: SystemStatusResponse | null;
  isLoading: boolean;
  isLive: boolean;
  lastPingTime: Date | null;
  latencyMs: number;
  refreshStatus: () => Promise<void>;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

const DEFAULT_FALLBACK_STATUS: SystemStatusResponse = {
  platform: 'ERROR 404 — Severe Weather Nowcasting Platform',
  version: '1.0.0-phase1',
  environment: 'development',
  timestamp: new Date().toISOString(),
  overallStatus: 'OPERATIONAL',
  services: {
    apiGateway: {
      status: 'OPERATIONAL',
      latencyMs: 1,
      uptimeSeconds: 3600,
      lastSyncAt: new Date().toISOString(),
    },
    database: {
      status: 'STANDBY',
      latencyMs: 0,
      uptimeSeconds: 0,
      lastSyncAt: null,
      details: { engine: 'PostgreSQL + Prisma ORM Ready' },
    },
    mlEngine: {
      status: 'STANDBY',
      latencyMs: 0,
      uptimeSeconds: 0,
      lastSyncAt: null,
      details: { mode: 'Awaiting trained nowcasting model weights' },
    },
    radarIngest: {
      status: 'AWAITING_FEED',
      latencyMs: 0,
      uptimeSeconds: 0,
      lastSyncAt: null,
      details: { sources: ['IMD DWR Network', 'MOSDAC Satellite IR'] },
    },
    alertDispatch: {
      status: 'OPERATIONAL',
      latencyMs: 1,
      uptimeSeconds: 3600,
      lastSyncAt: new Date().toISOString(),
      details: { protocol: 'CAP v1.2 Gateway' },
    },
  },
  metrics: {
    activeConnections: 1,
    memoryUsageMb: 42.5,
    cpuLoadPercent: 0.8,
  },
};

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SystemStatusResponse>(DEFAULT_FALLBACK_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);

  const fetchStatus = useCallback(async () => {
    const startTime = performance.now();
    try {
      setIsLoading(true);
      const res = await fetch('/api/system/status');
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStatus(json.data);
          setIsLive(true);
          setLastPingTime(new Date());
          return;
        }
      }
      // If backend responded with non-200 or unexpected structure
      setIsLive(false);
    } catch {
      setIsLive(false);
      setLatencyMs(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15s heartbeat
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <SystemStatusContext.Provider
      value={{
        status,
        isLoading,
        isLive,
        lastPingTime,
        latencyMs,
        refreshStatus: fetchStatus,
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
}
