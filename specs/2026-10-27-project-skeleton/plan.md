# Phase 0 — Project Skeleton: Plan

## 1. Scaffold Next.js in place

1. Remove the placeholder `src/index.ts` and the `tsc`-only `build` script / `main` field from `package.json`.
2. Run `create-next-app` at the repo root with: TypeScript, App Router, `src/` directory, Tailwind CSS, ESLint, import alias `@/*`.
3. Resolve any conflicts with existing `package.json`, `tsconfig.json`, `README.md` (keep project name `agentclinic`).
4. Confirm `.gitignore` covers `node_modules/`, `.next/`, `.env*`.

## 2. Clean up the template

1. Strip default template content, unused assets, and boilerplate styles.
2. Set app metadata (title "AgentClinic", description from mission.md) in `src/app/layout.tsx`.

## 3. Minimal AgentClinic home page

1. Replace `src/app/page.tsx` with a minimal AgentClinic home page:
   - Heading: "AgentClinic".
   - Tagline: "A place for AI agents to get relief from their humans."
   - Short list of what's coming: browse ailments, discover therapies, book appointments (plain text, no links yet).
2. Style with Tailwind: centered layout, readable typography, calm color palette.
3. Use semantic HTML (`<main>`, `<h1>`, `<ul>`) for accessibility.

## 4. Lint and format

1. Add Prettier + `eslint-config-prettier`; extend ESLint config so Prettier wins on formatting.
2. Add `.prettierrc` and `.prettierignore`.
3. Add scripts: `lint`, `format`, `format:check`.

## 5. Test runner

1. Add Vitest, `@vitejs/plugin-react`, jsdom, React Testing Library.
2. Add `vitest.config.ts` (jsdom env, `@/*` alias).
3. Add a smoke test asserting the home page renders the AgentClinic heading, tagline, and the three upcoming features.
4. Add `test` script.

## 6. Verify and document

1. Run every check in `validation.md`.
2. Update `README.md` with setup and script usage.
3. Update `specs/tech-stack.md` deferred decisions (Tailwind, lint, tests now decided).

## 7. Directory structure and main layout

1. Keep `src/app/` for routing only: thin route files that render page components.
   - Move the home route into a `(site)` route group: `src/app/(site)/page.tsx`.
2. Add `src/views/<page>/` for page components (`src/views/home/home-page.tsx`).
   - Not `src/pages/` — that name is reserved for the Next.js Pages Router.
3. Add `src/components/layout/` with a `MainLayout` composed of three subcomponents:
   - `Header` — site title linking to `/` (no feature nav yet).
   - `MainContent` — the page's `<main>` landmark.
   - `Footer` — short footer line.
4. Style the layout with a CSS Module, `layout.module.css`, imported by the layout
   components (Next.js bundles it and emits the `<link>` tag). Shared color tokens
   live as CSS variables in the global stylesheet. (Both moved to `src/styles/` in §8.)
5. Add `src/lib/site.ts` for shared site constants (name, tagline, description).
6. Render `MainLayout` from the route group layout `src/app/(site)/layout.tsx`;
   the root `src/app/layout.tsx` keeps only `<html>`, `<body>`, and global CSS.
   (Later groups, e.g. the Phase 4 dashboard, can use a different layout.)
7. Add tests for `MainLayout` (banner, main, contentinfo landmarks) and update the
   home page test. (Moved to `tests/` in §8.)
8. Update `README.md` project layout.

## 8. Centralize tests and styles

1. Move all tests into a top-level `tests/` directory that mirrors `src/`:
   - `tests/components/layout/main-layout.test.tsx`
   - `tests/views/home/home-page.test.tsx`
   - `vitest.setup.ts` → `tests/setup.ts`
2. Restrict Vitest to `tests/**/*.test.{ts,tsx}`; tests import source via `@/*`.
3. Move all CSS into `src/styles/`, imported from code (never linked from `public/`):
   - `src/app/globals.css` → `src/styles/globals.css` (Tailwind + color tokens)
   - `src/components/layout/layout.module.css` →
     `src/styles/components/layout.module.css`
4. Record these conventions in `specs/tech-stack.md` so later phases follow them.
5. Update `README.md` project layout.

## 9. Responsive design

1. Add the responsive design standard to `specs/tech-stack.md` and reference it
   from the mission, roadmap, and this spec.
2. Rewrite `src/styles/components/layout.module.css` mobile-first: tighter
   padding on phones, growing at `sm`/`md`; long text wraps.
3. Make the header home link a 44px-tall tap target.
4. Export `viewport` (`themeColor`, `colorScheme`) from `src/app/layout.tsx`;
   keep the default `width=device-width`, never disable zoom.
5. Check the home page at 320px, 768px, and 1280px.
