import { z } from 'zod';
import 'dotenv/config';
import logger from './utils/logger.js';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string().default('change_me_in_production'),
  JWT_REFRESH_SECRET: z.string().default('refresh_change_me'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  KRA_PIN: z.string().min(11).optional(),
  KRA_APIGEE_APP_ID: z.string().uuid().optional(),
  KRA_SANDBOX_URL: z.string().url().optional(),
  KRA_CONSUMER_KEY: z.string().optional(),
  KRA_CONSUMER_SECRET: z.string().optional(),
  KRA_TCC_SANDBOX_URL: z.string().url().optional(),
  MPESA_ENV: z.string().default('sandbox'),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_CALLBACK_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
