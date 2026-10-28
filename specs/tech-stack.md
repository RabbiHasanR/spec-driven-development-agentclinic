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
| UI          | React (via Next.js) + Tailwind CSS      |
| Backend     | Next.js Route Handlers / Server Actions |
| Data access | TypeScript ORM (e.g. Prisma or Drizzle) |
| Database    | TBD — chosen in a later phase           |
| Lint/format | ESLint (Next.js config) + Prettier      |
| Tests       | Vitest + React Testing Library (jsdom)  |

## Decided in Phase 0

- **CSS:** Tailwind CSS — fast to build an attractive UI (Steve).
- **Lint/format:** ESLint with `eslint-config-next`, Prettier for formatting,
  `eslint-config-prettier` to avoid rule conflicts.
- **Tests:** Vitest + React Testing Library — fast and TypeScript-native.

## Project conventions

Every phase follows this layout. Update this section when a convention changes.

| Directory                | Holds                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| `src/app/`               | Routing only: thin `page.tsx`/`layout.tsx` files, grouped by audience |
| `src/app/(site)/`        | Public pages, wrapped in `MainLayout`                                 |
| `src/views/<page>/`      | Page components rendered by the matching route                        |
| `src/components/<area>/` | Shared UI components                                                  |
| `src/lib/`               | Shared constants and helpers                                          |
| `src/styles/`            | **All CSS**: `globals.css` plus CSS Modules                           |
| `src/styles/components/` | CSS Modules for `src/components/` (`<area>.module.css`)               |
| `src/styles/views/`      | CSS Modules for `src/views/` (`<page>.module.css`), when needed       |
| `tests/`                 | **All tests**, mirroring `src/` (e.g. `tests/views/home/…`)           |
| `public/`                | Static assets served as-is (images, icons) — no CSS                   |

Rules:

- New page: `src/app/(site)/<route>/page.tsx` renders a component from
  `src/views/<route>/`; its test goes in `tests/views/<route>/`.
- Styles: Tailwind utilities in components, or a CSS Module in `src/styles/`
  imported via `@/styles/…`. Never link CSS from `public/`.
- Don't create `src/pages/` — it's reserved by the Next.js Pages Router.
- Tests are named `*.test.ts(x)` and import source via `@/…`.

## Validation

Vitest tests are how we validate every change. Work isn't done until they pass.

- `npm test` runs the whole suite once (`vitest run`). Use it before committing and in CI.
- `npm run test:watch` re-runs tests as you edit.
- Each phase's acceptance criteria are written as Vitest tests in `tests/`.
- Run `npm run lint` and `npm run format:check` alongside `npm test`.

## Responsive design

Every page's UI must be responsive. This section is the single standard that
all feature specs reference.

- **Mobile-first:** base styles target the smallest screen; wider layouts are
  added with `min-width` media queries (Tailwind `sm:`/`md:`/`lg:` prefixes).
- **Breakpoints:** Tailwind defaults — `sm` 640px, `md` 768px, `lg` 1024px,
  `xl` 1280px. CSS Modules use the same values in `@media (min-width: …)`
  (CSS variables can't be used in media queries, so keep these in sync).
- **Supported widths:** 320px (small phone) to wide desktop, with no horizontal
  page scroll at any width. Wide content (e.g. tables) scrolls inside its own
  container or reflows into cards on small screens.
- **Fluid layout:** percentage/flex/grid widths capped with `max-width`; no fixed
  pixel widths on containers; long text wraps (`overflow-wrap: anywhere`).
- **Touch:** interactive elements have tap targets of at least 44×44px;
  nothing depends on hover alone.
- **Viewport:** use the Next.js default viewport meta; never disable zoom
  (`maximumScale`, `userScalable: false`).
- **Verification:** every phase with UI is checked manually at **320px, 768px,
  and 1280px** (browser devtools device mode) before it's mergeable.

## Deferred decisions

- Component library (if any) on top of Tailwind.
- ORM choice (Prisma vs. Drizzle).
- Database engine.
- Hosting/deploy target.
