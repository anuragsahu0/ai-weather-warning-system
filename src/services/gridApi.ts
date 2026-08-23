import {
  WeatherGridCell,
  GridSpatialQueryResponse,
  GridHistoryResponse,
  GridWeatherState,
  Region,
} from '@shared/types/index.js';

export interface GridApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchCurrentGrid(
  latitude: number,
  longitude: number,
  resolution = 0.01
): Promise<WeatherGridCell> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    resolution: resolution.toString(),
    includeWeather: 'true',
  });

  const response = await fetch(`/api/grid/current?${params.toString()}`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Grid API error (${response.status}): ${errorText || response.statusText}`);
  }

  const json: GridApiResponse<WeatherGridCell> = await response.json();
  return json.data;
}

export async function fetchNearbyGrids(
  latitude: number,
  longitude: number,
  radiusKm = 10,
  resolution = 0.01
): Promise<GridSpatialQueryResponse> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    radius: radiusKm.toString(),
    resolution: resolution.toString(),
    includeWeather: 'true',
  });

  const response = await fetch(`/api/grid/nearby?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Nearby Grid API error (${response.status})`);
  }

  const json: GridApiResponse<GridSpatialQueryResponse> = await response.json();
  return json.data;
}

export async function fetchBoundsGrids(
  north: number,
  south: number,
  east: number,
  west: number,
  resolution = 0.01,
  limit = 200
): Promise<GridSpatialQueryResponse> {
  const params = new URLSearchParams({
    north: north.toString(),
    south: south.toString(),
    east: east.toString(),
    west: west.toString(),
    resolution: resolution.toString(),
    includeWeather: 'true',
    limit: limit.toString(),
  });

  const response = await fetch(`/api/grid/bounds?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Bounds Grid API error (${response.status})`);
  }

  const json: GridApiResponse<GridSpatialQueryResponse> = await response.json();
  return json.data;
}

export async function fetchGridWeather(gridId: string): Promise<GridWeatherState> {
  const response = await fetch(`/api/grid/weather?gridId=${encodeURIComponent(gridId)}`);
  if (!response.ok) {
    throw new Error(`Grid Weather API error (${response.status})`);
  }

  const json: GridApiResponse<GridWeatherState> = await response.json();
  return json.data;
}

export async function fetchGridHistory(
  gridId: string,
  start?: string,
  end?: string
): Promise<GridHistoryResponse> {
  const params = new URLSearchParams({ gridId });
  if (start) params.set('start', start);
  if (end) params.set('end', end);

  const response = await fetch(`/api/grid/history?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Grid History API error (${response.status})`);
  }

  const json: GridApiResponse<GridHistoryResponse> = await response.json();
  return json.data;
}

export async function fetchRegions(): Promise<Region[]> {
  const response = await fetch('/api/grid/regions');
  if (!response.ok) {
    throw new Error(`Regions API error (${response.status})`);
  }

  const json: GridApiResponse<Region[]> = await response.json();
  return json.data;
}
