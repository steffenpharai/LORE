import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SubmitChallengeSchema = z.object({
  lineId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Get current active challenge
    const challenge = await prisma.weeklyChallenge.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        submissions: {
          include: {
            line: {
              select: {
                id: true,
                content: true,
                voteCount: true,
                author: {
                  select: {
                    fid: true,
                    username: true,
                  },
                },
              },
            },
            user: {
              select: {
                fid: true,
                username: true,
              },
            },
          },
          orderBy: {
            line: {
              voteCount: 'desc',
            },
          },
          take: 10, // Top 10 submissions
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!challenge) {
      // Return a default challenge if none exists
      return NextResponse.json({
        challenge: null,
        message: 'No active challenge at this time',
      });
    }

    // Calculate time remaining
    const timeRemaining = challenge.endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        theme: challenge.theme,
        prompt: challenge.prompt,
        startDate: challenge.startDate.toISOString(),
        endDate: challenge.endDate.toISOString(),
        daysRemaining,
        winnerFid: challenge.winnerFid,
        submissionCount: challenge.submissions.length,
        topSubmissions: challenge.submissions.map((sub) => ({
          id: sub.id,
          line: {
            id: sub.line.id,
            content: sub.line.content,
            voteCount: sub.line.voteCount,
            author: sub.line.author,
          },
          user: sub.user,
          createdAt: sub.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Weekly challenge fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { lineId } = SubmitChallengeSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify line exists and belongs to user
    const line = await prisma.storyLine.findUnique({
      where: { id: lineId },
      include: {
        story: true,
      },
    });

    if (!line) {
      return NextResponse.json(
        { error: 'Line not found' },
        { status: 404 }
      );
    }

    if (line.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Line does not belong to user' },
        { status: 403 }
      );
    }

    // Get current active challenge
    const now = new Date();
    const challenge = await prisma.weeklyChallenge.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'No active challenge' },
        { status: 400 }
      );
    }

    // Check if user already submitted
    const existingSubmission = await prisma.challengeSubmission.findUnique({
      where: {
        challengeId_userId: {
          challengeId: challenge.id,
          userId: user.id,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Already submitted to this challenge' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId: challenge.id,
        userId: user.id,
        lineId: line.id,
      },
      include: {
        line: {
          select: {
            id: true,
            content: true,
            voteCount: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        line: submission.line,
        createdAt: submission.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Challenge submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

