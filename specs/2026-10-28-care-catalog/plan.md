# Phase 1 — Care Catalog: Plan

## 1. Data layer setup

1. Read the Next.js guides on dynamic routes, `notFound`, and server-only code
   in `node_modules/next/dist/docs/`.
2. Add `drizzle-orm`, `better-sqlite3`, `drizzle-kit`, and
   `@types/better-sqlite3`.
3. Add `src/lib/db/connection.ts` (`createDb`, `getDatabasePath` from
   `DATABASE_URL`) and `src/lib/db/client.ts` (the app's server-only `getDb()`).
4. Add `drizzle.config.ts`, `.env.example` (`DATABASE_URL=data/agentclinic.db`),
   and gitignore the DB file.
5. Add scripts: `db:generate`, `db:migrate`, `db:seed`.
6. Add a test helper in `tests/helpers/` that builds an in-memory DB with
   migrations and seed applied.

## 2. Browse ailments (slice 1)

1. Add the `ailments` table to `src/lib/db/schema.ts`; generate the migration.
2. Add seed data for about 5–6 agent-themed ailments in `src/lib/db/seed/`
   (idempotent upsert keyed on slug).
3. Add queries in `src/lib/db/ailments.ts`: `listAilments()` (ordered by name)
   and `getAilmentBySlug(slug)`.
4. Add the list route `src/app/(site)/ailments/page.tsx` → view
   `src/views/ailments/ailments-page.tsx`, built from a shared `AilmentCard` in
   `src/components/catalog/`.
5. Add the detail route `src/app/(site)/ailments/[slug]/page.tsx` → view
   `src/views/ailment-detail/ailment-detail-page.tsx`; call `notFound()` for an
   unknown slug; set per-page metadata (title `<ailment> · AgentClinic`).
6. Responsive grid: one column on phones, two at `sm`, three at `lg`.
7. Link the header and the home page's "Browse ailments" item to `/ailments`.
8. Tests: ailment queries, the list view, the detail view, and the not-found
   path (view and route level).

## 3. Discover therapies (slice 2)

1. Add the `therapies` and `ailment_therapy` tables; generate the migration.
2. Seed about 6–8 therapies and their links. Every ailment gets at least one
   therapy, and at least one therapy is shared across ailments.
3. Add `listTherapiesForAilment(ailmentId)` in `src/lib/db/therapies.ts`, or
   have `getAilmentBySlug` return the ailment with its therapies.
4. Add a `TherapyCard` (name, summary, duration) in `src/components/catalog/`.
5. Render a "Therapies" section on the ailment detail page; therapy cards stack
   on phones and sit side by side at `md`+. Show an empty state if an ailment
   has none.
6. Tests: the therapy query (including the shared-therapy case), the
   `TherapyCard`, and the detail page's therapies section.

## 4. Verify and document

1. Run every check in `validation.md`, including the manual 320/768/1280 pass.
2. Update `specs/tech-stack.md`: ORM (Drizzle) and database (SQLite) are
   decided; add `src/lib/db/` to the project conventions.
3. Update `README.md`: env setup, the `db:*` scripts, and the new routes.
4. Mark Phase 1 complete in `specs/roadmap.md`; add a changelog entry.
