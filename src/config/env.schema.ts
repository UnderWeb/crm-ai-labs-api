// src/config/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  APP_ENV: z.string(),
  APP_PORT: z.coerce.number(),
  LOG_LEVEL: z.string().default('info'),
  CORS_ORIGINS: z.url(),

  DATABASE_URL: z.url(),

  AI_API_KEY: z.string().min(1),
  AI_MODEL: z.string(),

  SEED_DATA_ENABLED: z.coerce.boolean(),
  ENABLE_DASHBOARD_METRICS: z.coerce.boolean(),
  ENABLE_CSV_EXPORT: z.coerce.boolean(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
