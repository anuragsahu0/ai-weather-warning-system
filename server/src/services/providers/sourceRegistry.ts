import { WeatherSourceMetadata, WeatherSourceType } from '../../../../shared/types/index.js';
import { WeatherDataProvider } from './baseProvider.js';
import { observationProvider } from './observationProvider.js';
import { radarProvider } from './radarProvider.js';
import { satelliteProvider } from './satelliteProvider.js';
import { lightningProvider } from './lightningProvider.js';
import { nwpProvider } from './nwpProvider.js';

export class SourceRegistry {
  private providers = new Map<string, WeatherDataProvider>();

  constructor() {
    this.registerProvider(observationProvider);
    this.registerProvider(radarProvider);
    this.registerProvider(satelliteProvider);
    this.registerProvider(lightningProvider);
    this.registerProvider(nwpProvider);
  }

  registerProvider(provider: WeatherDataProvider): void {
    this.providers.set(provider.sourceId, provider);
  }

  getProvider(sourceId: string): WeatherDataProvider | undefined {
    return this.providers.get(sourceId);
  }

  getProvidersByType(type: WeatherSourceType): WeatherDataProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.sourceType === type);
  }

  getAllSourcesMetadata(): WeatherSourceMetadata[] {
    return Array.from(this.providers.values()).map((p) => p.getMetadata());
  }

  getAllSources(): WeatherSourceMetadata[] {
    return this.getAllSourcesMetadata();
  }

  getSourceStatus(type: WeatherSourceType): WeatherSourceMetadata | undefined {
    const provider = Array.from(this.providers.values()).find((p) => p.sourceType === type);
    return provider?.getMetadata();
  }

  getActiveProviders(): WeatherDataProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.getStatus() === 'ACTIVE');
  }
}

export const sourceRegistry = new SourceRegistry();
