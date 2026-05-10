import { createClient } from '@supabase/supabase-js';

import { getServerEnv } from './env';
import { LeadRecord } from '@/lib/types';

type LeadInsert = {
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  source: string;
};

export async function upsertLead(input: LeadInsert): Promise<LeadRecord> {
  const env = getServerEnv();

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from('leads')
    .upsert(input, { onConflict: 'email' })
    .select('id,email,company_name,role,team_size,source,created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to store lead');
  }

  return data as LeadRecord;
}
