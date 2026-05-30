#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting CRM IA API..."
exec node dist/main.js
