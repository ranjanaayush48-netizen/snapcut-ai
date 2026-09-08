import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });
dotenv.config({ path: path.resolve(here, '../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Supabase
  SUPABASE_URL: z.string().optional().default('https://mock-supabase.supabase.co'),
  SUPABASE_ANON_KEY: z.string().optional().default('mock-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('mock-service-role-key'),
  SUPABASE_JWT_SECRET: z.string().optional().default('mock-jwt-secret'),

  // n8n Cloud
  N8N_WEBHOOK_URL: z
    .string()
    .optional()
    .default('https://asdfgfdf.app.n8n.cloud/webhook/remove-background'),
  N8N_WEBHOOK_SECRET: z.string().optional().default('snapcut-dev-secret-token'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  IMAGE_RETENTION_SECONDS: z.coerce.number().default(86400), // 24 hours

  // AI Background Removal API
  BACKGROUND_REMOVAL_PROVIDER: z.enum(['clipdrop', 'removebg', 'photomaker', 'mock', 'n8n']).default('mock'),
  BACKGROUND_REMOVAL_API_URL: z.string().optional().default('https://clipdrop-api.co/remove-background/v1'),
  BACKGROUND_REMOVAL_API_KEY: z.string().optional().default(''),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional().default('rzp_test_mock_key_id'),
  RAZORPAY_KEY_SECRET: z.string().optional().default('mock_razorpay_secret_token'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default('mock_webhook_secret'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(10 * 1024 * 1024) // 10 MB
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment configuration validation failed:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
