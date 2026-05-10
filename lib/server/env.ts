import { z } from 'zod';

const ServerEnvSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  LEADS_FROM_EMAIL: z.string().email('LEADS_FROM_EMAIL must be a valid email'),
});

type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ServerEnvSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEADS_FROM_EMAIL: process.env.LEADS_FROM_EMAIL,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid server environment variables: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
