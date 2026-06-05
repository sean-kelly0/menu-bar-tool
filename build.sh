#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building AssignmentBar..."
npm run build

echo ""
echo "Done! Find the output in ./dist:"
ls dist/*.dmg dist/*.zip 2>/dev/null || true
