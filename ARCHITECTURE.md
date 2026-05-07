# ARCHITECTURE — Day 1

## Stack reasoning

- Next.js (App Router) — server components, routing and incremental adoption for a modern SaaS.
- TypeScript — type safety and maintainability.
- Tailwind CSS — fast, consistent UI with utility-first approach.
- shadcn-style UI folder — small, consistent component set patterned for scaling a design system.

## High level diagram

```mermaid
flowchart TB
  subgraph frontend
    A[Next.js App (app/)] --> B[Reusable UI components]
  end
  subgraph backend_future
    C[API / audit engine] --> D[Cost models & optimizer]
  end
  A --> C
```

## Scalability considerations

- Keep presentation and business logic separate: front-end handles UI and lightweight orchestration; heavy compute (optimizer) will be a backend microservice.
- Prepare for event-driven ingestion (webhooks, CSV uploads) so audit engine can be run asynchronously.
- Use small, typed contracts (interfaces) for data exchange; create a `schemas/` folder when adding the backend.

## Future backend planning

- Day 2+: design a thin API that accepts tools, plans, monthly spend, and team size. The audit engine will run asynchronously and persist results to a database.
- Consider using PostgreSQL + Prisma for data modeling and a queue (Redis/Sidekiq or serverless queues) for heavy processing.
