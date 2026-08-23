import {
  FusedGridWeatherState,
  SpatioTemporalPredictionResult,
  RiskAssessmentResult,
  RiskHotspotCluster,
  AlertEvent,
  NotificationRecord,
} from '../../shared/types/index.js';

export interface ReplayScenarioMetadata {
  scenarioId: string;
  name: string;
  description: string;
  source: string;
  dataPeriod: string;
  geographicArea: string;
  gridId: string;
  hazardType: string;
  dataType: 'HISTORICAL_REANALYSIS_REPLAY' | 'SYNTHETIC_TEST_DATA';
  createdAt: string;
  totalSteps: number;
}

export interface ReplayTimeStepFrame {
  stepIndex: number;
  timeOffsetLabel: 'T+00' | 'T+10' | 'T+20' | 'T+30';
  timestamp: string;
  weatherRecordId: string;
  weatherState: FusedGridWeatherState;
  nowcast: SpatioTemporalPredictionResult;
  riskAssessment: RiskAssessmentResult;
  hotspots: RiskHotspotCluster[];
  alert?: AlertEvent;
  notifications: NotificationRecord[];
}

export interface ReplayActiveState {
  activeScenarioId: string;
  activeStepIndex: number;
  playbackState: 'STOPPED' | 'PLAYING' | 'PAUSED';
  totalSteps: number;
  metadata?: ReplayScenarioMetadata;
  currentFrame: ReplayTimeStepFrame;
}

export interface LineageAuditNode {
  stage: string;
  entityId: string;
  timestamp: string;
  status: string;
  details: Record<string, any>;
}

export interface EndToEndLineageTrace {
  traceId: string;
  scenarioId: string;
  stepIndex: number;
  timeOffsetLabel: string;
  generatedAt: string;
  isTraceValid: boolean;
  nodes: LineageAuditNode[];
  summary: {
    weatherRecordId: string;
    fusedStateId: string;
    predictionId: string;
    riskId: string;
    alertId?: string;
    notificationIds: string[];
  };
}

export interface PreflightDiagnosticResult {
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  timestamp: string;
  systemHealth: string;
  checks: Array<{
    name: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    details: string;
  }>;
}

export const demoApi = {
  getScenarios: async (): Promise<ReplayScenarioMetadata[]> => {
    const res = await fetch('/api/demo/scenarios');
    if (!res.ok) throw new Error(`Failed to fetch demo scenarios (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  getActiveState: async (): Promise<ReplayActiveState> => {
    const res = await fetch('/api/demo/state');
    if (!res.ok) throw new Error(`Failed to fetch demo state (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  stepReplay: async (stepIndex: number, scenarioId?: string): Promise<ReplayActiveState & { frame: ReplayTimeStepFrame }> => {
    const res = await fetch('/api/demo/replay/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex, scenarioId }),
    });
    if (!res.ok) throw new Error(`Failed to step replay (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  resetReplay: async (): Promise<ReplayActiveState & { frame: ReplayTimeStepFrame }> => {
    const res = await fetch('/api/demo/replay/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to reset replay (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  getLineageTrace: async (): Promise<EndToEndLineageTrace> => {
    const res = await fetch('/api/demo/lineage/trace');
    if (!res.ok) throw new Error(`Failed to fetch lineage trace (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  getPreflightDiagnostics: async (): Promise<PreflightDiagnosticResult> => {
    const res = await fetch('/api/demo/preflight');
    if (!res.ok) throw new Error(`Failed to fetch preflight diagnostics (${res.status})`);
    const json = await res.json();
    return json.data;
  },
};
