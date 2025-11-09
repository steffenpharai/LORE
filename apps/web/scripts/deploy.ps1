# LORE MACHINE Deployment Script for PowerShell
# Run from: apps/web directory

Write-Host "🚀 Deploying LORE MACHINE..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "app")) {
    Write-Host "❌ Error: Must run from apps/web directory" -ForegroundColor Red
    Write-Host "   cd apps/web" -ForegroundColor Yellow
    exit 1
}

# Check if vercel is available
$vercelCmd = "npx vercel"
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    $vercelCmd = "vercel"
}

# Link project if not already linked
if (-not (Test-Path ".vercel/project.json")) {
    Write-Host "📦 Linking Vercel project..." -ForegroundColor Yellow
    & $vercelCmd link
}

# Pull environment variables (optional - they're already in Vercel)
Write-Host "📥 Pulling environment variables from Vercel..." -ForegroundColor Yellow
& $vercelCmd env pull .env.local --yes 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Note: Some variables may need to be set manually" -ForegroundColor Yellow
}

# Deploy to production
Write-Host "🌐 Deploying to production..." -ForegroundColor Green
& $vercelCmd --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🔗 Project: lorebase/lore" -ForegroundColor Cyan
Write-Host "🌐 Check your deployment at: https://vercel.com/lorebase/lore" -ForegroundColor Cyan

