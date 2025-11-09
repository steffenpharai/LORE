#!/bin/bash

# LORE MACHINE Deployment Script
# This script handles deployment to Vercel

set -e

echo "🚀 Deploying LORE MACHINE..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Linking Vercel project..."
    vercel link
fi

# Pull environment variables
echo "📥 Pulling environment variables..."
vercel env pull .env.local

# Deploy to production
echo "🌐 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"

