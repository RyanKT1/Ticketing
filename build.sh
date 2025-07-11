#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Build and test backend
echo "Building backend package..."
cd packages/backend
rm -rf node_modules
npm install --no-optional --no-fund --no-audit --loglevel=error
npm run test
npm run build

# Clean and install only production dependencies for deployment
echo "Installing production dependencies for deployment..."
rm -rf node_modules
npm ci --production --no-optional --no-fund --no-audit --loglevel=error
cd ../..

# Build and test frontend
echo "Building frontend package..."
cd packages/frontend
rm -rf node_modules
npm install --legacy-peer-deps
npm test
npm run build
cd ../..

# Build and synth CDK
echo "Building CDK package..."
cd packages/cdk
rm -rf node_modules
npm install
npm run build
npm run cdk synth
cd ../..

echo "Build process completed successfully!"
