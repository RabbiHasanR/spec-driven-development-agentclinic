# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## 2026-10-28

- Added the Phase 2 booking and clinic operations spec (requirements, plan,
  validation).
- Added an `appointments` table: one booking per therapy slot, enforced by a
  unique index, with random `AC-XXXXXX` references.
- Agents can book a therapy at `/therapies/<slug>/book`: generated weekday
  slots in clinic time, a phone-friendly form, and a confirmation page at
  `/bookings/<reference>`. Each therapy card has a "Book" link.
- Added the staff dashboard at `/dashboard`: today's and upcoming counts, the
  busiest therapy, and upcoming and past bookings as a table (cards on
  phones). The header links to it.
- Fixed header labels breaking mid-word on narrow phones.
- Added shared `Button`, `ArrowLink`, `Section`, and `FieldError` components,
  a `danger` color token, and one shared loading page.
- Updated the home page now that booking is live, recorded the Phase 2
  decisions in the tech stack, and marked roadmap Phase 2 as complete.

- Defined the Vitest suite as the validation gate in the tech stack.
- Added tests for site metadata and project directory conventions.
- Added a mobile-first responsive design standard to the mission, roadmap, and
  feature specs, and made the main layout responsive to match.
- Restructured the roadmap into two phases: a read-only care catalog (ailments
  and therapies) and booking and clinic operations (booking, staff dashboard,
  polish).
- Added a manual `/changelog` skill and this changelog, generated from the git
  history.
- Added the Phase 1 care catalog spec (requirements, plan, validation).
- Added a SQLite database with Drizzle ORM: schema, migrations, an idempotent
  seed of six ailments and eight therapies, and `db:*` scripts.
- Added the ailments list (`/ailments`) and ailment detail pages
  (`/ailments/[slug]`) showing the therapies that treat each ailment, with a
  not-found page for unknown ailments.
- Added an "Ailments" link to the header and linked "Browse ailments" from the
  home page; page titles now read "Page · AgentClinic".
- Top-aligned page content in the main layout.
- Recorded the ORM and database decisions in the tech stack and marked roadmap
  Phase 1 as complete.
- Made migrations safe for table rebuilds (foreign keys off while migrating),
  stopped the app from silently creating a missing database, and added a
  friendly error page.
- Made reseeding replace each ailment's therapy links, and indexed the link
  table by therapy.
- Added route-level tests for page titles and the not-found path, and
  strengthened the seed, card, and view tests.
- Brought the Phase 1 spec and tech stack in line with the implementation.
- Unified styling on the shared color tokens (Tailwind theme colors that
  switch with the color scheme) with shared `card` and `focus-ring`
  utilities, fixing low dark-mode contrast on the home page.
- Added shared `PageHeader` and `BackLink` components and central route
  helpers, and marked the current page in the header navigation.
- Added a site-styled 404 page for unknown URLs and accessibility fixes
  (decorative arrows hidden, card heading levels, high-contrast focus).

## 2026-10-27

- Added the Phase 0 project skeleton spec (requirements, plan, validation).
- Scaffolded the Next.js app with TypeScript, Tailwind CSS, and ESLint,
  replacing the placeholder TypeScript setup.
- Removed the create-next-app template content and set AgentClinic metadata.
- Added a minimal AgentClinic home page with heading, tagline, and upcoming
  features.
- Added Prettier with `eslint-config-prettier` and format scripts.
- Added Vitest with React Testing Library and a home page smoke test.
- Documented setup and scripts in the README and recorded Phase 0 stack
  decisions.
- Fixed CSS Modules loading as global CSS under the Tailwind Turbopack rule.
- Added a main layout (header, main content, footer) and separated thin routes
  in `src/app/` from page components in `src/views/`.
- Centralized tests in a top-level `tests/` directory and CSS in `src/styles/`,
  and recorded the project conventions in the tech stack spec.
- Marked roadmap Phase 0 as complete.

## 2026-10-26

- Created the initial project scaffold.
- Added the project constitution: mission, tech stack, and roadmap.
