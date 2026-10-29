#!/bin/sh
# Container entrypoint: apply pending migrations, then run the command.
# `seed` loads any missing catalog seed data instead of starting the server.
set -eu

node /app/scripts/db-migrate.cjs

if [ "${1:-}" = "seed" ]; then
  exec node /app/scripts/db-seed.cjs
fi
exec "$@"
