# Credex — AI Spend Audit

Professional starter scaffold for the Credex WebDev 2026 assignment. This repo now includes the Day 3 audit engine, deterministic recommendation logic, and a polished results page on top of the original Next.js 15 (App Router) + TypeScript + Tailwind CSS foundation.

Quick start

1. Install dependencies

```bash
cd stackaudit
npm install
```

2. Run dev server

```bash
npm run dev
```

Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style UI folder (components/ui)
- ESLint

Current status

- Day 1: project foundation, landing page, shared UI primitives.
- Day 2: spend input workflow, validation, persistence, and results placeholder.
- Day 3: deterministic audit engine, recommendation rules, and computed results UI.
- Day 4: lead capture backend with Supabase, Resend, API validation, and abuse protection.

Day 3 highlights

- Pure audit engine in `lib/audit/` with type-safe result preparation utilities.
- Conservative savings calculations based on pricing, seats, team size, and plan fit.
- Recommendation logic for plan downgrades, seat right-sizing, tool consolidation, and API pricing options.
- Results page with savings summary, per-tool breakdown, and honest no-savings messaging.

Day 1 decisions

- Focus on clean architecture and reusable UI components instead of feature breadth.
- App Router with an explicit `app/` layout to make future pages predictable.
- Small, opinionated `components/ui` set to mirror shadcn patterns for design consistency.
- Keep UI and business logic separate so the audit engine stays reusable and testable.

Next steps

- Add tests for the audit engine rules and savings helpers.
- Add audit history or export support if the project scope extends beyond the assignment.

## Day 4 backend setup

### 1) Install dependencies

```bash
npm install @supabase/supabase-js resend
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and set values:

```bash
cp .env.example .env.local
```

Required variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LEADS_FROM_EMAIL`

### 3) Run SQL in Supabase

Execute `supabase/sql/day4_leads_setup.sql` in the Supabase SQL editor.

### 4) API endpoint

- `POST /api/leads`
- Validates payload using Zod (`LeadCaptureSchema`)
- Honeypot protection (`website` field must be empty)
- Rate limiting (in-memory IP + User-Agent bucket)
- Stores lead in Postgres
- Sends confirmation email through Resend

### 5) Request payload

```json
{
	"email": "alice@company.com",
	"companyName": "Acme Inc",
	"role": "Engineering Manager",
	"teamSize": 18,
	"website": ""
}
```

### 6) Deployment prep checklist

- Add the 4 env variables in your hosting provider (Vercel project settings).
- Verify your Resend sender domain and set `LEADS_FROM_EMAIL` to that verified sender.
- Confirm Supabase table and index exist (`public.leads`).
- Validate API from production URL and check email delivery logs in Resend.
