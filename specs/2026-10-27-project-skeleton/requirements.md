# Phase 0 — Project Skeleton: Requirements

## Context

Roadmap Phase 0: scaffold the Next.js + TypeScript app and confirm it renders a
placeholder home page. The repo currently holds a minimal TypeScript scaffold
(`package.json` with a `tsc` build script, `src/index.ts` logging a message).
See `specs/mission.md` and `specs/tech-stack.md`.

## Scope

In scope:

- Next.js (App Router) + TypeScript app scaffolded **in place** at the repo root
  via `create-next-app`.
- Minimal AgentClinic home page: heading, tagline, and a plain list of upcoming
  features (ailments, therapies, booking), styled with Tailwind.
- **Tailwind CSS** for styling.
- **ESLint** (Next.js config) + **Prettier** for lint/format.
- **Vitest** test runner with smoke tests for the home page and main layout, in a
  centralized `tests/` directory.
- Main layout (`Header`, `MainContent`, `Footer`) styled with a CSS Module.
- All CSS centralized in `src/styles/`.
- Responsive, mobile-first layout and home page per
  [tech-stack.md → Responsive design](../tech-stack.md#responsive-design).
- Directory structure: `app/` for routing, `views/` for pages, `components/` for
  shared UI, `lib/` for shared constants.

Out of scope:

- Ailments, therapies, appointments, dashboard (Phases 1–2).
- ORM and database selection.
- CI workflows, hosting/deploy.
- Links/navigation to feature pages (they don't exist yet); the header only
  links home.
- Full visual design and branding (Phase 2).

## Decisions

| Decision          | Choice                                         | Why                                                             |
| ----------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| Scaffold method   | `create-next-app` in place                     | Standard, well-supported config; fastest path (Mary)            |
| Router            | App Router                                     | Committed in tech-stack.md                                      |
| Source layout     | `src/app/`                                     | Reuses existing `src/` dir; keeps config files at root          |
| Home page         | Static, minimal, no links                      | Proves the stack end to end without pre-building Phase 1        |
| CSS               | Tailwind CSS                                   | Resolves deferred CSS decision; quick attractive UI (Steve)     |
| Lint / format     | ESLint (next config) + Prettier                | Consistent code; `eslint-config-prettier` avoids conflicts      |
| Tests             | Vitest + React Testing Library                 | Fast, TS-native, works with React components                    |
| Existing scaffold | Replace `src/index.ts` and `tsc` script        | Superseded by Next.js `next build`                              |
| Page components   | `src/views/`, thin routes in `src/app/(site)/` | Routing stays separate from UI; `pages/` is reserved by Next.js |
| Layout styling    | CSS Module (`layout.module.css`)               | Scoped class names; bundled and linked by Next.js               |
| Test location     | Top-level `tests/` mirroring `src/`            | One place for all tests; path shows what each test covers       |
| CSS location      | `src/styles/`, imported (not `public/`)        | One place for all CSS; still bundled, scoped, and cache-hashed  |

## Constraints

- Node.js LTS; TypeScript strict mode.
- No secrets; nothing environment-specific committed.
- Keep the phase small — skeleton only.
