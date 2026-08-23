import { ApiError } from '../../utils/apiError.js';
import { config } from '../../config/index.js';

export interface HttpClientOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class WeatherHttpClient {
  private defaultTimeout: number;

  constructor(timeoutMs: number = config.WEATHER_REQUEST_TIMEOUT_MS) {
    this.defaultTimeout = timeoutMs;
  }

  async get<T>(url: string, options: HttpClientOptions = {}): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, body: unknown, options: HttpClientOptions = {}): Promise<T> {
    return this.request<T>('POST', url, body, options);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: unknown,
    options: HttpClientOptions = {}
  ): Promise<T> {
    const timeout = options.timeoutMs ?? this.defaultTimeout;
    const maxRetries = options.retries ?? 2;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const safeUrlForLogs = this.sanitizeUrl(url);

      try {
        if (attempt > 0) {
          const backoffMs = Math.min(500 * Math.pow(2, attempt - 1), 3000);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          console.log(`[WeatherHttpClient] Retrying request (attempt ${attempt + 1}/${maxRetries + 1}): ${safeUrlForLogs}`);
        }

        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'User-Agent': 'ERROR-404-Weather-Nowcasting-Engine/1.0',
          ...options.headers,
        };

        if (body !== undefined) {
          headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            const errorBody = await response.text().catch(() => '');
            throw ApiError.badRequest(
              `Service returned HTTP ${response.status}: ${errorBody || response.statusText}`
            );
          }

          if (attempt === maxRetries) {
            throw ApiError.serviceUnavailable(
              `Service unavailable after ${maxRetries + 1} attempts (HTTP ${response.status})`
            );
          }

          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        return data as T;
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof ApiError) {
          throw err;
        }

        const isAbort = (err as Error)?.name === 'AbortError';
        const errMsg = isAbort ? `Request timeout after ${timeout}ms` : (err as Error)?.message || 'Network failure';

        lastError = new Error(errMsg);

        if (attempt === maxRetries) {
          console.error(`[WeatherHttpClient] Failed ${method} request to ${safeUrlForLogs}: ${errMsg}`);
          throw ApiError.serviceUnavailable(`Service query failed: ${errMsg}`);
        }
      }
    }

    throw lastError || ApiError.serviceUnavailable('Unknown network failure during HTTP query');
  }

  private sanitizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.searchParams.has('appid')) parsed.searchParams.set('appid', '***');
      if (parsed.searchParams.has('key')) parsed.searchParams.set('key', '***');
      if (parsed.searchParams.has('api_key')) parsed.searchParams.set('api_key', '***');
      return parsed.toString();
    } catch {
      return rawUrl.split('?')[0] + '?[PARAMS_REDACTED]';
    }
  }
}

export const weatherHttpClient = new WeatherHttpClient();
