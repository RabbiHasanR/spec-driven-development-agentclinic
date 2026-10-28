# Phase 2 — Booking and Clinic Operations: Validation

Phase 2 is mergeable when **all** of the following pass on a clean checkout:
`npm ci`, copy `.env.example` to `.env`, then `npm run db:migrate && npm run db:seed`.
The migration must also apply cleanly to an existing Phase 1 database.

## Automated checks

| Check            | Command                | Pass criteria                         |
| ---------------- | ---------------------- | ------------------------------------- |
| Production build | `npm run build`        | Exits 0, no type errors               |
| Lint             | `npm run lint`         | Exits 0, no errors or warnings        |
| Formatting       | `npm run format:check` | Exits 0                               |
| Tests            | `npm test`             | All tests pass, including those below |

### Required tests

Slots and validation (pure functions, fixed clock):

- `generateSlots()` returns only weekday, on-the-hour slots from 09:00 to
  16:00 clinic time, within the next 14 days, starting after "now".
- Weekends and past hours of today are excluded.
- `validateBooking()` rejects a blank name, an invalid email, and a slot that
  isn't open, with one error per field; it accepts valid input.

Data layer (in-memory SQLite, real migrations and seed):

- `createAppointment()` stores the booking with a unique reference.
- Booking the same therapy at the same start time twice returns a "slot
  taken" result, not a thrown error; the same time for a different therapy
  succeeds.
- `listBookedSlots()` returns only that therapy's booked slots.
- `getAppointmentByReference()` returns the booking with its therapy, and
  nothing for an unknown reference.
- `listAppointments()` puts upcoming bookings first, in time order.
- `getScheduleOverview()` returns the right counts for a fixed "now".
- Deleting a therapy that has bookings fails (`restrict`).

Booking action:

- Valid input inserts an appointment and redirects to `/bookings/<reference>`.
- Invalid input returns field errors and the submitted values without
  inserting.
- A slot taken between page load and submit returns a "slot taken" error.

Views and routes:

- Each therapy card has a "Book" link to `/therapies/<slug>/book`.
- The booking page lists open slots and omits booked ones; it shows an empty
  state when no slots are open.
- The booking form shows inline errors and keeps the entered values.
- The confirmation page shows therapy, date/time, agent name, and reference.
- Unknown therapy slugs and booking references render a `noindex` not-found
  page.
- The dashboard lists every booking with therapy, slot, name, and email, shows
  the overview stats, and shows an empty state with no bookings.
- The header contains a link to `/dashboard`.
- Every page has a `<Page> · AgentClinic` title.
- `tests/conventions.test.ts` still passes (no Drizzle imports outside
  `src/lib/db/`, no hard-coded paths, no raw palette colors).

## Manual checks

Run `npm run build && npm start` and check in a current browser:

1. **End to end:** from `/ailments`, open an ailment, pick a therapy, book a
   slot, and land on the confirmation page; the booking appears on
   `/dashboard`, and that slot is gone from the booking page.
2. **Double booking:** open the same booking page in two tabs, pick the same
   slot, submit both; the second shows "slot taken".
3. **Responsive:** every page at **320px, 768px, and 1280px**, in light and
   dark color schemes: no horizontal page scroll, text wraps, tap targets
   ≥ 44px, the bookings table reflows into cards below 768px, and the booking
   form is easy to complete on a phone (email keyboard on `type="email"`).
4. **Keyboard:** the booking form and slot radios are usable with the keyboard
   only, with visible focus rings.
5. **Polish:** consistent headings, cards, and buttons across all pages; no
   console errors; Lighthouse performance and accessibility ≥ 90 on the home,
   booking, and dashboard pages.

## Done means

- All automated checks pass and all manual checks are ticked off.
- `specs/tech-stack.md`, `README.md`, `specs/roadmap.md`, and the changelog
  are updated.
- No secrets or database files are committed.
