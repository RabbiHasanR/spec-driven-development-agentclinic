# Phase 0 — Project Skeleton: Validation

Phase 0 is mergeable when **all** of the following pass on a clean checkout
(`npm ci` first).

## Automated checks

| Check            | Command                | Pass criteria                   |
| ---------------- | ---------------------- | ------------------------------- |
| Production build | `npm run build`        | Exits 0, no type errors         |
| Lint             | `npm run lint`         | Exits 0, no errors or warnings  |
| Formatting       | `npm run format:check` | Exits 0                         |
| Tests            | `npm test`             | Home page and layout tests pass |

## Manual check

1. Run `npm run dev`.
2. Open `http://localhost:3000` in a current browser.
3. Home page shows the "AgentClinic" heading, the tagline, and the three upcoming
   features, centered and styled with Tailwind.
4. Page has no leftover create-next-app content and the browser tab title is "AgentClinic".
5. Layout reads well at desktop and phone widths (no horizontal scroll).
6. Every page shows the shared header (AgentClinic title linking home), main
   content, and footer.
7. Browser console shows no errors.

## Repo hygiene

- `src/index.ts` and the old `tsc` build script are gone.
- No build output (`.next/`) or `.env*` files committed.
- `README.md` documents setup and scripts.
- `specs/tech-stack.md` reflects the decisions made in this phase.
- Commits follow conventional commit format.
