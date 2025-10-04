#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Installing Playwright..."
npx playwright install chromium

echo "App is ready."
tail -f /dev/null