import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  
  // Database URL
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(1),

  // Stripe
  STRIPE_PUBLIC_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Frontend URL
  FRONTEND_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>; 