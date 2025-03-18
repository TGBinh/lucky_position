#!/bin/sh
set -e

echo "Running codegen..."
npx squid-typeorm-codegen

echo "Compiling TypeScript..."
npx tsc

echo "Applying migrations..."
npx squid-typeorm-migration apply

echo "Starting application..."
npm start
