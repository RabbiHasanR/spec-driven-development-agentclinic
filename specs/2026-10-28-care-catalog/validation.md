# Phase 1 — Care Catalog: Validation

Phase 1 is mergeable when **all** of the following pass on a clean checkout:
`npm ci`, copy `.env.example` to `.env`, then `npm run db:migrate && npm run db:seed`.

## Automated checks

| Check            | Command                | Pass criteria                         |
| ---------------- | ---------------------- | ------------------------------------- |
| Production build | `npm run build`        | Exits 0, no type errors               |
| Lint             | `npm run lint`         | Exits 0, no errors or warnings        |
| Formatting       | `npm run format:check` | Exits 0                               |
| Tests            | `npm test`             | All tests pass, including those below |

### Required tests

Data layer (in-memory SQLite, real migrations and seed):

- `listAilments()` returns every seeded ailment, ordered by name.
- `getAilmentBySlug()` returns the right ailment and its therapies; it returns
  nothing for an unknown slug.
- A therapy linked to two ailments appears on both.
- The seed is idempotent: running it twice leaves the row counts unchanged.

Views:

- The ailments list renders one card per ailment, each linking to
  `/ailments/<slug>`.
- The ailment detail page renders the name, description, and its therapy cards
  (name, summary, duration).
- The detail page shows an empty state when an ailment has no therapies.
- The header contains a link to `/ailments`.
- The home page's "Browse ailments" item links to `/ailments`.
- Existing Phase 0 tests (home page, layout, conventions) still pass.

## Manual check

1. Run `npm run dev` and open `http://localhost:3000`.
2. From home, follow "Browse ailments" to `/ailments`; every seeded ailment is
   listed.
3. Open an ailment: its description and matching therapies show, and the tab
   title is the ailment's name.
4. Visit `/ailments/does-not-exist`: a 404 page renders.
5. In devtools device mode:
   - **320px:** ailments are in a single column, therapy cards are stacked, and
     there is no horizontal scroll.
   - **768px:** the ailment grid is multi-column and therapy cards sit side by side.
   - **1280px:** the layout stays capped at max-width, and spacing is comfortable.
   - Every card and link is a tap target of at least 44px; nothing relies on hover.
6. The browser console shows no errors.

## Repo hygiene

- The DB file and `.env` are not committed; `.env.example` is.
- Migrations are committed under the Drizzle output directory.
- No Drizzle or `better-sqlite3` imports outside `src/lib/db/`, and none in
  client components.
- All new tests are under `tests/`, and all new CSS is under `src/styles/`.
- `specs/tech-stack.md`, `README.md`, `specs/roadmap.md`, and the changelog are
  updated.
- Commits follow conventional commit format.
