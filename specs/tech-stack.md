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
| Data access | Drizzle ORM + drizzle-kit migrations    |
| Database    | SQLite (`better-sqlite3`)               |
| Lint/format | ESLint (Next.js config) + Prettier      |
| Tests       | Vitest + React Testing Library (jsdom)  |

## Decided in Phase 0

- **CSS:** Tailwind CSS — fast to build an attractive UI (Steve).
- **Lint/format:** ESLint with `eslint-config-next`, Prettier for formatting,
  `eslint-config-prettier` to avoid rule conflicts.
- **Tests:** Vitest + React Testing Library — fast and TypeScript-native.

## Decided in Phase 1

- **ORM:** Drizzle ORM with `drizzle-kit` for SQL migrations — TypeScript-first,
  lightweight, and close to SQL.
- **Database:** SQLite via `better-sqlite3`. A file DB needs no infrastructure,
  handles Phase 2 writes, and Drizzle keeps a later move to Postgres simple.
- **Config:** the DB file path comes from `DATABASE_URL` (see `.env.example`);
  the file lives in the gitignored `data/` directory.
- **Rendering:** Server Components read the DB directly. With Cache Components
  enabled, DB reads call `connection()` so they run per request, inside a
  `loading.tsx` Suspense boundary; the build never touches the database.
- **DB safety:** only `npm run db:migrate` creates the database file; the app
  and seed refuse a missing one. `migrateDb` turns foreign keys off around
  migrations (SQLite ignores the pragma inside Drizzle's transaction, so table
  rebuilds would cascade-delete rows) and runs `foreign_key_check` after.

## Decided in Phase 2

- **Writes:** forms post to Server Actions in `src/lib/<area>/actions.ts`
  (`"use server"`). The route binds any route params (`action.bind(null,
slug)`) and passes the action to the view, so views stay testable with a
  fake action. Client forms use `useActionState`; the action returns field
  errors plus the submitted values, and calls `redirect()` outside any
  `try`. Every action re-validates its input: actions are reachable by direct
  POST.
- **Integrity in the database:** rules that must hold under concurrency (one
  booking per therapy slot) are unique indexes; the query maps the constraint
  error to a result (`{ ok: false, reason: "slot-taken" }`).
- **Time:** times are stored as ISO 8601 UTC strings. Clinic-time rules use
  `CLINIC_TIME_ZONE` and `Intl` (no date library); pure functions take `now`
  so tests pass a fixed clock.
- **Staff pages** live in the `(staff)` route group, where auth will go. Pages
  showing personal data (`/dashboard`, `/bookings/[reference]`) are `noindex`.
- **Forms** keep the browser's own validation (`required`, `type="email"`) so
  they work before JavaScript loads; the server's checks are the real gate.
  Known limitation: without JavaScript, a server-side error (e.g. a slot taken
  in a race) re-renders the form without its message.

## Project conventions

Every phase follows this layout. Update this section when a convention changes.

| Directory                | Holds                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| `src/app/`               | Routing only: thin `page.tsx`/`layout.tsx` files, grouped by audience |
| `src/app/(site)/`        | Public pages, wrapped in `MainLayout`                                 |
| `src/views/<page-name>/` | Page components rendered by the matching route                        |
| `src/components/<area>/` | Shared UI components (`ui/` holds generic building blocks)            |
| `src/lib/`               | Shared constants and helpers                                          |
| `src/lib/db/`            | **All DB code**: schema, client, query functions, migrator, seed      |
| `src/lib/<area>/`        | Domain logic and Server Actions (e.g. `booking/`), no Drizzle imports |
| `src/app/(staff)/`       | Staff pages, wrapped in `MainLayout`; future home of staff auth       |
| `drizzle/`               | Generated SQL migrations (`npm run db:generate`); committed           |
| `scripts/`               | CLI entry points run with `tsx` (e.g. `db:migrate`, `db:seed`)        |
| `src/styles/`            | **All CSS**: `globals.css` plus CSS Modules                           |
| `src/styles/components/` | CSS Modules for `src/components/` (`<area>.module.css`)               |
| `src/styles/views/`      | CSS Modules for `src/views/` (`<page>.module.css`), when needed       |
| `tests/`                 | **All tests**, mirroring `src/` (e.g. `tests/views/home/…`)           |
| `public/`                | Static assets served as-is (images, icons) — no CSS                   |

Rules:

- New page: `src/app/(site)/<route>/page.tsx` renders a component from
  `src/views/<page-name>/` (named for the page, e.g. `ailment-detail/` for
  `ailments/[slug]/`); its test goes in `tests/views/<page-name>/`. Route-level
  behavior (metadata, `notFound()`) is tested in `tests/app/`, mirroring the
  route path.
- Styles: Tailwind utilities in components, or a CSS Module in `src/styles/`
  imported via `@/styles/…`. Never link CSS from `public/`.
- Colors come only from the `--site-*` tokens in `globals.css`. Tailwind uses
  them as `text-accent`, `bg-surface`, `ring-line`, `text-muted`, etc.; CSS
  Modules as `var(--site-*)`. Tokens switch with the color scheme, so don't
  write `dark:` variants or raw palette colors (`teal-800`, `slate-500`).
- Reuse the `card` and `focus-ring` utilities (in `globals.css`) and the
  `src/components/ui/` components (`PageHeader`, `Section`, `Button`,
  `ArrowLink`, `BackLink`) instead of repeating class strings.
- Every page group has one `loading.tsx` that re-exports `LoadingPage` from
  `src/views/loading/`; don't add per-route copies.
- URL paths live in `src/lib/routes.ts` (`ROUTES`, `ailmentPath()`,
  `bookTherapyPath()`, `bookingPath()`); never type a path string in a
  component.
- UI code imports row types from `src/lib/db/types.ts`, never the schema.
- Don't create `src/pages/` — it's reserved by the Next.js Pages Router.
- Tests are named `*.test.ts(x)` and import source via `@/…`.
- Only `src/lib/db/` imports Drizzle or `better-sqlite3`. Query functions take
  the `Db` as their first argument; routes pass `getDb()` (server-only), tests
  pass an in-memory DB from `tests/helpers/db.ts`.
- Views take data as props and stay synchronous, so tests render them directly;
  route files load the data.

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
- Hosting/deploy target.
