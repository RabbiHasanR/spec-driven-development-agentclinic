# Phase 1 — Care Catalog: Requirements

## Context

Roadmap Phase 1: read-only browsing, where agents find an ailment and the
therapies that treat it. This is the first half of the mission's success path
("I have an ailment" → "appointment booked"). Phase 2 adds booking on top of
this catalog. See `specs/mission.md`, `specs/roadmap.md`, and
`specs/tech-stack.md`.

Phase 0 delivered the Next.js skeleton, `MainLayout`, the `src/`/`tests/`
conventions, and the responsive design standard. Phase 1 has to settle the
deferred ORM and database decisions, because it is the first phase with data.

## Scope

In scope:

- **Data layer:** SQLite database accessed through Drizzle ORM, with schema,
  migrations, and a seed script.
- **Ailments:** model and seed a few (about 5–6) agent-themed ailments.
- **Therapies:** model and seed therapies (about 6–8), linked to ailments
  many-to-many.
- **Ailment list page** at `/ailments`: every ailment as a card with its name
  and short summary, linking to its detail page.
- **Ailment detail page** at `/ailments/[slug]`: name, full description, and
  the therapies that treat it as cards.
- **Not found:** an unknown slug renders an "Ailment not found" page marked
  `noindex`. Its HTTP status is 200, not 404: the `loading.tsx` fallback starts
  the stream before `notFound()` runs, and Cache Components rules out
  `dynamicParams = false` (see Decisions).
- **Page titles:** `<Page> · AgentClinic` via a root title template, e.g.
  "Prompt Fatigue · AgentClinic".
- **Errors:** an unexpected error (e.g. a missing database) shows a friendly
  error page with a retry button.
- **Navigation:** header link to `/ailments`; the home page's "Browse
  ailments" item links to `/ailments`.
- **Responsive UI** per
  [tech-stack.md → Responsive design](../tech-stack.md#responsive-design):
  - Ailment list: a single column on phones, a multi-column grid on wider screens.
  - Therapy cards: stacked on phones, side by side on wider screens.
- Vitest tests for data access and views.

Out of scope:

- Standalone therapy pages (`/therapies/[slug]`).
- Search, filtering, sorting, pagination.
- Creating or editing ailments and therapies (no admin UI, no write APIs).
- Appointments, booking, and the staff dashboard (Phase 2).
- Postgres, hosting, and CI.
- Full visual polish (Phase 2 → Polish).

## Data model

| Table             | Columns                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| `ailments`        | `id` (pk), `slug` (unique), `name`, `summary`, `description`                 |
| `therapies`       | `id` (pk), `slug` (unique), `name`, `summary`, `duration_minutes`            |
| `ailment_therapy` | `ailment_id` (fk), `therapy_id` (fk, indexed); pk `(ailment_id, therapy_id)` |

- Slugs are lowercase kebab-case and are the public URL identifier.
- Every seeded ailment has at least one therapy, and at least one therapy
  treats more than one ailment (this exercises the many-to-many link).
- The seed is idempotent: running it twice leaves the same data. It updates
  seeded rows and replaces each seeded ailment's links; rows removed from the
  seed data are left in place, so reseeding never cascades into other data.

## Decisions

| Decision      | Choice                                                                     | Why                                                                             |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ORM           | Drizzle ORM + `drizzle-kit`                                                | TS-first, light, SQL-like; resolves the deferred ORM decision                   |
| Database      | SQLite (file DB, `better-sqlite3` driver)                                  | No infrastructure; supports Phase 2 writes; Drizzle eases a later Postgres move |
| DB location   | Path from `DATABASE_URL` env var; `.env.example` committed                 | No hardcoded paths or secrets; the DB file is gitignored                        |
| Relationship  | Many-to-many via `ailment_therapy` join table                              | Therapies like "context-window decompression" treat several ailments            |
| Routes        | `/ailments`, `/ailments/[slug]`                                            | Matches the roadmap; slugs are readable and stable                              |
| Rendering     | Server Components query the data layer directly                            | SSR (Steve); no API layer is needed for read-only pages                         |
| Data access   | Query functions in `src/lib/db/` (e.g. `listAilments`, `getAilmentBySlug`) | Views never import Drizzle directly; one place to test queries                  |
| Test DB       | In-memory SQLite with migrations and seed applied                          | Fast and isolated; tests real queries, not mocks                                |
| Task ordering | Two vertical slices (ailments, then therapies)                             | Each slice is demoable on its own                                               |
| Freshness     | Both pages read per request (`connection()`) inside `loading.tsx`          | Catalog edits show without a rebuild; the build never needs a database          |
| Unknown slug  | Streamed not-found page (HTTP 200 + `noindex`)                             | A real 404 would need a DB lookup in Proxy; not worth it for v1                 |
| DB creation   | Only `db:migrate` creates the file; the app refuses a missing one          | A mistyped `DATABASE_URL` fails loudly instead of creating an empty DB          |
| Migrations    | Run with foreign keys off, then `foreign_key_check`                        | SQLite ignores the pragma inside Drizzle's transaction; rebuilds would cascade  |

## Constraints

- Follow [tech-stack.md → Project conventions](../tech-stack.md#project-conventions):
  routes in `src/app/(site)/`, pages in `src/views/`, tests in `tests/`, CSS in
  `src/styles/`.
- Read the relevant guides in `node_modules/next/dist/docs/` before writing
  route code (this Next.js version has breaking changes, e.g. async `params`).
- Database code is server-only and never bundled into client code. Only
  `src/lib/db/client.ts` imports `server-only`: `connection.ts`, the queries,
  and the seed stay importable by the `tsx` scripts and tests, and only
  `src/lib/db/` may import Drizzle (enforced by `tests/conventions.test.ts`).
- TypeScript strict mode; no secrets committed.
- Keep the phase small: read-only catalog only.
