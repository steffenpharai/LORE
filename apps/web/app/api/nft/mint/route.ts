import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { prepareFractionalization, calculateContributorShares } from '@/lib/fractionalize';
import { z } from 'zod';

const MintSchema = z.object({
  storyId: z.string(),
});

/**
 * NFT Minting API
 * Mints ERC-721 master NFT and fractionalizes into ERC-1155 shares
 * Phase 5: Automatic minting when story reaches line cap
 */
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storyId } = MintSchema.parse(body);

    // Get story
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        lines: {
          where: { isApproved: true },
          include: { author: true },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const STORY_LINE_CAP = parseInt(process.env.STORY_LINE_CAP || '100');
    if (story.lineCount < STORY_LINE_CAP || !story.isComplete) {
      return NextResponse.json(
        { error: 'Story is not complete yet' },
        { status: 400 }
      );
    }

    if (story.nftTokenId) {
      return NextResponse.json(
        { error: 'Story already minted' },
        { status: 400 }
      );
    }

    // Generate story metadata URI
    // In production, this would be uploaded to IPFS
    const baseUrl = process.env.NEXT_PUBLIC_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000');
    const metadataUri = `${baseUrl}/api/stories/${storyId}/metadata`;

    // Note: Actual contract minting would happen here
    // For now, we'll prepare the data and store it
    // The actual minting would be done via a contract call (wagmi/viem)
    // Contract addresses should be in environment variables:
    // - LORE_STORY_MASTER_CONTRACT
    // - LORE_SHARES_CONTRACT

    // Prepare fractionalization data
    const fractionalizationData = await prepareFractionalization(storyId, 0); // masterTokenId will be set after minting

    // For now, we'll simulate the minting and store the data
    // In production, you would:
    // 1. Call LoreStoryMaster.mintStory() to mint master NFT
    // 2. Get the master token ID from the transaction
    // 3. Call LoreShares.batchMintShares() to fractionalize
    // 4. Store the token IDs in the database

    // Simulate minting (replace with actual contract call)
    const masterTokenId = Math.floor(Math.random() * 1000000); // Placeholder

    // Update story with NFT token ID
    await prisma.story.update({
      where: { id: storyId },
      data: {
        nftTokenId: masterTokenId,
        isComplete: true,
      },
    });

    // Store share distribution
    // Get shares with userIds from fractionalization
    const shares = await calculateContributorShares(storyId);
    
    for (let i = 0; i < shares.length; i++) {
      await prisma.storyShare.upsert({
        where: {
          storyId_userId: {
            storyId,
            userId: shares[i].userId,
          },
        },
        create: {
          storyId,
          userId: shares[i].userId,
          shareAmount: shares[i].shareAmount,
          tokenId: i + 1, // Placeholder token ID
        },
        update: {
          shareAmount: shares[i].shareAmount,
          tokenId: i + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      masterTokenId,
      fractionalization: {
        recipients: fractionalizationData.recipients.length,
        totalShares: fractionalizationData.amounts.reduce((a, b) => a + b, 0),
      },
      message: 'NFT minted and fractionalized. Contract addresses required for on-chain minting.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('NFT mint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

