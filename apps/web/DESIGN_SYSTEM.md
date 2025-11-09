# LORE MACHINE Design System

## Overview

LORE MACHINE uses a Base-compliant design system that emphasizes cinematic minimalism, emotive feedback, and viral engagement. The design system is built on Tailwind CSS v4 with custom design tokens and Framer Motion animations.

## Color Palette

### Primary Colors
- **Base Blue**: `#0052FF` - Primary actions, links, accents
- **Base Blue Hover**: `#0040CC` - Interactive states
- **Base Blue Light**: `#3366FF` - Subtle highlights
- **Base Blue Dark**: `#003399` - Deep accents

### Secondary Colors
- **Farcaster Purple**: `#8B5CF6` - Secondary actions, badges
- **Farcaster Purple Hover**: `#7C3AED` - Interactive states
- **Farcaster Purple Light**: `#A78BFA` - Subtle highlights
- **Farcaster Purple Dark**: `#6D28D9` - Deep accents

### Neutral Palette
- **Black**: `#000000` - Primary background
- **White**: `#FFFFFF` - Primary text
- **Gray Scale**: 50-900 for UI elements and text hierarchy

### Status Colors
- **Success**: `#10B981` - Approved states, positive feedback
- **Error**: `#EF4444` - Errors, rejections
- **Warning**: `#F59E0B` - Warnings, pending states
- **Info**: `#3B82F6` - Informational messages

## Typography

### Font Families
- **Sans (Body)**: Inter - Used for body text, UI elements
- **Display (Headings)**: Space Grotesk - Used for hero text, headings
- **Mono**: System monospace - Used for code, technical content

### Font Sizes
- **xs**: 12px
- **sm**: 14px
- **base**: 16px
- **lg**: 18px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 30px
- **4xl**: 36px
- **5xl**: 48px
- **6xl**: 60px

### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing

Using a consistent spacing scale:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px
- **4xl**: 96px

## Border Radius

- **sm**: 2px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px
- **2xl**: 16px
- **full**: 9999px (circular)

## Shadows

- **sm**: Subtle elevation
- **md**: Standard card elevation
- **lg**: Prominent elevation
- **xl**: Maximum elevation
- **glow**: Base blue glow effect
- **baseGlow**: Purple glow effect

## Animation

### Spring Configurations
- **Standard Spring**: Stiffness 300, Damping 30, Mass 0.5
- **Gentle Spring**: Stiffness 200, Damping 25
- **Bouncy Spring**: Stiffness 400, Damping 10

### Duration
- **Fast**: 150ms
- **Normal**: 300ms
- **Slow**: 500ms

### Easing
- **easeIn**: `cubic-bezier(0.4, 0, 1, 1)`
- **easeOut**: `cubic-bezier(0, 0, 0.2, 1)`
- **easeInOut**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

## Components

### UI Components (shadcn/ui)
- **Button**: Primary, secondary, ghost, outline, glow variants
- **Card**: Container for content with header, content, footer
- **Dialog**: Modal dialogs with overlay
- **Input**: Text input fields
- **Textarea**: Multi-line text input
- **Badge**: Status indicators with variants
- **Progress**: Progress bars with gradient

### LORE Components
- **LoreLine**: Animated lore line with author attribution
- **StoryCanon**: Scrolling canon view with typewriter effect
- **VoteCard**: Swipeable voting card with feedback
- **TokenBalance**: $LORE balance display with shimmer
- **AuthorBadge**: Dynamic badge overlay for PFP
- **ConfettiBurst**: Celebration animation
- **ComposerModal**: Lore submission modal
- **ShareModal**: Viral exit share interface

## Animation Hooks

- **useLoreAnimation**: Spring-based animations for lore lines
- **useVoteAnimation**: Coin-flip vote feedback
- **useTokenGlow**: Pulsing token glow effect
- **useTypewriter**: Typewriter effect for story display

## Accessibility

- WCAG-AA contrast ratios
- Keyboard navigation support
- ARIA labels on interactive elements
- Reduced motion variants
- Screen reader friendly announcements

## Usage

Import design tokens:
```typescript
import { colors, spacing, typography } from "@/lib/design-tokens";
```

Use animation configs:
```typescript
import { springConfig, fadeIn } from "@/lib/animations";
```

Apply utility classes:
```tsx
<div className="gradient-base glow-purple">
  Content
</div>
```

