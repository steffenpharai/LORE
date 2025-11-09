# LORE MACHINE Deployment Guide

## Vercel Project

- **Project Name**: `lorebase/lore`
- **Project ID**: `prj_AXLMonVcX82iZVKrNrLrxnIlOgex`
- **Dashboard**: https://vercel.com/lorebase/lore
- **Environment Variables**: https://vercel.com/lorebase/lore/settings/environment-variables

## Quick Deploy

### PowerShell (Windows)

```powershell
cd apps/web
.\scripts\deploy.ps1
```

### Bash (Linux/Mac)

```bash
cd apps/web
../../infra/deploy.sh
```

### Manual Deploy

```bash
cd apps/web
npx vercel --prod
```

## Environment Variables

Environment variables are already configured in Vercel dashboard. To update them:

### Option 1: Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/lorebase/lore/settings/environment-variables
2. Add/Edit variables for Production, Preview, and Development

### Option 2: PowerShell Script
```powershell
cd apps/web
.\scripts\add-env-to-vercel.ps1
```

This script reads `.env.local` and adds all variables to Vercel.

## Deployment Workflow

1. **Make changes** to your code
2. **Test locally**: `npm run dev` (in `apps/web`)
3. **Build locally**: `npm run build` (in `apps/web`)
4. **Deploy**: Run `.\scripts\deploy.ps1` or `npx vercel --prod`

## Scripts Reference

All scripts should be run from `apps/web` directory:

- `scripts/deploy.ps1` - Full deployment script (PowerShell)
- `scripts/add-env-to-vercel.ps1` - Add env vars from .env.local to Vercel
- `infra/deploy.sh` - Full deployment script (Bash)

## Current Status

✅ Project linked to Vercel (`lorebase/lore`)
✅ Environment variables configured
✅ Build passes locally
✅ Successfully deployed

## Troubleshooting

### "Project not set up"
Make sure you're in the `apps/web` directory:
```powershell
cd apps/web
npx vercel --prod
```

### "Environment Variable not found"
Add variables via dashboard or run:
```powershell
.\scripts\add-env-to-vercel.ps1
```

### Build fails
1. Test locally: `npm run build`
2. Check environment variables in Vercel dashboard
3. Verify Prisma schema: `npx prisma generate`

