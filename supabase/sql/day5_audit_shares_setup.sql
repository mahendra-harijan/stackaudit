-- Day 5: Public audit share table setup for Supabase Postgres

create extension if not exists pgcrypto;

create table if not exists public.audit_shares (
  id uuid primary key default gen_random_uuid(),
  share_id text not null,
  ai_summary text not null,
  ai_provider text not null default 'fallback',
  ai_model text,
  public_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists audit_shares_share_id_unique_idx
  on public.audit_shares (share_id);

create index if not exists audit_shares_created_at_idx
  on public.audit_shares (created_at desc);

alter table public.audit_shares enable row level security;

-- Public reads are served from the Next.js server using the service role key.
-- No public client policies are needed for this launch flow.
