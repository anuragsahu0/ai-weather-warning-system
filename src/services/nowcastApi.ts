import {
  MLPredictionResult,
  ModelCard,
  PredictionTaskType,
  SpatioTemporalPredictionResult,
  ModelBenchmarkComparison,
} from '@shared/types/index.js';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchSpatioTemporalNowcast(
  gridId?: string,
  lat?: number,
  lon?: number,
  horizon = 30
): Promise<SpatioTemporalPredictionResult> {
  const params = new URLSearchParams();
  if (gridId) params.set('gridId', gridId);
  if (lat !== undefined) params.set('lat', lat.toString());
  if (lon !== undefined) params.set('lon', lon.toString());
  params.set('horizon', horizon.toString());

  const response = await fetch(`/api/nowcast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Spatio-Temporal nowcast (${response.status})`);
  }
  const json: ApiResponse<SpatioTemporalPredictionResult> = await response.json();
  return json.data;
}

export async function fetchBaselineNowcast(
  gridId?: string,
  lat?: number,
  lon?: number,
  task: PredictionTaskType = 'HEAVY_RAIN',
  horizon = 30
): Promise<MLPredictionResult> {
  const params = new URLSearchParams();
  if (gridId) params.set('gridId', gridId);
  if (lat !== undefined) params.set('lat', lat.toString());
  if (lon !== undefined) params.set('lon', lon.toString());
  params.set('task', task);
  params.set('horizon', horizon.toString());

  const response = await fetch(`/api/nowcast/baseline?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch baseline prediction (${response.status})`);
  }
  const json: ApiResponse<MLPredictionResult> = await response.json();
  return json.data;
}

export async function fetchBenchmarkComparison(): Promise<ModelBenchmarkComparison> {
  const response = await fetch('/api/nowcast/comparison');
  if (!response.ok) {
    throw new Error(`Failed to fetch model benchmark comparison (${response.status})`);
  }
  const json: ApiResponse<ModelBenchmarkComparison> = await response.json();
  return json.data;
}

export async function fetchMLStatus(): Promise<{
  status: string;
  loadedModelsCount: number;
  availableTasks: string[];
  models: ModelCard[];
}> {
  const response = await fetch('/api/ml/status');
  if (!response.ok) {
    throw new Error(`Failed to fetch ML status (${response.status})`);
  }
  const json: ApiResponse<{
    status: string;
    loadedModelsCount: number;
    availableTasks: string[];
    models: ModelCard[];
  }> = await response.json();
  return json.data;
}

export async function fetchMLEvaluation(): Promise<{ totalModels: number; models: ModelCard[] }> {
  const response = await fetch('/api/ml/evaluation');
  if (!response.ok) {
    throw new Error(`Failed to fetch ML evaluation (${response.status})`);
  }
  const json: ApiResponse<{ totalModels: number; models: ModelCard[] }> = await response.json();
  return json.data;
}
