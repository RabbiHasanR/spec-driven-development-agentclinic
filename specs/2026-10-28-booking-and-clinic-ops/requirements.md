# Phase 2 — Booking and Clinic Operations: Requirements

## Context

Roadmap Phase 2: agents book care, staff run the schedule, and the whole site
gets polished. It completes the mission's success path ("I have an ailment" →
"appointment booked") and gives staff the "every booking at a glance" view.
See `specs/mission.md`, `specs/roadmap.md`, and `specs/tech-stack.md`.

Phase 1 delivered the read-only catalog: `ailments`, `therapies`, the
`ailment_therapy` link, `/ailments` and `/ailments/[slug]`, and the SQLite +
Drizzle data layer. Phase 2 adds the app's first writes.

## Scope

In scope:

- **Data layer:** an `appointments` table, a migration, and query functions
  for booking and listing appointments.
- **Time slots:** fixed, generated slots (see Data model). An agent can't book a
  slot that is already taken for that therapy.
- **Booking page** at `/therapies/[slug]/book`: therapy summary, a list of open
  slots, and a form (agent name, email, slot). Reached from a "Book" link on
  each therapy card.
- **Booking action:** a Server Action that validates input, re-checks the slot,
  inserts the appointment, and redirects to the confirmation page. Errors are
  shown inline next to the form and keep the entered values.
- **Confirmation page** at `/bookings/[reference]`: therapy, date/time, agent
  name, and the booking reference. An unknown reference shows a not-found page
  (`noindex`), like an unknown ailment slug.
- **Staff dashboard** at `/dashboard`: every booking (upcoming first), with
  therapy, slot, agent name, and email, plus an overview strip (bookings today,
  upcoming total, busiest therapy).
- **Navigation:** header link to `/dashboard`; the home page's booking item
  links into the catalog.
- **Polish:** consistent styling across all pages, loading and empty states on
  every data page, and a cross-device pass at 320px, 768px, and 1280px.
- **Responsive UI** per
  [tech-stack.md → Responsive design](../tech-stack.md#responsive-design):
  - Booking form: full-width fields, 44px tap targets, `type="email"`, slots
    as large radio options.
  - Bookings table: reflows into cards below `md`; no page-level horizontal
    scroll.
- Vitest tests for slots, queries, the booking action, and views.

Out of scope:

- Staff authentication (the dashboard is open in v1, like the rest of the demo).
- Cancelling, rescheduling, or editing bookings.
- Email or other notifications, payments, and calendars (mission → Later).
- Staff editing of ailments, therapies, or opening hours.
- Time zones other than the clinic's (see Decisions).
- Playwright or other browser E2E tests.

## Data model

| Table          | Columns                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `appointments` | `id` (pk), `reference` (unique), `therapy_id` (fk → therapies, restrict), `starts_at`, `agent_name`, `agent_email`, `created_at` |

- Unique index on `(therapy_id, starts_at)`: the database, not just the app,
  prevents double booking.
- `starts_at` and `created_at` are ISO 8601 UTC strings (`text`), so they sort
  correctly and stay portable to Postgres.
- `reference` is a short random code (e.g. `AC-7F3K9Q`) used in the
  confirmation URL, so bookings can't be listed by guessing sequential IDs.
- The therapy foreign key is `restrict`: deleting a therapy with bookings fails
  instead of silently dropping appointments. The seed never deletes therapies.

Slots:

- Weekdays, on the hour, from 09:00 clinic time; every session ends by 17:00.
- Slots are spaced by the therapy's duration rounded up to whole hours, so
  sessions never overlap: a 30–60 minute therapy gets 09:00–16:00, and the
  90-minute Cooldown Retreat gets 09:00, 11:00, 13:00, and 15:00.
- The booking window is the next 14 days, starting from the next full hour.
- Each therapy has its own schedule: a slot is open when no appointment exists
  for that therapy at that start time.
- Slot generation is a pure function of "now", so tests pass a fixed clock.

## Decisions

| Decision         | Choice                                                              | Why                                                                    |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Scope            | Booking, dashboard, and polish in one spec                          | Matches the roadmap's single Phase 2                                   |
| Slot model       | Generated fixed hourly slots, per therapy                           | Realistic and testable; no free-form times to validate                 |
| Double booking   | Unique `(therapy_id, starts_at)` index; action catches the conflict | Race-safe: two agents submitting at once can't both win                |
| Agent identity   | Name + email on the form; no accounts                               | Enough for staff to contact the agent; auth is out of v1 scope         |
| Mutation         | Server Action with `useActionState` for inline errors               | Next.js-native form handling; works without client JS, progressively   |
| Validation       | Shared validator in `src/lib/booking/`, used by the action          | One place for the rules; tested without rendering                      |
| Confirmation URL | `/bookings/[reference]` with a random reference                     | Shareable but not enumerable                                           |
| Time zone        | Clinic time zone constant (`CLINIC_TIME_ZONE`); stored as UTC       | One clinic in v1 (no multi-clinic); display is consistent for everyone |
| Dashboard access | Public route under a `(staff)` route group, no auth                 | Demo app; the group keeps staff pages separate for later auth          |
| Dashboard layout | Table at `md`+, cards below `md`                                    | Meets the responsive standard without horizontal page scroll           |
| Freshness        | Booking page and dashboard read per request (`connection()`)        | Open slots and bookings must be current                                |
| Task ordering    | Vertical slices: booking → dashboard → polish                       | Each slice is demoable on its own                                      |
| Validation       | Vitest + manual 320/768/1280 pass                                   | Same as Phase 1; no new tooling                                        |

## Constraints

- Follow [tech-stack.md → Project conventions](../tech-stack.md#project-conventions):
  routes in `src/app/`, pages in `src/views/`, DB code only in `src/lib/db/`,
  tests in `tests/`, colors only from `--site-*` tokens, paths only from
  `src/lib/routes.ts`.
- Read the relevant guides in `node_modules/next/dist/docs/` before writing
  route or form code (notably `07-mutating-data.md` and the Server Actions /
  `redirect` references); this Next.js version has breaking changes.
- The booking action re-validates everything on the server; never trust the
  submitted slot list.
- No secrets committed; TypeScript strict mode.
- Keep the phase small: no auth, no cancellation, no notifications.
