# LORE MACHINE Setup Guide

## ✅ Completed

- ✅ Monorepo structure created
- ✅ Next.js app initialized with TypeScript
- ✅ Prisma schema with all models
- ✅ API routes for auth, submit, vote, stories, notifications
- ✅ Smart contracts (LoreToken, LoreStoryMaster, LoreShares, ClaimManager)
- ✅ Base Mini App manifest (/.well-known/farcaster.json)
- ✅ Environment variables template
- ✅ Vercel deployment configuration
- ✅ README with deployment instructions
- ✅ Initial git commit

## 🔧 Next Steps

### 1. GitHub Repository

The GitHub repo creation requires authentication. Run:

```bash
gh auth login
gh repo create LORE --public --source=. --remote=origin
git push -u origin master
```

### 2. Install Dependencies

```bash
# Install pnpm if needed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 3. Database Setup

```bash
cd apps/web

# Generate Prisma client
npx prisma generate

# Run migrations (requires DATABASE_URL in .env.local)
npx prisma migrate dev --name init
```

### 4. Environment Variables

Copy and configure:

```bash
cp apps/web/env.sample apps/web/.env.local
# Edit .env.local with your values
```

### 5. Install Foundry (for contracts)

```bash
# Windows (PowerShell)
irm https://github.com/foundry-rs/foundry/releases/latest/download/foundry_nightly_windows_amd64.tar.gz -OutFile foundry.tar.gz
# Extract and add to PATH

# Or use foundryup (Linux/Mac)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Then install OpenZeppelin:

```bash
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
```

### 6. Vercel Deployment

```bash
# Link project
vercel link

# Set environment variables in Vercel dashboard
# Then deploy
vercel --prod
```

## 📝 Notes

- The project uses pnpm workspaces for monorepo management
- Contracts use Foundry for development and testing
- Frontend uses Next.js 16 with App Router
- Database uses PostgreSQL with Prisma ORM
- Redis is used for queueing (BullMQ) - set up Redis instance
- Neynar API key required for Farcaster integration

## 🐛 Known Issues

- Some dependencies may need version adjustments based on actual package availability
- Foundry dependencies need to be installed manually
- GitHub repo creation requires `gh auth login` first

