# Vercel deployment: database choice (Turso / libSQL)

- **Date:** 2026-10-29
- **Status:** Backlog — researched, not started
- **Decision:** Stay on SQLite; move from `better-sqlite3` to Turso via `@libsql/client` + Drizzle
- **Scale assumption:** Hobby / free tier

## Problem

The app uses `better-sqlite3` with a local `.db` file. Vercel functions have no
persistent disk, so writes would be lost and instances would not share data.
We need a hosted database that still gives a good local developer experience.

## Recommendation: Turso (libSQL) + Drizzle

| Need              | How it is met                                                             |
| ----------------- | ------------------------------------------------------------------------- |
| Vercel deploy     | `libsql://<db>.turso.io` + auth token via Vercel env vars                 |
| Offline local dev | `DATABASE_URL=file:data/local.db` — no Docker, no network                 |
| Fast tests        | Vitest uses `url: ":memory:"`                                             |
| Dev/prod parity   | Same engine and same client locally and in prod; only the URL differs     |
| Low migration     | Drizzle `turso` dialect keeps the SQLite schema and `drizzle/` migrations |
| Cost              | Turso free tier covers hobby usage                                        |

Config shape (from Drizzle docs via Context7):

```ts
// drizzle.config.ts
export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // file:data/local.db  or  libsql://x.turso.io
    authToken: process.env.TURSO_AUTH_TOKEN, // unset locally
  },
});
```

## Main cost: sync → async

`better-sqlite3` is synchronous; libSQL is async. Every `.all()` / `.get()` /
`.run()` call and every transaction needs `await`, and callback transactions
must become async. TypeScript will flag most call sites.

## Alternatives considered

- **Neon Postgres** — strong Vercel fit with per-preview DB branches, but needs
  a schema port to the pg dialect and Docker Postgres locally. Overkill for hobby scale.
- **Supabase / Prisma Postgres** — same porting cost; extra features unused.

## Implementation steps

1. Swap `better-sqlite3` → `@libsql/client`; update `drizzle.config.ts` and the
   DB client module to read `DATABASE_URL` / `TURSO_AUTH_TOKEN`.
2. Convert data-access code to async/await; point tests at `:memory:`.
3. Update `scripts/db-migrate.ts`, `scripts/db-seed.ts`, the `build:scripts`
   `--external:better-sqlite3` flag, Dockerfile, docker-compose, and README.
4. Create the Turso DB, set Vercel env vars, run migrations against it.

Before step 2: count the sync call sites to size the work.

## Notes

- Comma-join precedence quirk in SQLite: prefer explicit `JOIN ... ON`, and
  parenthesize nested joins (`FROM a LEFT JOIN (b JOIN c ON ...) ON ...`).
