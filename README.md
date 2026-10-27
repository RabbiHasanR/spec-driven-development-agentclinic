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
├── app/                  # Routing only: thin route files, layouts, global CSS
│   ├── layout.tsx        # Root <html>/<body>, metadata, globals.css
│   ├── globals.css       # Tailwind + shared color tokens (CSS variables)
│   └── (site)/           # Route group (not part of the URL)
│       ├── layout.tsx    # Wraps public pages in <MainLayout>
│       └── page.tsx      # "/" → renders <HomePage />
├── components/           # Shared UI
│   └── layout/           # MainLayout = Header + MainContent + Footer
│       └── layout.module.css
├── views/                # Page components, one folder per page
│   └── home/
└── lib/                  # Shared constants and helpers (site.ts)
specs/                    # Mission, tech stack, roadmap, per-phase specs
```

Conventions:

- Add a page as `src/app/(site)/<route>/page.tsx` that renders a component from
  `src/views/<route>/`. Keep route files thin.
- `src/pages/` is reserved by the Next.js Pages Router — don't create it.
- Component styles use CSS Modules (`*.module.css`) or Tailwind utilities; tests
  sit next to the code as `*.test.tsx`.
