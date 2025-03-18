#!/bin/sh
set -e

echo "Running migrations..."
npx squid-typeorm-migration apply

echo "Starting application..."
npm start
