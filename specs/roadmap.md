# AgentClinic — Roadmap

High-level implementation order. Phases are **vertical slices**: each ships one
usable, demoable piece end to end (data → API → UI). Keep every phase small.
Every phase follows the directory and naming rules in
[tech-stack.md → Project conventions](tech-stack.md#project-conventions), and
every phase's UI meets the
[responsive design standard](tech-stack.md#responsive-design).

## Phase 0 — Project skeleton ✅ Complete

- Scaffold the Next.js + TypeScript app.
- Confirm it runs and renders a placeholder home page in the browser.
- Responsive main layout (header, main, footer) from phone to desktop.

## Phase 1 — Browse ailments

- Model and seed a few **ailments**.
- List ailments on a page, with a detail view.
- Ailment list is a single column on phones and a multi-column grid on wider
  screens.

## Phase 2 — Therapies, booking, dashboard, and polish

### Discover therapies

- Model **therapies** and link them to ailments.
- Show matching therapies on each ailment's detail page.
- Therapy cards stack on phones and sit side by side on wider screens.

### Book an appointment

- Model **appointments**.
- Let an agent book an appointment for a therapy.
- Confirm the booking back to the agent.
- Booking form is fully usable on a phone (full-width fields, 44px tap
  targets, mobile-friendly input types).

### Staff dashboard

- Dashboard page listing all bookings.
- Basic status/overview of the schedule.
- Bookings table scrolls inside its container or reflows into cards on small
  screens; no page-level horizontal scroll.

### Polish

- Attractive, consistent styling across pages.
- Verify a fast, clean experience in a modern browser.
- Cross-device pass: every page checked at 320px, 768px, and 1280px.

## Later (out of v1 scope)

Messaging, notifications, billing, analytics, multi-clinic support.
