import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's prompt
    let prompt = await prisma.dailyPrompt.findUnique({
      where: {
        date: today,
      },
    });

    // If no prompt exists for today, create a default one
    if (!prompt) {
      const prompts = [
        "Write the next line of crypto history.",
        "What happens when memes become canon?",
        "Describe the moment when a token becomes legendary.",
        "Tell the story of the next big thing on Base.",
        "What would you write if you were creating lore for a community?",
        "Imagine the future of decentralized storytelling.",
        "Write a line that captures the spirit of Web3.",
      ];
      
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      prompt = await prisma.dailyPrompt.create({
        data: {
          prompt: randomPrompt,
          date: today,
          submissionCount: 0,
        },
      });
    }

    // Get user's streak if authenticated
    let userStreak = null;
    const auth = getAuthFromRequest(request);
    if (auth) {
      const user = await prisma.user.findUnique({
        where: { fid: auth.fid },
        select: {
          currentStreak: true,
          longestStreak: true,
          lastSubmissionDate: true,
        },
      });

      if (user) {
        userStreak = {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastSubmissionDate: user.lastSubmissionDate?.toISOString() || null,
        };
      }
    }

    return NextResponse.json({
      prompt: {
        id: prompt.id,
        prompt: prompt.prompt,
        date: prompt.date.toISOString(),
        submissionCount: prompt.submissionCount,
      },
      userStreak,
    });
  } catch (error) {
    console.error('Daily prompt fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

