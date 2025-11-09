# Add Environment Variables to Vercel

Since `.env.local` is gitignored, you need to manually add environment variables to Vercel.

## Option 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/lorebase/lore/settings/environment-variables
2. Click "Add New" for each variable
3. Add variables for all environments (Production, Preview, Development)

## Option 2: Vercel CLI (Interactive)

Run this for each variable:

```bash
npx vercel env add <VARIABLE_NAME> production
npx vercel env add <VARIABLE_NAME> preview  
npx vercel env add <VARIABLE_NAME> development
```

## Required Variables

Based on `env.sample`, add these variables:

### Database
- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Supabase
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

### Authentication
- `JWT_SECRET`
- `JWT_DOMAIN`

### Services
- `NEYNAR_API_KEY`
- `REDIS_URL` (optional)
- `BASE_PAYMASTER_URL`
- `ALCHEMY_BASE_RPC`

### MiniKit
- `NEXT_PUBLIC_MINIKIT_PROJECT_ID`
- `NEXT_PUBLIC_BASE_ENV`

### App Config
- `BASE_ENV`
- `STORY_LINE_CAP`
- `VOTE_THRESHOLD`
- `MAX_LINES_PER_DAY_PER_FID`
- `VERCEL_ENV`

## Quick Add Script

You can also use PowerShell to help:

```powershell
# Read your .env.local and show what needs to be added
Get-Content .env.local | Where-Object { $_ -match '^[^#].*=' } | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        Write-Host "npx vercel env add $key production"
    }
}
```

