import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/codematrix'),
  JWT_ACCESS_SECRET: z.string().default('codematrix_super_secret_jwt_access_key_123456'),
  JWT_REFRESH_SECRET: z.string().default('codematrix_super_secret_jwt_refresh_key_654321'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CLIENT_ID: z.string().optional(),
  CLIENT_SECRET: z.string().optional(),
  REFRESH_TOKEN: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  AI_PROVIDER: z.string().default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  JUDGE0_API_URL: z.string().default('https://judge0-ce.p.rapidapi.com'),
  JUDGE0_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
