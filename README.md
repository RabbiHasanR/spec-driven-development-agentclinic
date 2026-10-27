# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

Requires Node.js LTS (24.x).

```bash
npm ci        # install exact locked dependencies
npm run dev   # start the dev server at http://localhost:3000
```

## Scripts

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Next.js dev server with hot reload  |
| `npm run build`        | Production build (includes type checking)     |
| `npm start`            | Serve the production build                    |
| `npm run lint`         | Lint with ESLint (Next.js + Prettier configs) |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing              |
| `npm test`             | Run the Vitest suite once                     |
| `npm run test:watch`   | Run Vitest in watch mode                      |

## Project layout

```text
src/
├── app/                  # Routing only: thin route files and layouts
│   ├── layout.tsx        # Root <html>/<body>, metadata, global CSS import
│   └── (site)/           # Route group (not part of the URL)
│       ├── layout.tsx    # Wraps public pages in <MainLayout>
│       └── page.tsx      # "/" → renders <HomePage />
├── components/           # Shared UI
│   └── layout/           # MainLayout = Header + MainContent + Footer
├── views/                # Page components, one folder per page
│   └── home/
├── lib/                  # Shared constants and helpers (site.ts)
└── styles/               # All CSS
    ├── globals.css       # Tailwind + shared color tokens
    └── components/       # CSS Modules for src/components/
tests/                    # All tests, mirroring src/
├── setup.ts
├── components/layout/
└── views/home/
specs/                    # Mission, tech stack, roadmap, per-phase specs
```

New code follows the conventions in
[specs/tech-stack.md → Project conventions](specs/tech-stack.md#project-conventions).
