import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymaster } from '@/lib/paymaster';

/**
 * Batch claim endpoint with Base Paymaster gas sponsorship
 * Implements EIP-5792 for batch transactions
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
    const { claims, chainId = 84532 } = body; // Default to Base Sepolia (testnet)

    if (!Array.isArray(claims) || claims.length === 0) {
      return NextResponse.json(
        { error: 'Claims array required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
      include: { claims: { where: { isClaimed: false } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify claims belong to user and are unclaimed
    const validClaims = user.claims.filter((claim: { id: string }) =>
      claims.some((c: { id: string }) => c.id === claim.id)
    );

    if (validClaims.length === 0) {
      return NextResponse.json(
        { error: 'No valid unclaimed rewards found' },
        { status: 400 }
      );
    }

    // Prepare batch user operations for paymaster
    const totalAmount = validClaims.reduce((sum, claim) => sum + claim.amount, 0);

    // In a real implementation, you would:
    // 1. Build the actual user operations for ERC-20 token claims
    // 2. Request paymaster sponsorship
    // 3. Execute the batch transaction

    // For now, we'll return the prepared batch data
    // The frontend would use this with wagmi to execute the transaction

    const batchData = {
      chainId,
      totalAmount,
      claimIds: validClaims.map((c) => c.id),
      paymasterAvailable: await paymaster.isAvailable(chainId),
    };

    return NextResponse.json({
      batch: batchData,
      message: 'Batch claim prepared. Use wagmi to execute with paymaster sponsorship.',
    });
  } catch (error) {
    console.error('Batch claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

