# Phase 3 — MVP: Plan

All work is committed to the `mvp` branch, one vertical slice at a time. Each
slice ends with `npm test`, `npm run lint`, and `npm run format:check` green,
and a conventional commit.

## 1. Groundwork and CI (slice 0)

1. Read the Next.js guides listed in `requirements.md → Constraints`
   (authentication, authentication with Cache Components, `proxy.ts`,
   self-hosting, `output: "standalone"`).
2. Pin the Node version in `.nvmrc` and `package.json` `engines`.
3. Add `.github/workflows/ci.yml`: checkout, `setup-node` from `.nvmrc` with
   npm cache, `npm ci`, lint, format check, test, build. (The Docker build job
   comes in slice 4.)
4. Add the new env vars to `.env.example` with comments: `STAFF_PASSWORD`,
   `SESSION_SECRET` (with a generation hint, e.g. `openssl rand -base64 32`).
5. Push `mvp` and open a draft PR to `main` so CI runs on every later commit.

## 2. Staff auth (slice 1)

1. Add `src/lib/auth/session.ts`: pure `signSession(expiresAt, secret)` and
   `verifySession(token, secret, now)` (HMAC-SHA256, constant-time compare,
   rejects expired or tampered tokens), and `readAuthConfig(env)` that
   returns the config or a "misconfigured" result (missing values, secret
   under 32 characters).
2. Add `src/lib/auth/staff.ts` (server-only): `getStaffSession()` reads and
   verifies the cookie; `requireStaff()` redirects to `/login` when there is
   no valid session and throws when auth is misconfigured.
3. Add Server Actions in `src/lib/auth/actions.ts`: `signIn` (constant-time
   password check, sets the cookie, redirects to a safe `next`) and `signOut`
   (clears the cookie, redirects home). Add `safeNextPath(next)` as a pure
   helper.
4. Add `proxy.ts` matching `/dashboard/:path*`: redirect to
   `/login?next=…` when the cookie doesn't verify.
5. Add the route `src/app/(staff)/login/page.tsx` → view `src/views/login/`,
   with a client `LoginForm` in `src/components/auth/` (`useActionState`,
   full-width field, 44px button, `autocomplete="current-password"`).
   `noindex`.
6. Call `requireStaff()` in the dashboard route. Header: show "Dashboard"
   and a "Sign out" button only when signed in.
7. Add `ROUTES.login` to `src/lib/routes.ts`.
8. Tests: sign/verify (valid, expired, tampered, wrong secret), config
   checks, `safeNextPath` (rejects external URLs, `//host`, and paths outside
   `/dashboard`), the actions (right and wrong password, cookie flags,
   redirect), `requireStaff()` with and without a session, the login view,
   and the header in both states.

## 3. Booking management (slice 2)

1. Schema: add `status` (with a `CHECK` constraint) and `status_changed_at`
   to `appointments`; replace the unique slot index with a partial one
   (`WHERE status <> 'cancelled'`). Generate the migration; confirm it applies
   to a Phase 2 DB with bookings, and that existing rows become `booked`.
2. Export `AppointmentStatus` from `src/lib/db/types.ts`.
3. Add pure `allowedTransitions(appointment, now)` in
   `src/lib/booking/status.ts` (cancel only before start; attended or no-show
   only after start; final states have none).
4. Queries in `src/lib/db/appointments.ts`: `updateAppointmentStatus(db,
reference, from, to, now)` (a conditional update on the current status, so
   two staff clicks can't both apply); make `listBookedSlots()` and the
   overlap check ignore cancelled rows.
5. Server Action `changeBookingStatus` in `src/lib/booking/actions.ts`:
   `requireStaff()`, re-check the transition against `now`, update, redirect
   back to the detail page.
6. Route `src/app/(staff)/dashboard/bookings/[reference]/page.tsx` → view
   `src/views/staff-booking/`, with a `loading.tsx` and not-found handling;
   buttons for allowed transitions only; cancel confirmation.
7. Dashboard: link each row to its detail page; add a `StatusBadge` in
   `src/components/dashboard/`; count only `booked` and `attended` in
   `summarizeSchedule()`.
8. Confirmation page: show "Cancelled" for a cancelled booking.
9. Add `staffBookingPath(reference)` to `src/lib/routes.ts`.
10. Tests: transition rules with a fixed clock, the migration on a Phase 2
    DB, the conditional update (stale "from" status fails), a cancelled slot
    opening up and being re-bookable, the action with and without a session,
    the detail view, badges, updated overview counts, and the confirmation
    page's cancelled state.

## 4. Catalog management (slice 3)

1. Change the seed to insert missing rows only (`onConflictDoNothing`), and
   update the Phase 1 seed tests to match.
2. Add a unique index on `lower(name)` for `ailments` and `therapies`;
   generate the migration.
3. Add pure helpers in `src/lib/catalog/`: `slugify(name)`,
   `validateAilment(input, therapyIds)`, and `validateTherapy(input)` (field
   limits; duration 15–240, multiple of 15).
4. Queries in `src/lib/db/ailments.ts` and `src/lib/db/therapies.ts`:
   create (picks a free slug, adding `-2`, `-3`, … on clashes), update,
   delete, and `setAilmentTherapies(db, ailmentId, therapyIds)` in one
   transaction. Map unique-name and `restrict` errors to results
   (`name-taken`, `has-bookings`, `sole-therapy`).
5. Server Actions in `src/lib/catalog/actions.ts`: create, update, and delete
   for each, all calling `requireStaff()` and re-validating.
6. Routes and views under `src/app/(staff)/dashboard/catalog/`: the catalog
   list, and new/edit forms for ailments and therapies, each with a
   `loading.tsx` and not-found handling. Shared form fields come from
   `src/components/ui/` (`TextField`, `FieldError`); add a `TextArea` and a
   `CheckboxGroup` there if needed. Deletes ask for confirmation.
7. Link the catalog from the dashboard; add catalog path builders to
   `src/lib/routes.ts`.
8. Tests: slugify (accents, punctuation, clashes), validators, queries
   (create, update, slug stability, unique names, link replacement, delete
   rules), actions with and without a session, the list and form views, and
   reseeding not overwriting a staff edit.

## 5. Ship it (slice 4)

1. Set `output: "standalone"` in `next.config.ts`; confirm `npm start` still
   works for local production runs.
2. Add `GET /api/health` (`src/app/api/health/route.ts`): runs `SELECT 1`
   through a `src/lib/db/` query function, returns 200 or 503, never cached.
3. Make the migrator runnable inside the image without `tsx` (e.g. bundle
   `scripts/db-migrate.ts` to a single JS file during the image build).
4. Add a multi-stage `Dockerfile` (deps → build → slim runtime, non-root user,
   `/app/data` volume, `HEALTHCHECK` on `/api/health`) and an entrypoint that
   migrates, then starts the server. Add `.dockerignore` (`node_modules`,
   `.next`, `data`, `.env`).
5. Add `docker-compose.yml` with the data volume and env from `.env`.
6. Add a CI job that builds the image (no push).
7. Tests: the health route (ok and failing DB).

## 6. Verify and document

1. Run every check in `validation.md`, including the manual pass and the
   Docker run.
2. Update `specs/tech-stack.md`: the auth pattern (proxy +
   `requireStaff()`), booking status rules, `src/lib/auth/` and
   `src/lib/catalog/`, new UI components, CI, and the deploy target (remove
   "Hosting/deploy target" from Deferred decisions).
3. Update `specs/mission.md` only if scope wording changed.
4. Update `README.md`: env vars, staff login, the new staff routes, and
   running with Docker.
5. Add Phase 3 — MVP to `specs/roadmap.md` and mark it complete; add a
   changelog entry.
6. Mark the PR ready for review; merge once CI is green and validation is
   ticked off.
