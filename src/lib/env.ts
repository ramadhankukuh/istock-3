import { z } from "zod";

const envSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  TURSO_DATABASE_URL: z.string().optional().default(""),
  TURSO_AUTH_TOKEN: z.string().optional().default(""),
  CRON_SECRET: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  AUTH_SECRET: z.string().optional().default(""),
  NEXTAUTH_SECRET: z.string().optional().default(""),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  upstashRedisRestUrl: parsedEnv.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: parsedEnv.UPSTASH_REDIS_REST_TOKEN,
  tursoDatabaseUrl: parsedEnv.TURSO_DATABASE_URL,
  tursoAuthToken: parsedEnv.TURSO_AUTH_TOKEN,
  cronSecret: parsedEnv.CRON_SECRET,
  googleClientId: parsedEnv.GOOGLE_CLIENT_ID,
  googleClientSecret: parsedEnv.GOOGLE_CLIENT_SECRET,
  authSecret: parsedEnv.AUTH_SECRET || parsedEnv.NEXTAUTH_SECRET,
};
