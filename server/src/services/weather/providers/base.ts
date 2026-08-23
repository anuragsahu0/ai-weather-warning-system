import { RawProviderWeatherData, WeatherProviderStatus, WeatherAttribution } from '../types.js';

export interface WeatherProvider {
  name: string;
  getAttribution(): WeatherAttribution;
  getCurrentWeather(latitude: number, longitude: number): Promise<RawProviderWeatherData>;
  getStatus(): Promise<WeatherProviderStatus>;
}
