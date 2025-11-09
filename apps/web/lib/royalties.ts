/**
 * Royalty Distribution Service
 * Calculate and distribute royalties based on ERC-1155 share ownership
 */

import { prisma } from './prisma';

export interface RoyaltyDistribution {
  userId: string;
  address: string;
  shareAmount: number;
  royaltyAmount: number;
  percentage: number;
}

/**
 * Calculate royalty distribution for a story
 * Based on ERC-1155 share ownership
 */
export async function calculateRoyaltyDistribution(
  storyId: string,
  totalRoyaltyAmount: number
): Promise<RoyaltyDistribution[]> {
  // Get all share holders
  const shares = await prisma.storyShare.findMany({
    where: { storyId },
    include: {
      user: {
        select: {
          id: true,
          fid: true,
        },
      },
    },
  });

  // Calculate total shares
  const totalShares = shares.reduce((sum, share) => sum + share.shareAmount, 0);

  if (totalShares === 0) {
    return [];
  }

  // Calculate royalty per share
  const royaltyPerShare = totalRoyaltyAmount / totalShares;

  // Fetch custody addresses from Neynar
  const { fetchUser } = await import('./neynar');
  const distribution: RoyaltyDistribution[] = [];
  
  for (const share of shares) {
    try {
      const neynarUser = await fetchUser(share.user.fid.toString());
      if (neynarUser.custody_address) {
        const royaltyAmount = (share.shareAmount / totalShares) * totalRoyaltyAmount;
        const percentage = (share.shareAmount / totalShares) * 100;

        distribution.push({
          userId: share.userId,
          address: neynarUser.custody_address,
          shareAmount: share.shareAmount,
          royaltyAmount,
          percentage,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch address for user ${share.user.fid}:`, error);
    }
  }

  return distribution;
}

/**
 * Record royalty payment
 * This would be called when an NFT sale occurs
 */
export async function recordRoyaltyPayment(
  storyId: string,
  saleAmount: number,
  royaltyPercentage: number = 10 // 10% royalty (standard)
): Promise<void> {
  const royaltyAmount = (saleAmount * royaltyPercentage) / 100;

  // Calculate distribution
  const distribution = await calculateRoyaltyDistribution(storyId, royaltyAmount);

  // In production, you would:
  // 1. Transfer royalties to contributors' addresses
  // 2. Record the payment in the database
  // 3. Emit events for tracking

  // For now, we'll just log the distribution
  console.log('Royalty distribution:', {
    storyId,
    saleAmount,
    royaltyAmount,
    distribution,
  });
}

/**
 * Get royalty history for a user
 */
export async function getUserRoyaltyHistory(userId: string): Promise<{
  totalEarned: number;
  distributions: Array<{
    storyId: string;
    amount: number;
    date: Date;
  }>;
}> {
  // This would query a royalty payments table
  // For now, return placeholder
  return {
    totalEarned: 0,
    distributions: [],
  };
}

