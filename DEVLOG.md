# DEVLOG

## Day 1 — 2026-05-07

**Hours worked:** 4–5 hours

**What I did:**

- Scaffolded a Next.js 15 (App Router) + TypeScript + Tailwind CSS project from scratch.
- Configured build chain: TypeScript strict mode, PostCSS, Tailwind, ESLint.
- Created a professional landing page with:
  - Responsive hero section with headline, subheadline, and two CTA buttons.
  - Clean "How it works" section with 3 numbered steps.
  - Top navigation bar with logo and links.
  - Professional footer.
- Built a small shadcn-inspired `components/ui` folder with a reusable `Button` component (variants: `primary`, `ghost`).
- Established project structure:
  - `app/` — App Router pages and global styles.
  - `components/` — UI and layout components.
  - `lib/` — constants, config, utilities.
- Created starter docs:
  - `README.md` — quick start, stack explanation, Day 1 decisions.
  - `ARCHITECTURE.md` — stack reasoning, Mermaid diagram, backend planning.
  - `PRICING_DATA.md` — canonical pricing structure for ChatGPT, Claude, Copilot, Cursor, Gemini.
  - `DEVLOG.md` — this file.
- Git-ready: `.gitignore`, `.eslintrc.json`, project init scaffolding.

**What I learned:**

- Next.js 15 App Router requires explicit `app/layout.tsx` and a clean separation between server and client components. This is cleaner than Pages Router for a SaaS product.
- Tailwind + shadcn patterns work well for rapid, consistent iteration on design without bloat.
- Keeping Day 1 focused on structure and foundation (not features) makes future work predictable and reviewable.
- A small, opinionated component library (even with one `Button` component) enforces consistency early.

**Blockers / what I'm stuck on:**

- None at this stage. The foundation is solid and runway-ready.

**Plan for tomorrow (Day 2):**

- Initialize Git and make the Day 1 commit with proper message.
- Add a simple mock API endpoint (`/api/audit`) that accepts spend data and returns placeholder recommendations.
- Build a basic dashboard page (`/dashboard`) to preview audit results.
- Add lightweight auth placeholder (sign-up form stub or OAuth setup prep).
- Integrate `npx shadcn@latest init` to add official shadcn components (Card, Input, Badge, etc.) for richer UI.
- Add Jest + React Testing Library for unit tests.
- Set up GitHub Actions CI pipeline for lint + build checks.

## Day 2 — 2026-05-08

**Hours worked:** 3-4 hours

**What I did:**

- Implemented the Day 2 spend input workflow (production-quality): dynamic form, persistence, validation, and a results placeholder.
- Added dependencies: `react-hook-form`, `zod`, `@hookform/resolvers`, and `lucide-react` for icons.
- Built a type-safe configuration and pricing system in `lib/config.ts` and core types in `lib/types.ts` for `AITool`, `PricingPlan`, `SpendEntry`, and `AuditInput`.
- Created comprehensive Zod schemas in `lib/schemas.ts` and integrated them with React Hook Form using `zodResolver`.
- Implemented a robust localStorage persistence layer (`lib/storage.ts`) with draft autosave, import/export helpers, and metadata tracking.
- Built reusable UI components under `components/ui/` (Button, Input, Select, Label, Card, Alert) and form-specific components under `components/form/` (FormField, SpendEntryForm, SpendEntriesList).
- Implemented pages: `/spend-input` (`app/spend-input/page.tsx`) for the form workflow and `/audit-results` (`app/audit-results/page.tsx`) as a Day 3 placeholder.
- Added utility helpers in `lib/utils.ts` (currency formatting, debounce, throttle, classnames helper) and small UX improvements (focus states, accessible labels).
- Ensured responsive, mobile-first layout with Tailwind utilities and a sticky sidebar on desktop.
- Fixed build and lint issues encountered during implementation (dependency version mismatch, ESLint rules, unescaped entities, TypeScript type refinements) and confirmed a successful production build and dev server.

**What I learned:**

- React Hook Form + Zod is a compact, high-performance combination for type-safe forms and runtime validation.
- Keeping pricing and plan data in a central `config` file makes the UI dynamic and easy to update without touching components.
- Defensive localStorage utilities (safe stringify/parse, error handling) improve robustness for demo apps.
- Small UX touches (autosave drafts, clear error messages, cost-difference callouts) significantly increase product polish.

**Blockers / what I'm stuck on:**

- No major blockers; addressed a few integration issues during the day (package version constraints and ESLint rule configuration).
- Editing existing saved entries is not yet implemented—planned for Day 3.

**Plan for tomorrow (Day 3):**

- Implement the audit calculation engine and recommendation logic (server or client-side prototype).
- Add edit functionality for saved entries and better CRUD operations.
- Integrate a lightweight backend endpoint to persist audits (simple POST /api/audit) and move storage from localStorage to server when ready.
- Add unit tests for core utilities and form validation (Jest + React Testing Library).
- Polish results page with savings estimates, downgrade recommendations, and alternative tool suggestions.

## Day 3 — 2026-05-09

**Hours worked:** 4-5 hours

**What I did:**

- Built the core audit engine as a deterministic, type-safe business logic layer in `lib/audit/`.
- Created reusable audit result types for summaries, per-tool results, and recommendation records so UI stays separate from calculations.
- Implemented a scalable rule-based recommendation system covering:
  - same-tool plan optimization
  - seat right-sizing
  - cheaper tool alternatives by use case
  - API retail vs committed-credit guidance
- Added conservative pricing comparison helpers and savings calculations for both monthly and annual estimates.
- Kept the recommendation logic financially defensible by:
  - avoiding AI/LLM-based calculations
  - using published pricing and deterministic thresholds
  - preventing double counting across overlapping recommendations
  - surfacing low-confidence or no-savings cases honestly
- Added a `prepareAuditInput()` utility so the spend-input workflow prepares normalized audit data before persisting it.
- Replaced the Day 2 placeholder results screen with a production-style audit results page that includes:
  - a savings hero section
  - summary KPI cards
  - per-tool recommendation breakdowns
  - recommendation cards with reasoning and confidence labels
  - honest messaging when savings are limited or absent
- Preserved the existing localStorage workflow so the UI still works as a client-side demo while the business logic remains future-ready.

**What I learned:**

- A pure audit engine is much easier to test and reason about than embedding pricing logic directly in React pages.
- Conservative business rules make the product feel more trustworthy than aggressive savings claims.
- Separating input preparation, calculation, and presentation gives a clean path to a future API or database-backed implementation.
- A results page is more useful when it explains why a recommendation exists, not just how much it saves.

**Blockers / what I'm stuck on:**

- None for Day 3. The audit flow is now implemented and the results page is rendering computed recommendations.

**Plan for tomorrow (Day 4):**

- Add persisted audit history instead of only the current saved audit.
- Introduce comparison views for multiple audits or scenarios.
- Add unit tests for the audit engine rules and savings calculations.
- Refine the results page with export/share support if needed.

## Day 4 — 2026-05-10

**Hours worked:** 4-5 hours

**What I did:**

- Implemented a production-style lead capture backend workflow using Next.js App Router API routes.
- Added `POST /api/leads` route with:
  - strict Zod payload validation (`LeadCaptureSchema`)
  - honeypot spam protection (`website` hidden field)
  - IP/User-Agent rate limiting with 15-minute window
  - robust error handling and consistent HTTP responses
- Integrated Supabase Postgres storage through server-only utilities (`lib/server/supabase.ts`) using `SUPABASE_SERVICE_ROLE_KEY`.
- Added transactional confirmation email delivery through Resend (`lib/server/email.ts`).
- Added centralized server env validation (`lib/server/env.ts`) so startup/runtime failures are explicit and safe.
- Created SQL setup script for Supabase (`supabase/sql/day4_leads_setup.sql`) including table, indexes, and update trigger.
- Added `.env.example` and improved `.gitignore` to prevent accidental secret commits while keeping template env committed.
- Replaced static Hero preview block with a functional lead capture form featuring:
  - required email field
  - optional company name, role, and team size fields
  - loading state, success state, and error alert handling

**What I learned:**

- A dedicated server env parser catches configuration issues earlier and reduces deployment-time surprises.
- Combining honeypot + lightweight rate limiting is a practical low-complexity anti-abuse baseline for early-stage SaaS forms.
- Service-role writes from a server route simplify secure writes while keeping RLS enabled and avoiding client-side exposure.

**Blockers / what I'm stuck on:**

- No major blockers. Only pending item is verifying environment values in deployed infrastructure.

**Plan for tomorrow (Day 5):**

- Add admin-facing lead list and basic filtering.
- Add integration tests for `POST /api/leads` validation and error paths.
- Add observability hooks (structured logging + simple lead funnel metrics).

## Day 5 — 2026-05-11

**Hours worked:** 4-5 hours

**What I did:**

- Added AI-generated audit summary support with a reusable prompt structure in `lib/server/audit-summary.ts`.
- Implemented provider handling with Anthropic preferred and OpenAI as fallback, plus a deterministic summary fallback if both APIs fail.
- Added a new share creation API route (`POST /api/audit-shares`) that recomputes the audit server-side and stores a public-safe snapshot.
- Created public audit share persistence helpers in `lib/server/audit-shares.ts` and Supabase access helpers in `lib/server/supabase.ts`.
- Added a public audit page at `/audit/[shareId]` that renders only safe result data and excludes private fields like email and company.
- Added Open Graph and Twitter card metadata support in the root layout and public share page.
- Added a branded social preview image at `public/og-audit.svg`.
- Updated the private results page to generate, copy, and open public share links.
- Added Supabase schema setup for audit shares in `supabase/sql/day5_audit_shares_setup.sql`.
- Documented the Day 5 setup and required environment variables in `README.md`.

**What I learned:**

- Keeping the deterministic audit engine separate from the AI summary layer makes the product more trustworthy and easier to debug.
- Public share links are best handled as server-owned snapshots so private lead data never leaks into the public result page.
- A fallback summary is important for launch reliability because it keeps sharing functional even when an AI provider is unavailable.

**Blockers / what I'm stuck on:**

- No blockers. The Day 5 share flow and metadata support are in place.

**Plan for tomorrow (Day 6):**

- Add analytics or event tracking for share creation and public page views.
- Add tests for the audit share API and public payload sanitization.
- Refine the share page copy if needed after real-world review.

