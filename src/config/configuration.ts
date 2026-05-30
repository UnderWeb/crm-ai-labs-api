// src/config/configuration.ts
import 'dotenv/config';
import { envSchema } from './env.schema';

const env = envSchema.parse(process.env);

export default () => ({
  app: {
    env: env.APP_ENV,
    port: env.APP_PORT,
  },

  database: {
    url: env.DATABASE_URL,
  },

  ai: {
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL,
  },
});
