-- Day 4: Lead capture table setup for Supabase Postgres

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size integer,
  source text not null default 'landing_hero',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists leads_email_unique_idx
  on public.leads (email);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.leads enable row level security;

-- No public policies are required because writes are done from a Next.js
-- server route using SUPABASE_SERVICE_ROLE_KEY.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_leads_set_updated_at on public.leads;

create trigger trg_leads_set_updated_at
before update on public.leads
for each row execute procedure public.set_updated_at();
