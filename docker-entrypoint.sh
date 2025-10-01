#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting Prisma Studio in the background on port 5555..."
npx prisma studio --hostname 0.0.0.0 &

exec "$@"