# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## 2026-10-28

- Defined the Vitest suite as the validation gate in the tech stack.
- Added tests for site metadata and project directory conventions.
- Added a mobile-first responsive design standard to the mission, roadmap, and
  feature specs, and made the main layout responsive to match.
- Restructured the roadmap into two phases: a read-only care catalog (ailments
  and therapies) and booking and clinic operations (booking, staff dashboard,
  polish).
- Added a manual `/changelog` skill and this changelog, generated from the git
  history.

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
