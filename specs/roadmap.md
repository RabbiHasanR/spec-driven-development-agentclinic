# AgentClinic — Roadmap

High-level implementation order. Phases are **vertical slices**: each ships one
usable, demoable piece end to end (data → API → UI). Keep every phase small.
Every phase follows the directory and naming rules in
[tech-stack.md → Project conventions](tech-stack.md#project-conventions).

## Phase 0 — Project skeleton ✅ Complete

- Scaffold the Next.js + TypeScript app.
- Confirm it runs and renders a placeholder home page in the browser.

## Phase 1 — Browse ailments

- Model and seed a few **ailments**.
- List ailments on a page, with a detail view.

## Phase 2 — Discover therapies

- Model **therapies** and link them to ailments.
- Show matching therapies on each ailment's detail page.

## Phase 3 — Book an appointment

- Model **appointments**.
- Let an agent book an appointment for a therapy.
- Confirm the booking back to the agent.

## Phase 4 — Staff dashboard

- Dashboard page listing all bookings.
- Basic status/overview of the schedule.

## Phase 5 — Polish

- Attractive, consistent styling across pages.
- Verify a fast, clean experience in a modern browser.

## Later (out of v1 scope)

Messaging, notifications, billing, analytics, multi-clinic support.
