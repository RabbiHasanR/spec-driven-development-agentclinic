# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

Requires Node.js LTS (24.x).

```bash
npm ci                # install exact locked dependencies
cp .env.example .env  # then set STAFF_PASSWORD and SESSION_SECRET in .env
npm run db:migrate    # create the database file and apply the schema
npm run db:seed       # load the ailment and therapy catalog
npm run dev           # start the dev server at http://localhost:3000
```

### Environment

| Variable         | Required | What it does                                                       |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL`   | yes      | SQLite file path, e.g. `data/agentclinic.db`                       |
| `STAFF_PASSWORD` | yes      | The shared staff password for `/login`                             |
| `SESSION_SECRET` | yes      | Signs staff session cookies; 32+ chars (`openssl rand -base64 32`) |

Without `STAFF_PASSWORD` and a long enough `SESSION_SECRET`, staff pages
show an error page instead of any data; agent pages keep working.

### Pages

Agents (public):

| Path                     | What it shows                                        |
| ------------------------ | ---------------------------------------------------- |
| `/`                      | Home: the agent's path to relief                     |
| `/ailments`              | The ailment catalog                                  |
| `/ailments/<slug>`       | One ailment and the therapies that treat it          |
| `/therapies/<slug>/book` | Open time slots and the booking form for one therapy |
| `/bookings/<reference>`  | Booking confirmation, or "cancelled" (`noindex`)     |

Staff (sign in at `/login`; every page is `noindex`):

| Path                                       | What it shows                                 |
| ------------------------------------------ | --------------------------------------------- |
| `/dashboard`                               | Every booking at a glance, with status badges |
| `/dashboard/bookings/<reference>`          | One booking: cancel, or mark attended/no-show |
| `/dashboard/catalog`                       | Every ailment and therapy                     |
| `/dashboard/catalog/ailments/new`          | Add an ailment and pick its therapies         |
| `/dashboard/catalog/ailments/<slug>/edit`  | Edit or delete an ailment                     |
| `/dashboard/catalog/therapies/new`         | Add a therapy                                 |
| `/dashboard/catalog/therapies/<slug>/edit` | Edit or delete a therapy                      |

`GET /api/health` returns `200 {"status":"ok"}` when the database answers,
`503` otherwise.

### Booking flow

An agent opens an ailment, picks a therapy, and books an open slot. Slots are
generated, not stored: weekdays from 09:00 clinic time, spaced by the therapy's
length and ending by 17:00, for the next 14 days (rules in
`src/lib/booking/schedule.ts`). The form posts to a Server Action that
re-validates everything and inserts the booking; a unique
`(therapy_id, starts_at)` index makes double booking impossible, even for
simultaneous submissions. The agent then lands on `/bookings/<reference>`.

### Staff

Staff sign in at `/login` with the shared `STAFF_PASSWORD`; the session lasts
8 hours. From the dashboard they can:

- **Manage bookings:** cancel a booking before it starts (the slot opens up
  again for agents), or mark it attended or a no-show once it has started.
  Those three states are final.
- **Manage the catalog:** add, edit, and delete ailments and therapies.
  Slugs are set once from the name and never change, so agents' links keep
  working. A therapy can't be deleted while it has bookings, or while it's
  some ailment's only therapy.

`npm run db:seed` only adds missing sample data, so it never overwrites what
staff have changed.

## Scripts

| Script                  | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Start the Next.js dev server with hot reload           |
| `npm run build`         | Production build (includes type checking)              |
| `npm run build:scripts` | Bundle `db:migrate`/`db:seed` to plain JS (for Docker) |
| `npm start`             | Serve the production build                             |
| `npm run lint`          | Lint with ESLint (Next.js + Prettier configs)          |
| `npm run format`        | Format all files with Prettier                         |
| `npm run format:check`  | Check formatting without writing                       |
| `npm test`              | Run the Vitest suite once                              |
| `npm run test:watch`    | Run Vitest in watch mode                               |
| `npm run db:generate`   | Generate a SQL migration from the schema               |
| `npm run db:migrate`    | Apply pending migrations to the database               |
| `npm run db:seed`       | Add missing seed data; keeps staff edits               |

## Running with Docker

```bash
docker compose up --build          # build, migrate a fresh volume, serve :3000
docker compose run --rm app seed   # load the sample catalog (once)
```

Compose reads `STAFF_PASSWORD` and `SESSION_SECRET` from `.env`. The database
lives in the `agentclinic-data` volume; the container applies pending
migrations every time it starts, runs as the non-root `node` user, and
reports health via `/api/health`.

**Serve it over HTTPS.** In production the staff session cookie is `Secure`,
so browsers only send it over HTTPS (or `http://localhost`). Behind plain
HTTP on any other host, staff login silently fails; put a TLS-terminating
reverse proxy in front.

CI (`.github/workflows/ci.yml`) runs lint, format, tests, and the build on
every push and pull request, then builds the image and smoke-tests it.

## Project layout

```text
src/
├── app/                  # Routing only: thin route files and layouts
│   ├── layout.tsx        # Root <html>/<body>, metadata, global CSS import
│   ├── not-found.tsx     # 404 for unmatched URLs (adds <MainLayout> itself)
│   ├── (site)/           # Route group (not part of the URL)
│       ├── layout.tsx    # Wraps public pages in <MainLayout>
│       ├── error.tsx     # Error boundary with a retry button
│       ├── page.tsx      # "/" → renders <HomePage />
│       ├── ailments/     # "/ailments" and "/ailments/[slug]" (+ loading, not-found)
│       ├── therapies/    # "/therapies/[slug]/book" (+ loading, not-found)
│       └── bookings/     # "/bookings/[reference]" (+ loading, not-found)
│   ├── (staff)/          # Staff pages (own layout and error boundary)
│   │   ├── login/        # "/login"
│   │   └── dashboard/    # "/dashboard", bookings/[reference], catalog/…
│   └── api/health/       # GET /api/health
├── proxy.ts              # Redirects signed-out visitors away from /dashboard
├── components/           # Shared UI
│   ├── layout/           # MainLayout = Header (+ NavLink) + MainContent + Footer
│   ├── catalog/          # AilmentCard, TherapyCard
│   ├── booking/          # BookingForm (client), SlotPicker
│   ├── dashboard/        # BookingsTable, OverviewStats, StatusBadge, StatusActions
│   ├── auth/             # LoginForm (client)
│   ├── catalog-admin/    # AilmentForm, TherapyForm, DeleteForm, CatalogEditor
│   └── ui/               # PageHeader, Section, Button, ArrowLink, BackLink,
│                         #   TextField, TextArea, CheckboxGroup, DetailList,
│                         #   FormMessage, ConfirmDisclosure, useFocusFirstError
├── views/                # Page components, one folder per page
│   ├── home/  ailments/  ailment-detail/  book-therapy/
│   ├── booking-confirmation/  dashboard/  login/  staff-booking/
│   ├── staff-catalog/  ailment-editor/  therapy-editor/
│   └── error/  not-found/  loading/
├── lib/                  # Shared helpers: site.ts, routes.ts (all URL paths)
│   ├── auth/             # Session signing, requireStaff(), sign-in actions
│   ├── booking/          # Slots, availability, time zones, formatting,
│   │                     #   validation, overview, status rules, actions
│   ├── catalog/          # Slugs, catalog validation, catalog actions
│   └── db/               # Drizzle schema, client, queries, references,
│                         #   migrator, seed, types
└── styles/               # All CSS
    ├── globals.css       # Tailwind, color tokens, `card` / `focus-ring` utilities
    └── components/       # CSS Modules for src/components/
drizzle/                  # Generated SQL migrations (committed)
scripts/                  # db:migrate and db:seed entry points (run with tsx),
                          #   and the Docker entrypoint
Dockerfile, docker-compose.yml
tests/                    # All tests, mirroring src/
├── setup.ts
├── helpers/              # In-memory test DB and fixtures
├── app/                  # Route-level tests (metadata, notFound)
├── lib/
├── components/
└── views/
specs/                    # Mission, tech stack, roadmap, per-phase specs
```

New code follows the conventions in
[specs/tech-stack.md → Project conventions](specs/tech-stack.md#project-conventions).
