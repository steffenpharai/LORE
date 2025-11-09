/**
 * Long-Term Rituals system
 * Handles scheduled events, daily prompts, and weekly challenges
 * Supports the Long-Term Rituals pattern from Base viral mini-apps guide
 */

import { prisma } from './prisma';

/**
 * Generate a new daily prompt
 * Should be called via cron job daily at midnight
 */
export async function generateDailyPrompt() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if prompt already exists for today
  const existing = await prisma.dailyPrompt.findUnique({
    where: { date: today },
  });

  if (existing) {
    return existing;
  }

  const prompts = [
    "Write the next line of crypto history.",
    "What happens when memes become canon?",
    "Describe the moment when a token becomes legendary.",
    "Tell the story of the next big thing on Base.",
    "What would you write if you were creating lore for a community?",
    "Imagine the future of decentralized storytelling.",
    "Write a line that captures the spirit of Web3.",
    "What makes a story worth telling in crypto?",
    "Describe the community that builds together.",
    "Tell us about the moment everything changed.",
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return await prisma.dailyPrompt.create({
    data: {
      prompt: randomPrompt,
      date: today,
      submissionCount: 0,
    },
  });
}

/**
 * Create a new weekly challenge
 * Should be called via cron job weekly (e.g., every Monday)
 */
export async function createWeeklyChallenge(
  theme: string,
  prompt: string,
  startDate?: Date,
  endDate?: Date
) {
  const now = startDate || new Date();
  const end = endDate || new Date(now);
  end.setDate(end.getDate() + 7); // 7 days from start

  return await prisma.weeklyChallenge.create({
    data: {
      theme,
      prompt,
      startDate: now,
      endDate: end,
    },
  });
}

/**
 * Select winner for a completed weekly challenge
 * Winner is the submission with the highest vote count
 */
export async function selectWeeklyChallengeWinner(challengeId: string) {
  const challenge = await prisma.weeklyChallenge.findUnique({
    where: { id: challengeId },
    include: {
      submissions: {
        include: {
          line: {
            select: {
              voteCount: true,
              author: {
                select: {
                  fid: true,
                },
              },
            },
          },
        },
        orderBy: {
          line: {
            voteCount: 'desc',
          },
        },
        take: 1,
      },
    },
  });

  if (!challenge || challenge.submissions.length === 0) {
    return null;
  }

  const winner = challenge.submissions[0];
  const winnerFid = winner.line.author.fid;

  // Update challenge with winner
  await prisma.weeklyChallenge.update({
    where: { id: challengeId },
    data: { winnerFid },
  });

  return {
    challengeId,
    winnerFid,
    submissionId: winner.id,
  };
}

/**
 * Process completed weekly challenges
 * Should be called via cron job daily to check for challenges that ended
 */
export async function processCompletedChallenges() {
  const now = new Date();
  
  // Find challenges that ended but don't have a winner yet
  const completedChallenges = await prisma.weeklyChallenge.findMany({
    where: {
      endDate: { lt: now },
      winnerFid: null,
    },
  });

  const results = [];
  for (const challenge of completedChallenges) {
    const result = await selectWeeklyChallengeWinner(challenge.id);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Send ritual reminders (for future implementation with notifications)
 */
export async function sendRitualReminders() {
  // This would integrate with Neynar notifications
  // to remind users about daily prompts and weekly challenges
  // Implementation would go here
  return [];
}

