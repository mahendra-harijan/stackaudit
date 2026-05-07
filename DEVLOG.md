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

