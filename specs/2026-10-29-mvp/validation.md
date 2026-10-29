# Phase 3 — MVP: Validation

`mvp` is mergeable into `main` when **all** of the following pass on a clean
checkout: `npm ci`, copy `.env.example` to `.env` and fill in
`STAFF_PASSWORD` and `SESSION_SECRET`, then
`npm run db:migrate && npm run db:seed`. This phase's migrations must also
apply cleanly to an existing Phase 2 database, with every booking intact and
set to `booked`.

## Automated checks

| Check            | Command                | Pass criteria                         |
| ---------------- | ---------------------- | ------------------------------------- |
| Production build | `npm run build`        | Exits 0, no type errors               |
| Lint             | `npm run lint`         | Exits 0, no errors or warnings        |
| Formatting       | `npm run format:check` | Exits 0                               |
| Tests            | `npm test`             | All tests pass, including those below |
| CI               | GitHub Actions on PR   | Every job green on the final commit   |
| Docker image     | `docker build .`       | Builds (also run as a CI job)         |

### Required tests

Staff auth:

- `verifySession()` accepts a freshly signed token and rejects expired,
  tampered, and wrong-secret tokens.
- Auth config is "misconfigured" when `STAFF_PASSWORD` or `SESSION_SECRET` is
  missing, or the secret is shorter than 32 characters.
- `safeNextPath()` keeps `/dashboard/…` paths and replaces external URLs,
  `//host` paths, and anything outside `/dashboard` with `/dashboard`.
- `signIn` with the right password sets an `httpOnly`, `sameSite=lax` cookie
  and redirects; with a wrong password it sets nothing and returns
  "Incorrect password".
- `signOut` clears the cookie.
- `requireStaff()` redirects without a valid session.
- Every staff Server Action rejects a call without a session and changes
  nothing.
- The header shows "Dashboard" and "Sign out" only when signed in.

Booking management:

- The migration turns existing appointments into `booked` and keeps them all.
- `allowedChanges()` (fixed clock): cancel only before start; attended
  and no-show only after start; none from a final state.
- `updateAppointmentStatus()` fails when the current status isn't the
  expected one (two staff clicks can't both apply).
- A cancelled slot is open again and can be booked by another agent; the
  database still rejects two active bookings for the same slot.
- `summarizeSchedule()` ignores cancelled and no-show bookings.
- The staff booking page shows only the allowed actions; an unknown
  reference renders a `noindex` not-found page.
- The agent's confirmation page shows "Cancelled" for a cancelled booking.

Catalog management:

- `slugify()` handles case, accents, and punctuation; a clashing slug gets a
  numeric suffix.
- Validators enforce the field limits, the 15–240 minute duration in steps of
  15, and at least one therapy per ailment.
- Creating and editing an ailment or therapy saves it; editing never changes
  its slug; duplicate names (any case) return `name-taken`.
- `setAilmentTherapies()` replaces the links in one transaction.
- Deleting an ailment removes its links; deleting a therapy with bookings
  returns `has-bookings`; deleting an ailment's only therapy returns
  `sole-therapy`.
- Reseeding doesn't overwrite a staff-edited row.
- The catalog list and both forms render, show inline errors, and keep the
  entered values.

Ship-readiness:

- `GET /api/health` returns 200 `{"status":"ok"}` with a working DB and 503
  when the DB query fails.

Conventions:

- `tests/conventions.test.ts` still passes: no Drizzle imports outside
  `src/lib/db/`, no hard-coded paths, no raw palette colors, and a
  `loading.tsx` beside every per-request page (including the new staff
  pages).
- Every new page has a `<Page> · AgentClinic` title; staff pages and
  `/login` are `noindex`.

## Manual checks

Run `npm run build && npm start` and check in a current browser:

1. **Auth:** signed out, `/dashboard` and every `/dashboard/…` page
   redirects to `/login`. A wrong password shows the error; the right one
   returns to the page you asked for. "Sign out" ends the session. With
   `SESSION_SECRET` removed, staff pages show the error page and agents can
   still book.
2. **Patient flow:** book a slot as an agent; as staff, cancel it; the slot
   is bookable again, and the agent's confirmation page says "Cancelled".
   Mark a past booking attended and another a no-show; the badges and
   overview update.
3. **Catalog:** add a therapy, link it to a new ailment, and book it as an
   agent, all without touching the seed. Edit a name (the URL stays the
   same). Try to delete a booked therapy and an ailment's only therapy (both
   refused).
4. **Responsive:** every new page at **320px, 768px, and 1280px**, in light
   and dark color schemes: no horizontal page scroll, tap targets ≥ 44px,
   the catalog lists reflow into cards below 768px, and the forms are easy
   to complete on a phone.
5. **Keyboard:** login, status buttons, the confirmation dialogs, and the
   catalog forms work with the keyboard only, with visible focus rings.
6. **Docker:** `docker compose up --build` on a fresh volume migrates the
   database and serves the app; `/api/health` is 200; restarting the
   container keeps bookings; the container doesn't run as root.
7. **Polish:** no console errors; Lighthouse performance and accessibility
   ≥ 90 on `/login`, `/dashboard`, and the catalog form.

## Done means

- All automated checks pass locally and CI is green on the PR's final
  commit.
- All manual checks are ticked off.
- `specs/tech-stack.md`, `README.md`, `specs/roadmap.md`, and the changelog
  are updated.
- No secrets, `.env` files, or database files are committed.
