import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().optional(),
  JANJEZ_MAIN_API_URL: z.string().url().optional(),
  JANJEZ_MAIN_API_KEY: z.string().min(1).optional(),
  JANJEZ_MAIN_API_SECRET: z.string().optional(),
  MPESA_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_CALLBACK_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PARTNER_HUB_DOMAIN: z.string().default('localhost'),
  SENTRY_DSN: z.string().optional(),
  BETTER_STACK_TOKEN: z.string().optional(),
  PARTNER_ACTIVATION_FEE: z.coerce.number().default(1499),
  WITHDRAWAL_FEE_PERCENT: z.coerce.number().default(5),
  WITHDRAWAL_MIN_AMOUNT: z.coerce.number().default(500),
  SESSION_COOKIE_NAME: z.string().default('jez_bs_session'),
  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(86400),
  HMAC_SECRET: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SMTP_HOST: z.string().optional(),
  BREVO_SMTP_PORT: z.string().optional(),
  BREVO_SMTP_USER: z.string().optional(),
  BREVO_SMTP_KEY: z.string().optional(),
  BREVO_FROM_EMAIL: z.string().email().optional(),
  BREVO_FROM_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
