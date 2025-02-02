import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  
  // Database URL
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>; 