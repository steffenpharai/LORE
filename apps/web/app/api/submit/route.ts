import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SubmitSchema = z.object({
  storyId: z.string().optional(),
  content: z.string().min(1).max(500),
});

const MAX_LINES_PER_DAY = parseInt(process.env.MAX_LINES_PER_DAY_PER_FID || '5');

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
    const { storyId, content } = SubmitSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await prisma.storyLine.count({
      where: {
        authorId: user.id,
        createdAt: { gte: today },
      },
    });

    if (todaySubmissions >= MAX_LINES_PER_DAY) {
      return NextResponse.json(
        { error: `Daily limit reached (${MAX_LINES_PER_DAY} lines per day)` },
        { status: 429 }
      );
    }

    // Get or create story
    let story;
    if (storyId) {
      story = await prisma.story.findUnique({
        where: { id: storyId },
      });
      if (!story) {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        );
      }
    } else {
      story = await prisma.story.create({
        data: {},
      });
    }

    const STORY_LINE_CAP = parseInt(process.env.STORY_LINE_CAP || '100');
    if (story.lineCount >= STORY_LINE_CAP || story.isComplete) {
      return NextResponse.json(
        { error: 'Story is complete' },
        { status: 400 }
      );
    }

    // Create line
    const nextLineNumber = story.lineCount + 1;
    const line = await prisma.storyLine.create({
      data: {
        storyId: story.id,
        authorId: user.id,
        content: content.trim(),
        lineNumber: nextLineNumber,
      },
    });

    // Update story
    await prisma.story.update({
      where: { id: story.id },
      data: { lineCount: nextLineNumber },
    });

    // Update streak tracking (Long-Term Rituals)
    const now = new Date();
    const lastSubmission = user.lastSubmissionDate;
    let newStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (lastSubmission) {
      const lastDate = new Date(lastSubmission);
      lastDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak = user.currentStreak + 1;
        if (newStreak > user.longestStreak) {
          newLongestStreak = newStreak;
        }
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        newStreak = 1;
      } else if (daysDiff === 0) {
        // Same day - keep streak
        newStreak = user.currentStreak;
      }
    } else {
      // First submission
      newStreak = 1;
      if (newStreak > user.longestStreak) {
        newLongestStreak = newStreak;
      }
    }

    // Update user streak
    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastSubmissionDate: now,
      },
    });

    // Update daily prompt submission count
    const todayForPrompt = new Date(now);
    todayForPrompt.setHours(0, 0, 0, 0);
    await prisma.dailyPrompt.upsert({
      where: { date: todayForPrompt },
      update: {
        submissionCount: { increment: 1 },
      },
      create: {
        date: todayForPrompt,
        prompt: "Write the next line of crypto history.", // Default prompt
        submissionCount: 1,
      },
    });

    return NextResponse.json({
      line: {
        id: line.id,
        content: line.content,
        lineNumber: line.lineNumber,
        storyId: story.id,
      },
      streak: {
        current: newStreak,
        longest: newLongestStreak,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

