# Phase 3 — MVP: Requirements

## Context

Roadmap Phases 0–2 are complete: agents browse the catalog and book
appointments, and staff see every booking on `/dashboard`. Measured against
`specs/mission.md`, three promises are still unmet and the app can't ship:

- "Clinic staff manage ailments, therapies, and the appointment schedule":
  staff can only _view_ bookings; the catalog is seed-only.
- `/dashboard` shows agent names and emails to anyone (Phase 2 left auth out,
  but put staff pages in the `(staff)` route group to prepare for it).
- There is no CI and no deploy target ("Hosting/deploy target" is still a
  deferred decision in `specs/tech-stack.md`).

This phase closes those gaps so `mvp` can merge to `main` as a shippable v1.
See `specs/mission.md`, `specs/roadmap.md`, `specs/tech-stack.md`, and the
Phase 1 and Phase 2 specs.

## Scope

In scope:

- **Staff auth:** a staff login page, a signed session cookie, and logout.
  Every staff page and staff Server Action requires a session.
- **Booking management:** staff open a booking's detail page from the
  dashboard and cancel it, or mark it attended or a no-show. Cancelling
  re-opens the slot for agents.
- **Catalog management:** staff create, edit, and delete ailments and
  therapies, and choose which therapies treat each ailment.
- **Ship-readiness:** GitHub Actions CI, a production Docker image, and a
  health-check endpoint.
- **Responsive UI** for every new page, per
  [tech-stack.md → Responsive design](../tech-stack.md#responsive-design).
- Vitest tests for sessions, the new queries, actions, and views.

Out of scope:

- Per-staff accounts, roles, password reset, and login rate limiting.
- Agents cancelling or rescheduling their own bookings.
- Rescheduling or editing a booking's details (staff cancel, and the agent
  books again).
- Editing opening hours or slot rules.
- Images or rich text in the catalog.
- Notifications, billing, analytics, multi-clinic (mission → Later).
- Postgres, cloud provisioning, and continuous deployment (CI builds the
  image; nothing deploys automatically).
- Playwright or other browser E2E tests.

## Features

### Staff auth

- `/login`, in the `(staff)` route group but unprotected: a password field
  and a "Sign in" button. A wrong password shows one inline error ("Incorrect
  password") without saying more.
- One shared password in the `STAFF_PASSWORD` env var. The session cookie is
  signed with `SESSION_SECRET` (HMAC-SHA256 via `node:crypto`; no auth
  library).
- Session cookie: `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`,
  expires after 8 hours. It holds only the expiry time and its signature.
- `proxy.ts` redirects requests to `/dashboard` and its children to
  `/login?next=<path>` when the cookie is missing or invalid. After login, the
  agent returns to `next` (only same-site paths under `/dashboard` are
  accepted; anything else goes to `/dashboard`).
- The proxy is the optimistic check. The real gate is `requireStaff()`, which
  every staff page and every staff Server Action calls first, so a direct
  POST to an action without a session is rejected.
- Fail closed: if `STAFF_PASSWORD` or `SESSION_SECRET` is missing, or
  `SESSION_SECRET` is shorter than 32 characters, login is impossible and
  staff pages show the error page. Agent pages keep working.
- The header shows "Dashboard" and "Sign out" when signed in; signed-out
  visitors see no staff links.

### Booking management

- New `status` column on `appointments`: `booked` (default), `attended`,
  `no_show`, or `cancelled`, plus `status_changed_at`.
- Allowed changes:
  - `booked` → `cancelled`: only before the slot starts.
  - `booked` → `attended` or `no_show`: only once the slot has started.
  - Nothing else: `attended`, `no_show`, and `cancelled` are final.
- Cancelling frees the slot. The unique `(therapy_id, starts_at)` index
  becomes a partial index that ignores cancelled rows, and the availability
  overlap check ignores them too.
- Booking detail page at `/dashboard/bookings/[reference]`: therapy, time,
  agent name and email, status, and buttons for the allowed changes only.
  Cancelling asks for confirmation first.
- Dashboard: each booking links to its detail page and shows a status badge.
  The overview stats count only `booked` and `attended` bookings.
- The agent's confirmation page (`/bookings/[reference]`) shows "Cancelled"
  when staff have cancelled the booking.

### Catalog management

- `/dashboard/catalog`: ailments and therapies in two sections, each with
  "Add" and per-row "Edit" links. Rows reflow into cards below `md`.
- Ailment form (`/dashboard/catalog/ailments/new`, `…/[slug]/edit`): name,
  summary, description, and a checkbox list of therapies (at least one
  required, so the agent's path to booking never dead-ends).
- Therapy form (`/dashboard/catalog/therapies/new`, `…/[slug]/edit`): name,
  summary, and duration in minutes (15–240, a multiple of 15, see Decisions).
- Slugs are generated from the name on create and never change afterwards,
  so agent links and bookings stay valid. A clashing slug gets a numeric
  suffix (`prompt-fatigue-2`).
- Field limits: name 1–80 characters, summary 1–200, description 1–4000, all
  trimmed. Names are unique per table (case-insensitive).
- Delete:
  - An ailment can always be deleted; its therapy links go with it.
  - A therapy with any booking (any status) can't be deleted: the form shows
    "This therapy has bookings and can't be deleted". The `restrict` foreign
    key already enforces this; the query maps the error to a result.
  - A therapy that is the only one linked to some ailment can't be deleted
    either, for the same no-dead-end reason.
  - Deletes ask for confirmation first.
- Changing a therapy's duration doesn't move existing bookings; the Phase 2
  overlap rule already keeps new slots from overlapping them.

### Ship-readiness

- `.github/workflows/ci.yml`: on every push and pull request, run
  `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and
  `npm run build` on the project's Node version, then build the Docker image
  (build only, no push).
- Node version pinned in `.nvmrc` and `package.json` `engines`; CI reads
  `.nvmrc`.
- `Dockerfile` (multi-stage) using Next.js `output: "standalone"`. The
  database lives on a volume at `/app/data`. On start, the container runs the
  migrations, then starts the server. It runs as a non-root user.
- `docker-compose.yml` for running the production image locally, with the
  data volume and env vars from `.env`.
- `GET /api/health`: `200 {"status":"ok"}` when the database answers a
  trivial query, `503` otherwise. Not cached, no personal data.
- `.env.example` lists every env var with a comment; no real secrets.

## Data model changes

| Table          | Change                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `appointments` | Add `status` (text, not null, default `booked`) and `status_changed_at` (text).                       |
| `appointments` | Replace the unique `(therapy_id, starts_at)` index with a partial one: `WHERE status <> 'cancelled'`. |

- Existing rows migrate to `booked`.
- `status` values are a TypeScript union, checked in the domain layer and by a
  SQLite `CHECK` constraint.
- No catalog table changes: names become unique through an index on
  `lower(name)` per table.

## Decisions

| Decision             | Choice                                                             | Why                                                                                   |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Scope                | Auth, booking management, catalog management, ship-readiness       | Closes every mission promise still unmet, and makes the app deployable                |
| Auth model           | One shared staff password, env var                                 | One small clinic, a demo app; accounts and roles are a later phase                    |
| Session              | HMAC-signed, expiring cookie built on `node:crypto`                | No dependency, stateless, easy to test; no sessions table needed                      |
| Auth layering        | `proxy.ts` redirect + `requireStaff()` in every staff page/action  | The Next.js guide says not to rely on the proxy alone; actions are reachable by POST  |
| Missing secrets      | Fail closed on staff pages only                                    | A misconfigured deploy must not expose personal data, but agents can still book       |
| Staff URLs           | Everything under `/dashboard`; login at `/login`                   | One proxy matcher protects every staff page                                           |
| Booking status       | Status column with fixed transitions; no hard delete               | Keeps history for staff; "patient flow" without a workflow engine                     |
| Freeing slots        | Partial unique index ignoring cancelled rows                       | Keeps the race-safe database guarantee from Phase 2                                   |
| Slugs                | Generated once on create, then fixed                               | Agent-facing URLs and shared booking links never break                                |
| Therapy duration     | 15–240 minutes, multiple of 15                                     | Fits the slot grid (hour-rounded) and the 09:00–17:00 day                             |
| Delete rules         | Ailments always; therapies only with no bookings and no sole links | No lost bookings and no ailment without a bookable therapy                            |
| Seed vs. staff edits | Seed inserts missing rows only (`onConflictDoNothing`)             | Reseeding a live DB must not overwrite staff edits; changes Phase 1's upsert behavior |
| CI                   | GitHub Actions running the same checks as local validation         | One definition of "green", enforced on every PR                                       |
| Deploy target        | Docker image, standalone output, SQLite on a volume                | Runs anywhere; settles the deferred hosting decision without picking a cloud          |
| Migrations on deploy | Container runs them on start, before serving                       | One step to deploy; Phase 1's guard still refuses a missing DB elsewhere              |
| Task ordering        | Vertical slices on `mvp`: CI → auth → bookings → catalog → Docker  | CI guards every later slice; auth comes before the staff features that need it        |
| Validation           | Phase 2 gate + CI green on the PR                                  | No new test tooling; CI is the gate                                                   |

## Constraints

- Follow [tech-stack.md → Project conventions](../tech-stack.md#project-conventions):
  routes in `src/app/`, pages in `src/views/`, DB code only in `src/lib/db/`,
  domain logic and actions in `src/lib/<area>/` (`auth/`, `catalog/`), tests
  in `tests/`, colors only from `--site-*` tokens, paths only from
  `src/lib/routes.ts`, and a `loading.tsx` on every per-request page.
- Read the relevant guides in `node_modules/next/dist/docs/` before writing
  code, notably `02-guides/authentication.md`,
  `02-guides/authentication-with-cache-components.md`,
  `03-api-reference/03-file-conventions/proxy.md` (Next.js 16 renamed
  `middleware.ts` to `proxy.ts`), `02-guides/self-hosting.md`, and the
  `output: "standalone"` config. This Next.js version has breaking changes.
- Every Server Action re-validates its input and checks the session; never
  trust hidden form fields.
- Secrets come only from env vars; none are committed, logged, or sent to the
  client.
- TypeScript strict mode; the Phase 2 migration must still apply, and this
  phase's migration must apply to a Phase 2 database with bookings intact.
