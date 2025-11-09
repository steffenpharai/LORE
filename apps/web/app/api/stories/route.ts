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
              },
            },
          },
        },
      },
      orderBy: { totalVotes: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Stories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

