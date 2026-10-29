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

## Decided in Phase 3

- **Staff auth:** one shared password (`STAFF_PASSWORD`) and an
  HMAC-SHA256-signed, 8-hour session cookie (`SESSION_SECRET`, 32+ chars),
  built on `node:crypto` with no auth library. `src/proxy.ts` (Next.js 16's
  rename of `middleware.ts`) redirects signed-out visitors from `/dashboard/*`
  to `/login?next=…`; the real gate is `requireStaff()`, called first in
  every staff page and staff Server Action. Missing or weak config fails
  closed: staff pages error, agent pages keep working.
- **Passwords and sessions:** `STAFF_PASSWORD` needs 12+ characters (no
  rate limiting in v1). Sessions are signed with `HMAC(SESSION_SECRET,
STAFF_PASSWORD)` as the key, so changing the password, or rotating the
  secret, signs everyone out. Sign-out only clears the browser's cookie.
- **Staff detail pages** load through `staffLoader(find)` in
  `src/lib/auth/staff.ts`: session check, `connection()`, lookup or
  `notFound()`, cached per request for `generateMetadata` and the page.
- **Session reads and Cache Components:** read `cookies()` first, then
  `await connection()` before reading the clock. Cookies alone don't make
  `new Date()` safe, and checking config before reading cookies would let
  the build prerender a "signed out" answer.
- **Booking status:** `booked` → `cancelled` (before the start) or
  `attended`/`no_show` (after); those three are final. Status changes are
  conditional updates on the status the caller saw. The one-booking-per-slot
  unique index is partial (`WHERE status <> 'cancelled'`), so cancelling
  frees the slot and stays race-safe. Each booking stores its own
  `duration_minutes`, and the overlap check uses each booking's own range, so
  editing a therapy's length (either way) never lets sessions overlap.
- **Catalog edits:** slugs are made once from the name (`src/lib/catalog/`
  `slugify`, plus `-2`, `-3`… via `pickFreeSlug`) and never change. Names are
  unique per table ignoring case (`lower(name)` indexes). A therapy can't be
  deleted while it has bookings or is an ailment's only therapy. Expected
  constraint errors become results via `src/lib/db/errors.ts`; note that
  SQLite reports `ON DELETE RESTRICT` as `SQLITE_CONSTRAINT_TRIGGER`.
- **Seed:** insert-only (`onConflictDoNothing`), linking only ailments it
  creates, so reseeding a live database never overwrites staff edits.
- **Migrations:** always read drizzle-kit's SQL before committing; three were
  hand-fixed. `0004`'s table rebuild copied new columns from the old table;
  `0006` added a `NOT NULL` column with no default (SQLite refuses that on a
  table with rows); `0005` renames case-duplicate names before creating
  unique indexes. `tests/lib/db/migrate.test.ts` upgrades Phase 2 databases.
  `npm run db:generate` formats drizzle-kit's output with Prettier.
- **Irreversible actions** (cancel, delete) confirm through
  `ConfirmDisclosure`, a native `<details>`: no JavaScript needed.
- **Deploy target:** a Docker image (`Dockerfile`) running the Next.js
  standalone server, built only when `STANDALONE_BUILD=1` (`next start`
  doesn't support standalone). SQLite lives on a volume at `/app/data`; the
  entrypoint runs the esbuild-bundled migrator (`npm run build:scripts`) on
  every start. Runs as non-root; `.env` never enters the image. Health:
  `GET /api/health`. HTTPS is required in front (the cookie is `Secure`).
- **CI:** GitHub Actions runs lint, format, tests, and the build, then builds
  and smoke-tests the image. Node is pinned in `.nvmrc`.

## Project conventions

Every phase follows this layout. Update this section when a convention changes.

| Directory                | Holds                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `src/app/`               | Routing only: thin `page.tsx`/`layout.tsx` files, grouped by audience                     |
| `src/app/(site)/`        | Public pages, wrapped in `MainLayout`                                                     |
| `src/views/<page-name>/` | Page components rendered by the matching route                                            |
| `src/components/<area>/` | Shared UI components (`ui/` holds generic building blocks)                                |
| `src/lib/`               | Shared constants and helpers                                                              |
| `src/lib/db/`            | **All DB code**: schema, client, query functions, migrator, seed                          |
| `src/lib/<area>/`        | Domain logic and Server Actions (`auth/`, `booking/`, `catalog/`), no Drizzle imports     |
| `src/app/(staff)/`       | Staff pages, wrapped in `MainLayout`; each calls `requireStaff()`                         |
| `src/app/api/`           | Route Handlers (e.g. `health/`)                                                           |
| `src/proxy.ts`           | Early redirect of signed-out visitors from `/dashboard/*`                                 |
| `drizzle/`               | Generated SQL migrations (`npm run db:generate`); committed                               |
| `scripts/`               | CLI entry points run with `tsx` (e.g. `db:migrate`, `db:seed`), and the Docker entrypoint |
| `build/`                 | Generated bundles (`build/scripts/*.cjs`); gitignored                                     |
| `src/styles/`            | **All CSS**: `globals.css` plus CSS Modules                                               |
| `src/styles/components/` | CSS Modules for `src/components/` (`<area>.module.css`)                                   |
| `src/styles/views/`      | CSS Modules for `src/views/` (`<page>.module.css`), when needed                           |
| `tests/`                 | **All tests**, mirroring `src/` (e.g. `tests/views/home/…`)                               |
| `public/`                | Static assets served as-is (images, icons) — no CSS                                       |

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
  `src/components/ui/` components (`PageHeader`, `Section`, `Button` with
  its `secondary`/`danger` variants, `ArrowLink`, `BackLink`, `DetailList`,
  `TextField`, `TextArea`, `CheckboxGroup`, `FormMessage`,
  `ConfirmDisclosure`, and the `useFocusFirstError` hook) instead of
  repeating class strings or form logic.
- Staff pages and staff Server Actions call `requireStaff()` before reading
  or changing anything; `proxy.ts` is only the early redirect.
- Every page that reads per-request data (calls `connection()`, or reads the
  session via `requireStaff()`/`isStaffSignedIn()`) has a
  `loading.tsx` in its own folder that re-exports `LoadingPage` from
  `src/views/loading/`. A boundary in a parent folder or route group isn't
  enough: on a client navigation the parent segments stay mounted, so only a
  boundary at the page's own segment can show while it loads, and Next.js dev
  reports the route as blocking ("uncached data … outside of `<Suspense>`").
  Enforced by `tests/conventions.test.ts`.
- Each route group has one `error.tsx` that re-exports `ErrorBoundary` from
  `src/views/error/`.
- URL paths live in `src/lib/routes.ts` (`ROUTES`, `ailmentPath()`,
  `bookTherapyPath()`, `bookingPath()`); never type a path string in a
  component.
- UI code imports row types from `src/lib/db/types.ts`, never the schema.
- Don't create `src/pages/` — it's reserved by the Next.js Pages Router.
- Tests are named `*.test.ts(x)` and import source via `@/…` and test helpers
  via `@tests/…`. Route and action tests mock Next.js with the stand-ins in
  `tests/helpers/` (`next.ts`, `auth.ts` `headers`, `db.ts` `client`) and
  sign in with `signInStaff()` rather than mocking `requireStaff()`.
- Server Actions are named for what staff do (`addAilment`, `editAilment`,
  `removeAilment`); queries for what they do to rows (`createAilment`,
  `updateAilment`, `deleteAilment`). The split also avoids import clashes.
- Dependencies point one way: `src/lib/<area>/` may import `src/lib/db/`, but
  `src/lib/db/` imports nothing from other `src/` areas (enforced by
  `tests/conventions.test.ts`).
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
- CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull
  request, then builds and smoke-tests the Docker image; a PR merges only
  when CI is green.

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

## Known limitations

- **Without JavaScript,** a server-side error (a refused delete, a taken
  name, "pick at least one therapy") re-renders the form without its message
  or typed values. With JavaScript, every error shows inline.
- **No success messages:** saves, deletes, and status changes redirect
  without a confirmation note; an expired session during a form submit lands
  on `/login` without returning to that page afterwards.
- **Seeding** (`db:seed`, `docker compose run --rm app seed`) is for a fresh
  database: it adds back seed rows that staff have deleted.
- **"Unique ignoring case"** only folds ASCII letters (SQLite's `lower()`), so
  "Café" and "CAFÉ" can both exist.
- **Ops:** the image's `HEALTHCHECK` assumes port 3000; the base image and
  GitHub Actions are pinned by tag, not digest; one container per volume
  (migrations run on start).

## Deferred decisions

- Component library (if any) on top of Tailwind.
- Where the image runs (a cloud provider or VM), TLS termination, and
  continuous deployment. The image itself is decided (Phase 3).
- Per-staff accounts, roles, and login rate limiting.
