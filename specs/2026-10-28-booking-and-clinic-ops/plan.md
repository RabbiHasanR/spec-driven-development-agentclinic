# Phase 2 — Booking and Clinic Operations: Plan

## 1. Groundwork

1. Read the Next.js guides on mutating data, Server Actions, `useActionState`,
   `redirect`, and forms in `node_modules/next/dist/docs/`.
2. Add the `appointments` table to `src/lib/db/schema.ts` (unique
   `reference`, unique `(therapy_id, starts_at)`, therapy fk `restrict`);
   generate the migration and confirm it applies to a seeded Phase 1 DB.
3. Export the `Appointment` row type from `src/lib/db/types.ts`.
4. Add `CLINIC_TIME_ZONE` and the slot rules (hours, weekdays, 14-day window)
   as constants in `src/lib/booking/`.
5. Add routes to `src/lib/routes.ts`: `bookTherapyPath()`, `bookingPath()`,
   and `ROUTES.dashboard`.

## 2. Book an appointment (slice 1)

1. Add `generateSlots(now)` in `src/lib/booking/slots.ts`: a pure function
   returning upcoming slot start times (UTC ISO) per the slot rules.
2. Add queries in `src/lib/db/appointments.ts`: `getTherapyBySlug(slug)` (if
   not already present), `listBookedSlots(db, therapyId)`,
   `createAppointment(db, input)` (generates the reference; maps the unique
   constraint error to a "slot taken" result), and
   `getAppointmentByReference(db, reference)` with its therapy.
3. Add `validateBooking(input, openSlots)` in `src/lib/booking/validate.ts`:
   name required (trimmed, length-capped), valid email, slot must be one of the
   open slots. Returns field errors.
4. Add the Server Action `bookAppointment` that validates, inserts, and
   redirects to `/bookings/[reference]`; on error it returns field errors and
   the submitted values.
5. Add the route `src/app/(site)/therapies/[slug]/book/page.tsx` → view
   `src/views/book-therapy/`, with a client `BookingForm` component in
   `src/components/booking/` (slot radios grouped by day, 44px targets,
   full-width fields). Unknown therapy → not-found page; no open slots → empty
   state.
6. Add the confirmation route `src/app/(site)/bookings/[reference]/page.tsx` →
   view `src/views/booking-confirmation/`. Unknown reference → not-found page.
7. Add a "Book" link to `TherapyCard` pointing at `bookTherapyPath(slug)`.
8. Tests: slot generation (weekends skipped, window edges, fixed clock),
   validation, appointment queries (including the double-booking conflict),
   the action (success redirect and error paths), the booking and confirmation
   views, and route-level not-found behavior.

## 3. Staff dashboard (slice 2)

1. Add `listAppointments(db)` (every booking with its therapy, earliest
   first) in `src/lib/db/appointments.ts`. Add pure `splitSchedule()`
   (upcoming first, then past) and `summarizeSchedule()` (today's count,
   upcoming count, busiest therapy) in `src/lib/booking/overview.ts`.
2. Add the `(staff)` route group with a layout wrapping `MainLayout`, and the
   route `src/app/(staff)/dashboard/page.tsx` → view `src/views/dashboard/`,
   with a `loading.tsx`.
3. Add `BookingsTable` (table at `md`+, card list below) and an
   `OverviewStats` strip in `src/components/dashboard/`. Empty state when
   there are no bookings.
4. Add the header link to `/dashboard`.
5. Tests: list ordering, overview numbers with a fixed clock, the dashboard
   view (rows, empty state), and the header link.

## 4. Polish

1. Audit every page for consistent spacing, headings (`PageHeader`), cards,
   and buttons; extract any repeated class strings into `src/components/ui/`
   (e.g. a `Button`) or `globals.css` utilities.
2. Make sure every data page has a `loading.tsx` and an empty state, and every
   page has a `<Page> · AgentClinic` title.
3. Update the home page so its booking item links into the catalog (staff
   reach the dashboard from the header).
4. Cross-device pass at 320px, 768px, and 1280px in both color schemes; fix
   overflow, tap targets, and wrapping.
5. Check the production build in a modern browser: no console errors, fast
   first load (Lighthouse performance and accessibility ≥ 90 on the home,
   booking, and dashboard pages).

## 5. Verify and document

1. Run every check in `validation.md`, including the manual pass.
2. Update `specs/tech-stack.md`: the Server Action form pattern, the `(staff)`
   route group, `src/lib/booking/`, and any new UI components in the project
   conventions.
3. Update `README.md`: the new routes and the booking flow.
4. Mark Phase 2 complete in `specs/roadmap.md`; add a changelog entry.
