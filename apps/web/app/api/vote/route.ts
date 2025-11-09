import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VoteSchema = z.object({
  lineId: z.string(),
  amount: z.number().int().min(1).max(1000),
});

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
    const { lineId, amount } = VoteSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_lineId: {
          voterId: user.id,
          lineId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted on this line' },
        { status: 400 }
      );
    }

    // Get line
    const line = await prisma.storyLine.findUnique({
      where: { id: lineId },
      include: { story: true },
    });

    if (!line) {
      return NextResponse.json(
        { error: 'Line not found' },
        { status: 404 }
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        voterId: user.id,
        lineId,
        amount,
      },
    });

    // Update line vote count
    await prisma.storyLine.update({
      where: { id: lineId },
      data: { voteCount: { increment: amount } },
    });

    // Update story total votes
    await prisma.story.update({
      where: { id: line.storyId },
      data: { totalVotes: { increment: amount } },
    });

    // Check if line should be approved
    const VOTE_THRESHOLD = parseInt(process.env.VOTE_THRESHOLD || '100');
    const updatedLine = await prisma.storyLine.findUnique({
      where: { id: lineId },
    });

    if (updatedLine && updatedLine.voteCount >= VOTE_THRESHOLD && !updatedLine.isApproved) {
      await prisma.storyLine.update({
        where: { id: lineId },
        data: { isApproved: true },
      });

      // Award LORE points to author
      await prisma.user.update({
        where: { id: line.authorId },
        data: { lorePoints: { increment: amount } },
      });

      // Sync points to claims for on-chain redemption (Phase 4)
      try {
        const { syncPointsToClaims } = await import('@/lib/token-sync');
        await syncPointsToClaims(line.authorId);
      } catch (syncError) {
        console.error('Failed to sync points to claims:', syncError);
        // Don't fail the vote if sync fails
      }

      // Note: Viral cast is now triggered on submission, not approval (Phase 2)
      // Approval logic only handles LORE point rewards
    }

    return NextResponse.json({
      vote: {
        id: vote.id,
        amount: vote.amount,
        lineId: vote.lineId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

