/**
 * Fractionalization Logic
 * Calculate contributor shares and distribute ERC-1155 shares
 */

import { prisma } from './prisma';

export interface ContributorShare {
  userId: string;
  address: string;
  shareAmount: number;
  contributionScore: number;
}

/**
 * Calculate contribution score for a user
 * Based on:
 * - Number of approved lines
 * - Vote amounts received
 * - LORE points earned
 */
export async function calculateContributionScore(
  userId: string,
  storyId: string
): Promise<number> {
  const [approvedLines, totalVotes, lorePoints] = await Promise.all([
    prisma.storyLine.count({
      where: {
        storyId,
        authorId: userId,
        isApproved: true,
      },
    }),
    prisma.vote.aggregate({
      where: {
        line: {
          storyId,
          authorId: userId,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { lorePoints: true },
    }),
  ]);

  const lineScore = approvedLines * 10; // 10 points per approved line
  const voteScore = totalVotes._sum.amount || 0; // 1 point per vote amount
  const pointsScore = (lorePoints?.lorePoints || 0) * 0.1; // 0.1 points per LORE point

  return lineScore + voteScore + pointsScore;
}

/**
 * Calculate shares for all contributors to a story
 */
export async function calculateContributorShares(
  storyId: string
): Promise<ContributorShare[]> {
  // Get all unique contributors (authors of approved lines)
  const contributors = await prisma.storyLine.findMany({
    where: {
      storyId,
      isApproved: true,
    },
    select: {
      authorId: true,
    },
    distinct: ['authorId'],
  });

  // Calculate contribution scores
  const scores = await Promise.all(
    contributors.map(async (contributor) => ({
      userId: contributor.authorId,
      score: await calculateContributionScore(contributor.authorId, storyId),
    }))
  );

  // Get user FIDs to fetch addresses from Neynar
  const users = await prisma.user.findMany({
    where: {
      id: { in: contributors.map((c) => c.authorId) },
    },
    select: {
      id: true,
      fid: true,
    },
  });

  // Fetch custody addresses from Neynar for users with FIDs
  const userMap = new Map<string, string>();
  for (const user of users) {
    try {
      const { fetchUser } = await import('./neynar');
      const neynarUser = await fetchUser(user.fid.toString());
      if (neynarUser.custody_address) {
        userMap.set(user.id, neynarUser.custody_address);
      }
    } catch (error) {
      console.error(`Failed to fetch address for user ${user.fid}:`, error);
    }
  }

  // Calculate total score
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

  if (totalScore === 0) {
    return [];
  }

  // Calculate shares (normalize to 10000 = 100%)
  const TOTAL_SHARES = 10000;
  const shares: ContributorShare[] = scores
    .filter((s) => userMap.has(s.userId))
    .map((s) => {
      const shareAmount = Math.floor((s.score / totalScore) * TOTAL_SHARES);
      return {
        userId: s.userId,
        address: userMap.get(s.userId)!,
        shareAmount,
        contributionScore: s.score,
      };
    })
    .filter((s) => s.shareAmount > 0); // Only include contributors with shares

  return shares;
}

/**
 * Prepare fractionalization data for contract minting
 */
export async function prepareFractionalization(
  storyId: string,
  masterTokenId: number
): Promise<{
  recipients: string[];
  masterIds: number[];
  amounts: number[];
}> {
  const shares = await calculateContributorShares(storyId);

  return {
    recipients: shares.map((s) => s.address),
    masterIds: shares.map(() => masterTokenId),
    amounts: shares.map((s) => s.shareAmount),
  };
}

