# PowerShell script to add environment variables to Vercel
# This reads from .env.local and adds them to Vercel

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env.local file not found" -ForegroundColor Red
    exit 1
}

Write-Host "Reading environment variables from .env.local..." -ForegroundColor Green

# Read .env.local and parse variables
$lines = Get-Content $envFile | Where-Object { $_ -match '^[^#].*=' -and $_ -notmatch '^\s*$' }

foreach ($line in $lines) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        # Skip empty values
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "Skipping empty: $key" -ForegroundColor Yellow
            continue
        }
        
        Write-Host "Adding: $key" -ForegroundColor Cyan
        
        # Determine environment (production, preview, development)
        # You can modify this to add to specific environments
        $environments = @("production", "preview", "development")
        
        foreach ($env in $environments) {
            Write-Host "  -> $env" -ForegroundColor Gray
            # Note: This would require interactive input or using --yes flag
            # For now, we'll just show what needs to be added
        }
    }
}

Write-Host "`nTo add these variables, run:" -ForegroundColor Green
Write-Host "  npx vercel env add <KEY> <ENVIRONMENT>" -ForegroundColor Yellow
Write-Host "`nOr add them via Vercel dashboard:" -ForegroundColor Green
Write-Host "  https://vercel.com/lorebase/lore/settings/environment-variables" -ForegroundColor Cyan

