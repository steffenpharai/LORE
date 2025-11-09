# Base Mini App Verification Checklist

## ✅ Base Mini App Requirements

### 1. Manifest & Metadata
- ✅ **Status**: Implemented
- **Location**: `apps/web/public/.well-known/farcaster.json`
- **Details**: 
  - Account association headers configured
  - Frame configuration with launch_frame action
  - Signed identity request enabled
  - Webhook URL configured

### 2. Quick Auth (FID-based JWT)
- ⚠️ **Status**: Custom Implementation (Needs Base Quick Auth)
- **Current**: Custom JWT with FID in payload
- **Required**: Should use Farcaster's Quick Auth signed identity requests
- **Location**: `apps/web/lib/auth.ts`, `apps/web/app/api/auth/verify/route.ts`
- **Action Needed**: Integrate `@farcaster/miniapp-sdk` Quick Auth properly

### 3. Client-Agnostic Copy
- ⚠️ **Status**: Needs Verification
- **Required**: Use "Share to feed" not "Share to Farcaster"
- **Location**: Check all UI text in `apps/web/app/page.tsx` and components
- **Action Needed**: Review and update all user-facing text

### 4. Sponsored/Batched Transactions (EIP-5792)
- ❌ **Status**: Not Implemented
- **Required**: Base Paymaster integration for gas sponsorship
- **Location**: Should be in transaction handling code
- **Action Needed**: Implement paymaster integration for batch claims

### 5. Neynar Notifications
- ✅ **Status**: Implemented
- **Location**: `apps/web/app/api/notifications/cast/route.ts`
- **Details**: 
  - NeynarAPIClient configured
  - Cast publishing implemented
  - Free tier rate limit handling (user removed, but structure exists)

### 6. OnchainKit Integration
- ⚠️ **Status**: Dependency Added, Not Used
- **Package**: `@coinbase/onchainkit` in package.json
- **Action Needed**: Integrate OnchainKit components for wallet connections and on-chain interactions

### 7. Dependencies Verification

#### Required Dependencies
- ✅ `@farcaster/miniapp-sdk` - Added to package.json
- ✅ `@coinbase/onchainkit` - Added to package.json  
- ✅ `wagmi` - Added to package.json
- ✅ `viem` - Added to package.json
- ✅ `neynar` - Added to package.json

#### Missing Integrations
- ❌ OnchainKit components not used in frontend
- ❌ Wagmi provider not configured
- ❌ Base Paymaster integration missing

## 📋 Implementation Gaps

### Critical
1. **Quick Auth**: Need to use Farcaster's Quick Auth from `@farcaster/miniapp-sdk` instead of custom JWT
2. **Base Paymaster**: EIP-5792 batch transaction support not implemented
3. **OnchainKit**: Not integrated in frontend components

### Important
4. **Client-Agnostic Copy**: Need to verify all UI text
5. **Frame Integration**: Need to verify Frame flow works with Quick Auth

## 🔧 Next Steps

1. **Integrate Quick Auth properly**:
   ```typescript
   // Should use @farcaster/miniapp-sdk QuickAuth
   import { QuickAuth } from '@farcaster/miniapp-sdk';
   ```

2. **Add OnchainKit Provider**:
   ```typescript
   // Wrap app with OnchainKitProvider
   import { OnchainKitProvider } from '@coinbase/onchainkit';
   ```

3. **Implement Paymaster**:
   - Add Base Paymaster URL configuration
   - Implement EIP-5792 batch transaction support
   - Add gas sponsorship for claims

4. **Review UI Text**:
   - Replace "Farcaster" with "feed" where appropriate
   - Ensure client-agnostic language

## 📚 Reference Documentation

- [Base Mini Apps Docs](https://docs.base.org/mini-apps)
- [Quick Auth Guide](https://docs.base.org/mini-apps/core-concepts/authentication)
- [OnchainKit](https://docs.base.org/onchainkit)
- [Neynar Integration](https://docs.base.org/mini-apps/technical-guides/neynar-notifications)
- [Base Paymaster](https://docs.base.org/mini-apps/technical-guides/accept-payments)

