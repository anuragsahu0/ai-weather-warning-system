import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().default('http://localhost:5001'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ML_SERVICE_URL: z.string().default('http://localhost:8000'),

  // Weather Ingestion Configuration (Phase 2)
  WEATHER_PROVIDER: z.enum(['open-meteo', 'openweathermap', 'weatherapi']).default('open-meteo'),
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_API_BASE_URL: z.string().optional(),
  WEATHER_REQUEST_TIMEOUT_MS: z.coerce.number().default(8000),
  WEATHER_REFRESH_INTERVAL_SECONDS: z.coerce.number().default(300),
  WEATHER_STALE_THRESHOLD_SECONDS: z.coerce.number().default(2700), // 45 minutes
  ADMIN_INGEST_SECRET: z.string().default('error404-dev-secret'),
  MAP_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
