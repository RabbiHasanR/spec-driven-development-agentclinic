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
