import {
  WeatherSourceMetadata,
  SourceHealthStatus,
  SourceQualityFlag,
  WeatherSourceType,
} from '../../../../shared/types/index.js';

export interface ProviderFetchResult<T> {
  success: boolean;
  sourceId: string;
  sourceType: WeatherSourceType;
  timestamp: string;
  data: T | null;
  quality: SourceQualityFlag;
  freshnessSeconds: number;
  error?: string;
}

export abstract class WeatherDataProvider<T = unknown> {
  abstract readonly sourceId: string;
  abstract readonly sourceName: string;
  abstract readonly sourceType: WeatherSourceType;
  abstract readonly provider: string;
  abstract readonly version: string;
  abstract readonly coverage: string;
  abstract readonly spatialResolution: string;
  abstract readonly temporalResolution: string;
  abstract readonly attribution: string;
  abstract readonly updateIntervalMinutes: number;

  protected status: SourceHealthStatus = 'NOT_CONFIGURED';
  protected lastSuccessfulFetch: string | null = null;
  protected requestCount = 0;
  protected lastRequestTime = 0;
  protected rateLimitRemaining = 1000;

  getMetadata(): WeatherSourceMetadata {
    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      sourceType: this.sourceType,
      provider: this.provider,
      version: this.version,
      coverage: this.coverage,
      spatialResolution: this.spatialResolution,
      temporalResolution: this.temporalResolution,
      status: this.status,
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      attribution: this.attribution,
      configurationStatus: this.status === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'CONFIGURED',
      updateIntervalMinutes: this.updateIntervalMinutes,
    };
  }

  getStatus(): SourceHealthStatus {
    return this.status;
  }

  abstract fetchData(
    lat: number,
    lon: number,
    gridId?: string
  ): Promise<ProviderFetchResult<T>>;
}
