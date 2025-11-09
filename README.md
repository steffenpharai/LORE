# LORE MACHINE

> Decentralized collaborative lore generator for Base/Farcaster tokens that transforms meme momentum into canonical community IP with built-in monetization.

## 🚀 Quick Deploy

```bash
# One-line Vercel deploy
vercel --prod
```

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database
- Redis instance
- GitHub account (for repository)
- Vercel account
- Base Sepolia RPC access (for testing - Chain ID: 84532)
- Neynar API key

## 🏗️ Architecture

```
LORE/
├── apps/
│   └── web/              # Next.js frontend + API routes
├── contracts/            # Solidity smart contracts (Foundry)
├── packages/
│   └── sdk/              # Shared TypeScript SDK
└── infra/                # Deployment scripts
```

## 🔧 Setup

### 1. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Environment Variables

Copy `apps/web/env.sample` to `apps/web/.env.local` and fill in:

```bash
cp apps/web/env.sample apps/web/.env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEYNAR_API_KEY` - Neynar API key for Farcaster integration
- `JWT_SECRET` - Secret for JWT token signing
- `ALCHEMY_BASE_RPC` - Base Sepolia RPC URL (for testing - Chain ID: 84532)
- `NEXT_PUBLIC_BASE_ENV` - Set to `staging` for Base Sepolia, `prod` for Base Mainnet

### 3. Database Setup

```bash
cd apps/web
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Deploy Contracts to Base Sepolia (Testing)

```bash
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test

# Deploy to Base Sepolia (testnet)
# Make sure ALCHEMY_BASE_RPC is set to Base Sepolia endpoint
pnpm run deploy:sepolia
```

## 🎯 Features

### Core Flow

1. **0-Click Entry**: Submit lore via Farcaster Frame with Quick Auth (FID-based JWT)
2. **Co-Creation Loop**:
   - Submit one line of lore
   - Community votes/tips with $LORE points
   - Approved lines append to story canon
   - Authors earn $LORE points
   - Automatic viral cast on approval
3. **Financial Engine**:
   - Off-chain $LORE points (mirrored on-chain)
   - Batch claiming with gas-sponsored EIP-5792
   - Fractionalized NFTs (ERC-721 master + ERC-1155 shares)
   - Automatic royalty distribution

## 📦 Deployment

### Vercel Deployment

1. **Link Repository**:
   ```bash
   vercel link
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `env.sample`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Base Mini App Requirements

- ✅ Manifest at `/.well-known/farcaster.json`
- ✅ Client-agnostic copy ("Share to feed")
- ✅ Quick Auth JWT validation
- ✅ Sponsored/batched transactions (EIP-5792)
- ✅ Neynar notifications
- ✅ Base Mini-App Preview validation

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test contracts
cd contracts
forge test

# Test web app
cd apps/web
pnpm test
```

## 📚 API Endpoints

- `POST /api/auth/verify` - Verify Farcaster JWT token
- `POST /api/submit` - Submit a new line of lore
- `POST /api/vote` - Vote/tip on a line
- `GET /api/stories` - Get active stories
- `POST /api/notifications/cast` - Cast to Farcaster feed

## 🔐 Smart Contracts

- **LoreToken** (ERC-20): $LORE token for rewards
- **LoreStoryMaster** (ERC-721): Master NFT for completed stories
- **LoreShares** (ERC-1155): Fractionalized shares of stories
- **ClaimManager**: Merkle-based batch claiming system

## 📖 Documentation

- [Base Mini Apps Docs](https://docs.base.org/mini-apps)
- [OnchainKit](https://docs.base.org/onchainkit)
- [Neynar API](https://docs.neynar.com)

## 🎬 Demo Script (90 sec pitch)

> "LORE MACHINE transforms meme momentum into canonical IP. Users submit one line of lore through a Farcaster Frame—no wallet needed. The community votes with $LORE points. When a line hits the threshold, it becomes canon, the author earns rewards, and we automatically cast 'I just became an Author...' to their feed. Once a story reaches 100 lines, we mint a master NFT and fractionalize it into ERC-1155 shares, with royalties auto-distributed to contributors. It's collaborative storytelling with built-in monetization, all on Base."

## 📝 License

MIT

## 🤝 Contributing

This is a Base Mini App. Contributions welcome! Please ensure:
- Base Mini App guidelines compliance
- All tests pass
- Code follows project style guide

---

Built with ❤️ for Base & Farcaster

