import {
  RiskAssessmentResult,
  RiskHotspotCluster,
  RiskOverviewSummary,
  HazardType,
} from '@shared/types/index.js';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchRiskAssessment(
  hazard: HazardType = 'HEAVY_RAIN',
  horizon = 30,
  lat?: number,
  lon?: number,
  gridId?: string
): Promise<RiskAssessmentResult> {
  const params = new URLSearchParams();
  params.set('hazard', hazard);
  params.set('horizon', horizon.toString());
  if (lat !== undefined) params.set('lat', lat.toString());
  if (lon !== undefined) params.set('lon', lon.toString());
  if (gridId) params.set('gridId', gridId);

  const res = await fetch(`/api/risk?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch risk assessment (${res.status})`);
  }
  const json: ApiResponse<RiskAssessmentResult> = await res.json();
  return json.data;
}

export async function fetchRiskHotspots(
  hazard: HazardType = 'HEAVY_RAIN',
  horizon = 30
): Promise<RiskHotspotCluster[]> {
  const params = new URLSearchParams();
  params.set('hazard', hazard);
  params.set('horizon', horizon.toString());

  const res = await fetch(`/api/risk/hotspots?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch risk hotspots (${res.status})`);
  }
  const json: ApiResponse<{ activeHotspots: RiskHotspotCluster[]; total: number }> =
    await res.json();
  return json.data.activeHotspots;
}

export async function fetchRiskOverview(): Promise<RiskOverviewSummary> {
  const res = await fetch('/api/risk/overview');
  if (!res.ok) {
    throw new Error(`Failed to fetch risk overview (${res.status})`);
  }
  const json: ApiResponse<RiskOverviewSummary> = await res.json();
  return json.data;
}
