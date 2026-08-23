import {
  WeatherSourceMetadata,
  FusedGridWeatherState,
  FusionLineage,
} from '@shared/types/index.js';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchSourcesStatus(): Promise<{
  totalSources: number;
  activeCount: number;
  sources: WeatherSourceMetadata[];
}> {
  const res = await fetch('/api/sources/status');
  if (!res.ok) {
    throw new Error(`Failed to fetch sources status (${res.status})`);
  }
  const json: ApiResponse<{
    totalSources: number;
    activeCount: number;
    sources: WeatherSourceMetadata[];
  }> = await res.json();
  return json.data;
}

export async function fetchFusedWeather(
  lat?: number,
  lon?: number,
  gridId?: string
): Promise<{ fusedState: FusedGridWeatherState; lineages: FusionLineage[] }> {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set('lat', lat.toString());
  if (lon !== undefined) params.set('lon', lon.toString());
  if (gridId) params.set('gridId', gridId);

  const res = await fetch(`/api/weather/fused?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch fused weather (${res.status})`);
  }
  const json: ApiResponse<{ fusedState: FusedGridWeatherState; lineages: FusionLineage[] }> =
    await res.json();
  return json.data;
}
