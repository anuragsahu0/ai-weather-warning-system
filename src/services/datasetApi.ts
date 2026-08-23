import {
  Dataset,
  DatasetVersion,
  FeatureRecord,
  DatasetQualityReport,
} from '@shared/types/index.js';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const response = await fetch('/api/datasets');
  if (!response.ok) {
    throw new Error(`Failed to fetch datasets (${response.status})`);
  }
  const json: ApiResponse<Dataset[]> = await response.json();
  return json.data;
}

export async function fetchDatasetVersion(
  datasetId: string,
  versionTag: string
): Promise<DatasetVersion> {
  const response = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}/versions/${encodeURIComponent(versionTag)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset version (${response.status})`);
  }
  const json: ApiResponse<DatasetVersion> = await response.json();
  return json.data;
}

export async function fetchFeatures(
  gridId?: string,
  datasetVersion?: string,
  split?: 'TRAIN' | 'VAL' | 'TEST',
  limit = 50
): Promise<{ total: number; features: FeatureRecord[] }> {
  const params = new URLSearchParams();
  if (gridId) params.set('gridId', gridId);
  if (datasetVersion) params.set('datasetVersion', datasetVersion);
  if (split) params.set('split', split);
  params.set('limit', limit.toString());

  const response = await fetch(`/api/datasets/features?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feature records (${response.status})`);
  }
  const json: ApiResponse<{ total: number; features: FeatureRecord[] }> = await response.json();
  return json.data;
}

export async function fetchQualityReport(versionId?: string): Promise<DatasetQualityReport> {
  const params = new URLSearchParams();
  if (versionId) params.set('versionId', versionId);

  const response = await fetch(`/api/datasets/quality-report?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quality report (${response.status})`);
  }
  const json: ApiResponse<DatasetQualityReport> = await response.json();
  return json.data;
}
