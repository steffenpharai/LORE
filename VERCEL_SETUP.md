# Vercel Setup Complete ✅

## Project Linked

- **Project Name**: `lorebase/web`
- **Project ID**: `prj_4oY1DFWsRgU2i4Q8xrrPhWZoNz2U`
- **Organization**: `team_Rhs9CaYpWahAZabTQf3BdYuk`
- **Linked Directory**: `apps/web`

## Next Steps

### 1. Add Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add all environment variables from `apps/web/env.sample`:

**Required Variables:**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - Prisma connection string (with pgbouncer)
- `JWT_SECRET` - Secret for JWT token signing
- `NEYNAR_API_KEY` - Your Neynar API key
- `NEXT_PUBLIC_MINIKIT_PROJECT_ID` - Your MiniKit project ID
- `NEXT_PUBLIC_BASE_ENV` - `staging` or `prod`
- `BASE_PAYMASTER_URL` - Base Paymaster URL
- `ALCHEMY_BASE_RPC` - Your Alchemy Base RPC URL

**Optional Variables:**
- `REDIS_URL` - Redis connection string (if using)
- `STORY_LINE_CAP` - Default: 100
- `VOTE_THRESHOLD` - Default: 100
- `MAX_LINES_PER_DAY_PER_FID` - Default: 5

### 2. Deploy to Vercel

```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

### 3. Run Database Migrations

After deployment, run Prisma migrations:

```bash
cd apps/web
npx prisma migrate deploy
```

Or set up a migration script in Vercel's build command.

## Current Status

✅ Project linked to Vercel
✅ Build passes locally
✅ All dependencies installed
✅ Prisma client generated
⚠️ Environment variables need to be added in Vercel dashboard

## Vercel Project Settings

The project is configured with:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Development Command**: `npm run dev`
- **Install Command**: `npm install`
- **Output Directory**: Next.js default

