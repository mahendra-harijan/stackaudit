# Credex — AI Spend Audit (Day 1)

Professional starter scaffold for the Credex WebDev 2026 assignment. This repo contains a production-minded Next.js 15 (App Router) + TypeScript + Tailwind CSS foundation designed for a SaaS MVP.

Quick start

1. Install dependencies

```bash
cd e:/development/stackaudit
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

Day 1 decisions

- Focus on clean architecture and reusable UI components instead of feature breadth.
- App Router with an explicit `app/` layout to make future pages predictable.
- Small, opinionated `components/ui` set to mirror shadcn patterns for design consistency.

Next steps

- Install and initialize any shadcn generator if desired: `npx shadcn@latest init`.
- Add tests and CI (GitHub Actions) on Day 2.
