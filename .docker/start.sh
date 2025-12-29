#!/bin/bash

if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Instaling dependencies..."
    npm ci
else
    echo "node_modules exists already."
fi

echo "App is ready."
tail -f /dev/null