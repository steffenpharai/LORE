import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
      include: {
        authoredLines: {
          where: { isApproved: true },
          include: {
            story: {
              select: { id: true, title: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        votes: {
          select: { id: true },
        },
        challengeSubmissions: {
          include: {
            challenge: {
              select: { id: true, theme: true, winnerFid: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate badges
    const badges: string[] = [];
    const approvedCount = user.authoredLines.length;
    if (approvedCount > 0) badges.push('canonical-author');
    if (approvedCount >= 10) badges.push('lore-smith');
    if (approvedCount >= 50) badges.push('top-contributor');
    if (user.currentStreak >= 7) badges.push('ritual-master');
    if (user.challengeSubmissions.length > 0) {
      const hasWon = user.challengeSubmissions.some(
        (sub) => sub.challenge.winnerFid === user.fid
      );
      if (hasWon) badges.push('weekly-winner');
    }
    if (approvedCount === 1) badges.push('first-author');
    if (user.authoredLines.length > 0) badges.push('co-creator');

    // Calculate pending claims (simplified - would check actual claimable amount)
    const pending = user.lorePoints; // For now, all points are claimable

    const profileData = {
      id: user.id,
      fid: user.fid,
      username: user.username,
      bio: user.bio,
      theme: user.theme,
      customAvatarUrl: user.customAvatarUrl,
      lorePoints: user.lorePoints,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastSubmissionDate: user.lastSubmissionDate,
      balance: 0, // On-chain balance would be fetched separately
      pending,
      totalContributions: user.authoredLines.length,
      approvedContributions: approvedCount,
      totalVotes: user.votes.length,
      badges,
      contributions: user.authoredLines.map((line) => ({
        id: line.id,
        content: line.content,
        lineNumber: line.lineNumber,
        story: {
          id: line.story.id,
          title: line.story.title,
        },
        isApproved: line.isApproved,
        votes: line.voteCount,
        createdAt: line.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ user: profileData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

