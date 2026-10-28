# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

Requires Node.js LTS (24.x).

```bash
npm ci                # install exact locked dependencies
cp .env.example .env  # configure DATABASE_URL (SQLite file path)
npm run db:migrate    # create/upgrade the database schema
npm run db:seed       # load the ailment and therapy catalog
npm run dev           # start the dev server at http://localhost:3000
```

Pages: `/` (home), `/ailments` (catalog), `/ailments/<slug>` (ailment and its
therapies).

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
| `npm run db:generate`  | Generate a SQL migration from the schema      |
| `npm run db:migrate`   | Apply pending migrations to the database      |
| `npm run db:seed`      | Upsert the catalog seed data (idempotent)     |

## Project layout

```text
src/
├── app/                  # Routing only: thin route files and layouts
│   ├── layout.tsx        # Root <html>/<body>, metadata, global CSS import
│   └── (site)/           # Route group (not part of the URL)
│       ├── layout.tsx    # Wraps public pages in <MainLayout>
│       ├── page.tsx      # "/" → renders <HomePage />
│       └── ailments/     # "/ailments" and "/ailments/[slug]" (+ loading, not-found)
├── components/           # Shared UI
│   ├── layout/           # MainLayout = Header + MainContent + Footer
│   └── catalog/          # AilmentCard, TherapyCard, BackLink
├── views/                # Page components, one folder per page
│   ├── home/
│   ├── ailments/
│   └── ailment-detail/
├── lib/                  # Shared constants and helpers (site.ts)
│   └── db/               # Drizzle schema, client, queries, migrator, seed
└── styles/               # All CSS
    ├── globals.css       # Tailwind + shared color tokens
    └── components/       # CSS Modules for src/components/
drizzle/                  # Generated SQL migrations (committed)
scripts/                  # db:migrate and db:seed entry points (run with tsx)
tests/                    # All tests, mirroring src/
├── setup.ts
├── helpers/              # In-memory test DB and fixtures
├── lib/db/
├── components/
└── views/
specs/                    # Mission, tech stack, roadmap, per-phase specs
```

New code follows the conventions in
[specs/tech-stack.md → Project conventions](specs/tech-stack.md#project-conventions).
