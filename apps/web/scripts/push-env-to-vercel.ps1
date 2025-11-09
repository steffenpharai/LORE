# Script to push environment variables from .env.local to Vercel
# This will add each variable to all environments (production, preview, development)

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env.local file not found" -ForegroundColor Red
    exit 1
}

Write-Host "Reading environment variables from .env.local..." -ForegroundColor Green
Write-Host "This will add variables to Vercel for all environments." -ForegroundColor Yellow
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
                # Use echo to pipe value to vercel env add
                $value | npx vercel env add $key $env --yes 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✓ Added to $env" -ForegroundColor Green
                    $added++
                } else {
                    Write-Host "  ✗ Failed for $env (may already exist)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "  ✗ Error adding to $env : $_" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

Write-Host "`nSummary:" -ForegroundColor Green
Write-Host "  Added: $added variables" -ForegroundColor Cyan
Write-Host "  Skipped: $skipped variables" -ForegroundColor Yellow
Write-Host "`nNote: If variables already exist, they won't be overwritten." -ForegroundColor Gray
Write-Host "To update existing variables, use: npx vercel env rm <KEY> <ENV> then add again" -ForegroundColor Gray

