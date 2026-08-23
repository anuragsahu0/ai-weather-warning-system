export interface SubsystemHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  latencyMs: number;
  lastSuccessfulOperation: string;
  errorCount: number;
  details?: Record<string, any>;
}

export interface SystemHealthReport {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: SubsystemHealth;
    weatherIngestion: SubsystemHealth;
    fusionEngine: SubsystemHealth;
    nowcastingEngine: SubsystemHealth;
    riskEngine: SubsystemHealth;
    notificationWorker: SubsystemHealth;
    cache: SubsystemHealth;
  };
}

export interface DataFeedQuality {
  sourceType: string;
  sourceName: string;
  attribution: string;
  coverage: string;
  freshnessStatus: 'FRESH' | 'AGING' | 'STALE' | 'UNAVAILABLE';
  dataAgeSeconds: number;
  expectedIntervalSeconds: number;
  lastSuccessfulFetch: string;
  totalRecordsProcessed: number;
  validRecordsCount: number;
  invalidBoundsCount: number;
  duplicateCount: number;
}

export interface DataQualityReport {
  timestamp: string;
  overallDataHealth: 'HEALTHY' | 'DEGRADED' | 'STALE';
  freshFeedsCount: number;
  totalFeedsCount: number;
  feeds: DataFeedQuality[];
}

export interface ModelMetricsData {
  specs: {
    baseline: any;
    advanced: any;
  };
  comparison: Array<{
    metricName: string;
    baselineValue: number;
    advancedValue: number;
    unit: string;
    relativeImprovementPct: number;
    betterDirection: 'LOWER' | 'HIGHER';
  }>;
  horizonPerf: Array<{
    horizonMinutes: number;
    horizonLabel: string;
    maeMmPerHour: number;
    rmseMmPerHour: number;
    f1Score: number;
    brierScore: number;
    sampleCount: number;
  }>;
  sourceAblation: Array<{
    configuration: string;
    includedSources: string[];
    maeMmPerHour: number;
    f1Score: number;
    relativeGainPct: number;
  }>;
  drift: Array<{
    featureName: string;
    psiScore: number;
    status: 'NORMAL' | 'WARNING' | 'DRIFT_DETECTED';
    pValue: number;
  }>;
}

export async function fetchSystemHealth(): Promise<SystemHealthReport> {
  const res = await fetch('/api/system/health');
  if (!res.ok) {
    throw new Error(`Failed to fetch system health (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchDataQuality(): Promise<DataQualityReport> {
  const res = await fetch('/api/system/data-quality');
  if (!res.ok) {
    throw new Error(`Failed to fetch data quality report (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchModelMetrics(): Promise<ModelMetricsData> {
  const res = await fetch('/api/system/model-metrics');
  if (!res.ok) {
    throw new Error(`Failed to fetch model metrics (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}
