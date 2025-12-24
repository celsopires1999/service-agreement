#!/bin/bash

echo "Installing dependencies..."
npm ci

echo "App is ready."
tail -f /dev/null