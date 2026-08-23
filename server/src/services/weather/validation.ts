import { z } from 'zod';
import { RawProviderWeatherData } from './types.js';

export interface ValidationCheckResult {
  isValid: boolean;
  errors: string[];
}

export const PhysicalWeatherBoundsSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90'),
  longitude: z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
  temperature: z
    .number()
    .min(-80, 'Temperature below lowest recorded earth physical limit (-80°C)')
    .max(65, 'Temperature above highest recorded earth physical limit (65°C)')
    .nullable()
    .optional(),
  feelsLike: z
    .number()
    .min(-80, 'Feels-like temperature below physical limit')
    .max(75, 'Feels-like temperature above heat index limit')
    .nullable()
    .optional(),
  humidity: z
    .number()
    .min(0, 'Relative humidity cannot be negative')
    .max(100, 'Relative humidity cannot exceed 100%')
    .nullable()
    .optional(),
  pressure: z
    .number()
    .min(850, 'Barometric pressure below physical tropospheric sea-level limit (850 hPa)')
    .max(1100, 'Barometric pressure above highest barometric record (1100 hPa)')
    .nullable()
    .optional(),
  windSpeed: z
    .number()
    .min(0, 'Wind speed cannot be negative')
    .max(450, 'Wind speed exceeds extreme super-typhoon threshold (450 km/h)')
    .nullable()
    .optional(),
  windDirection: z
    .number()
    .min(0, 'Wind azimuth must be >= 0°')
    .max(360, 'Wind azimuth must be <= 360°')
    .nullable()
    .optional(),
  windGust: z
    .number()
    .min(0, 'Wind gust cannot be negative')
    .max(500, 'Wind gust exceeds physical convective limit')
    .nullable()
    .optional(),
  rainfall: z.number().min(0, 'Rainfall rate cannot be negative').nullable().optional(),
  precipitationRate: z.number().min(0, 'Precipitation rate cannot be negative').nullable().optional(),
  visibility: z.number().min(0, 'Visibility cannot be negative').max(150, 'Visibility exceeds 150 km').nullable().optional(),
  cloudCover: z.number().min(0, 'Cloud cover cannot be negative').max(100, 'Cloud cover cannot exceed 100%').nullable().optional(),
});

export class WeatherDataValidator {
  validate(data: RawProviderWeatherData): ValidationCheckResult {
    const errors: string[] = [];

    // 1. Schema & Physical Range Bounds Check
    const result = PhysicalWeatherBoundsSchema.safeParse({
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.temperature,
      feelsLike: data.feelsLike,
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      windGust: data.windGust,
      rainfall: data.rainfall,
      precipitationRate: data.precipitationRate,
      visibility: data.visibility,
      cloudCover: data.cloudCover,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`);
      }
    }

    // 2. Timestamp Sanity Check
    const observedTime = new Date(data.observedAt).getTime();
    if (isNaN(observedTime)) {
      errors.push('observedAt: Invalid timestamp representation');
    } else {
      const now = Date.now();
      const oneHourFuture = now + 60 * 60 * 1000;
      if (observedTime > oneHourFuture) {
        errors.push('observedAt: Observation timestamp is in the future (>1h clock skew)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const weatherDataValidator = new WeatherDataValidator();
