import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { calculateRoyaltyDistribution, recordRoyaltyPayment } from '@/lib/royalties';
import { z } from 'zod';

const DistributeSchema = z.object({
  storyId: z.string(),
  saleAmount: z.number().positive(),
  royaltyPercentage: z.number().min(0).max(100).optional(),
});

/**
 * Royalty Distribution API
 * Distribute royalties from NFT sales to contributors
 * Phase 6: Royalty distribution system
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
    const { storyId, saleAmount, royaltyPercentage = 10 } = DistributeSchema.parse(body);

    // Record the royalty payment
    await recordRoyaltyPayment(storyId, saleAmount, royaltyPercentage);

    // Calculate distribution
    const royaltyAmount = (saleAmount * royaltyPercentage) / 100;
    const distribution = await calculateRoyaltyDistribution(storyId, royaltyAmount);

    return NextResponse.json({
      success: true,
      storyId,
      saleAmount,
      royaltyAmount,
      royaltyPercentage,
      distribution,
      message: 'Royalty distribution calculated. Actual transfers would be executed on-chain.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Royalty distribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

