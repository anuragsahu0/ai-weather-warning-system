import { NormalizedWeatherObservation, WeatherIngestionStatusResponse } from '@shared/types/index.js';

export interface WeatherApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  locationId?: string
): Promise<NormalizedWeatherObservation> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
  });
  if (locationId) {
    params.set('locationId', locationId);
  }

  const response = await fetch(`/api/weather/current?${params.toString()}`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Weather API error (${response.status}): ${errorText || response.statusText}`);
  }

  const json: WeatherApiResponse<NormalizedWeatherObservation> = await response.json();
  if (!json.success || !json.data) {
    throw new Error(json.message || 'Failed to parse weather observation data');
  }

  return json.data;
}

export async function fetchWeatherStatus(): Promise<WeatherIngestionStatusResponse> {
  const response = await fetch('/api/weather/status');
  if (!response.ok) {
    throw new Error(`Weather status API error (${response.status})`);
  }

  const json: WeatherApiResponse<WeatherIngestionStatusResponse> = await response.json();
  return json.data;
}

export async function triggerManualIngest(
  latitude?: number,
  longitude?: number,
  locationId?: string
): Promise<NormalizedWeatherObservation | undefined> {
  const response = await fetch('/api/weather/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude, longitude, locationId, force: true }),
  });

  if (!response.ok) {
    throw new Error(`Ingest trigger failed (${response.status})`);
  }

  const json = await response.json();
  return json.data?.observation;
}
