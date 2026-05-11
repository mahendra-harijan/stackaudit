import { createClient } from '@supabase/supabase-js';

import { getServerEnv } from './env';
import { LeadRecord } from '@/lib/types';

export type AuditShareRecord = {
  id: string;
  share_id: string;
  ai_summary: string;
  ai_provider: string;
  ai_model: string | null;
  public_payload: Record<string, unknown>;
  created_at: string;
};

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

export async function insertAuditShare(input: {
  share_id: string;
  ai_summary: string;
  ai_provider: string;
  ai_model: string | null;
  public_payload: Record<string, unknown>;
}): Promise<AuditShareRecord> {
  const env = getServerEnv();

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from('audit_shares')
    .insert(input)
    .select('id,share_id,ai_summary,ai_provider,ai_model,public_payload,created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to store audit share');
  }

  return data as AuditShareRecord;
}

export async function getAuditShareByShareId(shareId: string): Promise<AuditShareRecord | null> {
  const env = getServerEnv();

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from('audit_shares')
    .select('id,share_id,ai_summary,ai_provider,ai_model,public_payload,created_at')
    .eq('share_id', shareId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? (data as AuditShareRecord) : null;
}
