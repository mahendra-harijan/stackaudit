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

**Hours worked:** 6–8 hours

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

