# LORE MACHINE

Decentralized collaborative lore generator for Base tokens. Transform meme momentum into canonical community IP.

## Design Philosophy

LORE MACHINE is built with a **frame-first** approach, ensuring every interaction happens seamlessly within the Farcaster frame. The UX emphasizes:

- **Cinematic Minimalism**: Bold typography, fluid transitions, Base's electric-blue accent palette
- **Emotive Feedback**: Every vote, approval, or mint feels alive with particle bursts, token shimmer, and subtle animations
- **Status Signaling**: Contributor badges ("Canonical Author", "Lore Smith") with pride-inducing visual hierarchy
- **Viral Loop Anchors**: Each action ends with a "Viral Exit" cast for instant sharing
- **Frictionless Flow**: One-tap everything with auto-auth via FID Quick Auth

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Fonts**: Inter (body) + Space Grotesk (headings)
- **Onchain**: OnchainKit, wagmi, viem
- **Database**: Prisma + PostgreSQL
- **Queueing**: BullMQ + Redis
- **Notifications**: Neynar
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- PostgreSQL database
- Redis (optional for MVP)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.sample .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Component Map

### Pages
- `/` - Landing page with hero, live canon, and stats
- `/vote` - Voting screen with swipe-based UX
- `/profile` - User profile with badges, balance, and contributions
- `/story/[id]` - Story complete view with typewriter animation

### Components

#### UI Components (`components/ui/`)
- `button.tsx` - Button with multiple variants
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialogs
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `badge.tsx` - Status badges
- `progress.tsx` - Progress bars

#### LORE Components (`components/lore/`)
- `LoreLine.tsx` - Animated lore line
- `StoryCanon.tsx` - Scrolling canon view
- `VoteCard.tsx` - Swipeable voting card
- `TokenBalance.tsx` - $LORE balance display
- `AuthorBadge.tsx` - PFP badge overlay
- `ConfettiBurst.tsx` - Celebration animation
- `ComposerModal.tsx` - Lore submission modal
- `ShareModal.tsx` - Viral exit share interface

### Hooks (`hooks/`)
- `useLoreAnimation.ts` - Spring-based animations
- `useVoteAnimation.ts` - Coin-flip vote feedback
- `useTokenGlow.ts` - Pulsing token glow
- `useTypewriter.ts` - Typewriter effect
- `use-sign-in.ts` - Farcaster authentication

### API Routes (`app/api/`)
- `/api/auth/sign-in` - Farcaster sign-in
- `/api/auth/verify` - JWT verification
- `/api/stories` - Fetch stories
- `/api/submit` - Submit lore line
- `/api/vote` - Vote on lore line
- `/api/claim/batch` - Batch claim $LORE
- `/api/og` - Dynamic OG image generation
- `/api/notifications` - Neynar notifications

## Animation Guide

### Spring Animations
Use spring-based animations for natural, bouncy motion:

```typescript
import { springConfig } from "@/lib/animations";

<motion.div
  animate={{ scale: 1 }}
  transition={springConfig}
>
```

### Staggered Animations
For lists of items:

```typescript
import { useStaggeredLoreAnimation } from "@/hooks/useLoreAnimation";

const { containerVariants, itemVariants } = useStaggeredLoreAnimation();
```

### Typewriter Effect
For story display:

```typescript
import { useTypewriter } from "@/hooks/useTypewriter";

const { displayedText } = useTypewriter(text, { speed: 50 });
```

## Development Workflow

1. **Design System**: See `DESIGN_SYSTEM.md` for tokens, colors, typography
2. **Components**: Build reusable components in `components/`
3. **Pages**: Create pages in `app/` using App Router
4. **API Routes**: Add API endpoints in `app/api/`
5. **Animations**: Use Framer Motion with shared configs
6. **Testing**: Test in Farcaster frame via Base preview tool

## Deployment

### Vercel

1. Link repository:
```bash
vercel link
```

2. Set environment variables in Vercel dashboard

3. Deploy:
```bash
vercel --prod
```

### Environment Variables

See `env.sample` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEYNAR_API_KEY` - Neynar API key
- `BASE_PAYMASTER_URL` - Base Paymaster URL
- `ALCHEMY_BASE_RPC` - Base RPC endpoint
- `JWT_SECRET` - JWT signing secret
- And more...

## Base Mini-App Compliance

- ✅ Manifest & metadata (`/.well-known/farcaster.json`)
- ✅ Client-agnostic copy ("Share to feed", not "Share to Farcaster")
- ✅ Quick Auth JWT validation
- ✅ Sponsored/batched transactions (EIP-5792)
- ✅ Neynar notifications implemented
- ✅ Passes Base Mini-App Preview validation

## Performance

- **Lazy Loading**: Heavy components loaded on demand
- **Code Splitting**: Automatic via Next.js
- **Memoization**: Expensive renders optimized
- **Image Optimization**: Next.js Image component
- **Target**: Lighthouse 95+ performance, 90+ accessibility

## Accessibility

- WCAG-AA contrast ratios
- Keyboard navigation
- ARIA labels
- Reduced motion support
- Screen reader friendly

## License

MIT
