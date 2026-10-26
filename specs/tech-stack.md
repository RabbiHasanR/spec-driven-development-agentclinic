# AgentClinic — Tech Stack

## Principles

- **Server-side TypeScript** end to end — one language across UI, API, and data.
- Popular, well-supported, reliable tools (Mary's requirement).
- Server-side rendering for a fast, attractive, modern-browser experience
  (Steve's requirement).

## Recommended framework: Next.js (App Router)

We commit to **Next.js** with the App Router, running on **Node.js**.

Why Next.js:

- **Full-stack TypeScript in one codebase** — React UI, server-side rendering,
  and backend API/Route Handlers together. One deploy, one mental model.
- **Attractive, modern UI** — SSR and React give Steve the polished,
  fast-loading site he wants.
- **Dashboard-friendly** — straightforward to build the staff/agent dashboard
  Mary asked for.
- **Popular and reliable** — large ecosystem, long-term support, easy hiring.

## Stack summary

| Layer       | Choice                                  |
| ----------- | --------------------------------------- |
| Language    | TypeScript (server-side, end to end)    |
| Framework   | Next.js (App Router) on Node.js         |
| UI          | React (via Next.js) + CSS/Tailwind      |
| Backend     | Next.js Route Handlers / Server Actions |
| Data access | TypeScript ORM (e.g. Prisma or Drizzle) |
| Database    | TBD — chosen in a later phase           |

## Deferred decisions

- Specific CSS/component approach (Tailwind vs. alternatives).
- ORM choice (Prisma vs. Drizzle).
- Database engine.
- Hosting/deploy target.
