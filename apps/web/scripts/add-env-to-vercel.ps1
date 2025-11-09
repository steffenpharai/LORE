# Add environment variables from .env.local to Vercel
# This script reads .env.local and adds each variable to Vercel
# Project: lorebase/lore
# Run from: apps/web directory

$envFile = ".env.local"
$projectName = "lorebase/lore"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env.local file not found" -ForegroundColor Red
    exit 1
}

Write-Host "Adding environment variables from .env.local to Vercel..." -ForegroundColor Green
Write-Host "Project: $projectName" -ForegroundColor Cyan
Write-Host ""

$lines = Get-Content $envFile | Where-Object { 
    $_ -match '^[^#].*=' -and 
    $_ -notmatch '^\s*$' -and
    $_ -notmatch '^VERCEL_OIDC_TOKEN'  # Skip Vercel's internal token
}

$environments = @("production", "preview", "development")
$added = 0
$skipped = 0

foreach ($line in $lines) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        } elseif ($value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        # Skip empty values
        if ([string]::IsNullOrWhiteSpace($value) -or $value -eq "") {
            Write-Host "Skipping empty: $key" -ForegroundColor Yellow
            $skipped++
            continue
        }
        
        # Skip Vercel internal variables
        if ($key -match '^VERCEL_') {
            Write-Host "Skipping Vercel internal: $key" -ForegroundColor Gray
            $skipped++
            continue
        }
        
        Write-Host "Adding: $key" -ForegroundColor Cyan
        
        foreach ($env in $environments) {
            try {
                # Pipe the value to vercel env add
                $result = $value | npx vercel env add $key $env 2>&1 | Out-String
                if ($LASTEXITCODE -eq 0 -or $result -match "Added Environment Variable") {
                    Write-Host "  Added to $env" -ForegroundColor Green
                    $added++
                } elseif ($result -match "already exists" -or $result -match "Environment Variable.*already") {
                    Write-Host "  Already exists in $env" -ForegroundColor Yellow
                } else {
                    Write-Host "  Error in $env" -ForegroundColor Red
                }
            } catch {
                Write-Host "  Error: $_" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Green
Write-Host "  Processed variables" -ForegroundColor Cyan
Write-Host "  Skipped: $skipped (empty or Vercel internal)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Done! Variables added to Vercel." -ForegroundColor Green
Write-Host "Project: $projectName" -ForegroundColor Cyan
Write-Host "Dashboard: https://vercel.com/$projectName/settings/environment-variables" -ForegroundColor Cyan
