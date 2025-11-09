import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeComplete = searchParams.get('includeComplete') === 'true';

    const stories = await prisma.story.findMany({
      where: includeComplete ? {} : { isComplete: false },
      include: {
        lines: {
          where: { isApproved: true },
          orderBy: { lineNumber: 'asc' },
          include: {
            author: {
              select: {
                fid: true,
                username: true,
                customAvatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { totalVotes: 'desc' },
      take: limit,
      skip: offset,
    });

    // Calculate contributor counts and unique contributors
    const storiesWithContributors = stories.map((story) => {
      const contributorFids = new Set<number>();
      story.lines.forEach((line) => {
        contributorFids.add(line.author.fid);
      });

      return {
        ...story,
        contributorCount: contributorFids.size,
        contributors: Array.from(contributorFids).map((fid) => ({
          fid,
          username: story.lines.find((l) => l.author.fid === fid)?.author.username || null,
        })),
        lines: story.lines.map((line) => ({
          ...line,
          author: {
            fid: line.author.fid,
            username: line.author.username,
            // Note: pfp_url comes from Base app context, not database
            // Will be populated on client side from Base context
          },
        })),
      };
    });

    return NextResponse.json({ stories: storiesWithContributors });
  } catch (error) {
    console.error('Stories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

