#!/bin/bash

# LORE MACHINE Deployment Script
# This script handles deployment to Vercel
# Run from: apps/web directory

set -e

echo "🚀 Deploying LORE MACHINE..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
    echo "❌ Error: Must run from apps/web directory"
    echo "   cd apps/web && ../../infra/deploy.sh"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Use npx vercel if vercel command not available
VERCEL_CMD="vercel"
if ! command -v vercel &> /dev/null; then
    VERCEL_CMD="npx vercel"
fi

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Linking Vercel project..."
    $VERCEL_CMD link
fi

# Pull environment variables (optional - they're already in Vercel)
echo "📥 Pulling environment variables from Vercel..."
$VERCEL_CMD env pull .env.local --yes || echo "⚠️  Note: Some variables may need to be set manually"

# Deploy to production
echo "🌐 Deploying to production..."
$VERCEL_CMD --prod

echo "✅ Deployment complete!"
echo "🔗 Project: lorebase/lore"
echo "🌐 Check your deployment at: https://vercel.com/lorebase/lore"

