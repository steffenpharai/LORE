"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoreLine } from "@/components/lore/LoreLine";
import { useSignIn } from "@/hooks/use-sign-in";
import { ArrowLeft, Trophy, Clock, Users, PenTool } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChallengeSubmission {
  id: string;
  line: {
    id: string;
    content: string;
    voteCount: number;
    author: {
      fid: number;
      username: string | null;
    };
  };
  user: {
    fid: number;
    username: string | null;
  };
  createdAt: string;
}

interface WeeklyChallenge {
  id: string;
  theme: string;
  prompt: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  winnerFid: number | null;
  submissionCount: number;
  topSubmissions: ChallengeSubmission[];
}

export default function WeeklyChallengePage() {
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user, signIn } = useSignIn({ autoSignIn: true });

  useEffect(() => {
    fetchChallenge();
    // Refresh every minute to update countdown
    const interval = setInterval(fetchChallenge, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchChallenge = async () => {
    try {
      const res = await fetch("/api/rituals/weekly-challenge");
      const data = await res.json();
      setChallenge(data.challenge);
    } catch (error) {
      console.error("Failed to fetch challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <div className="animate-pulse text-[--gray-400]">Loading challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[--background]">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-[--gray-600] mx-auto mb-4" />
              <p className="text-xl text-[--gray-400]">
                No active challenge at this time
              </p>
              <p className="text-sm text-[--gray-500] mt-2">
                Check back soon for the next weekly challenge!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeRemaining = challenge.daysRemaining;
  const isActive = timeRemaining > 0;

  return (
    <div className="min-h-screen bg-[--background]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Challenge Header */}
        <Card className="mb-8 border-[--farcaster-purple] bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-[--farcaster-purple]" />
                Weekly Challenge: {challenge.theme}
              </CardTitle>
              {isActive && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeRemaining} {timeRemaining === 1 ? 'day' : 'days'} left
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xl text-white font-medium">{challenge.prompt}</p>
            <div className="flex items-center gap-4 text-sm text-[--gray-400]">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {challenge.submissionCount} {challenge.submissionCount === 1 ? 'submission' : 'submissions'}
              </div>
              {challenge.winnerFid && (
                <Badge variant="success">
                  Winner Announced
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {challenge.topSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenge.topSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 rounded-lg border",
                    index === 0 && "border-yellow-500 bg-yellow-500/10",
                    index === 1 && "border-[--gray-600] bg-[--gray-800]/50",
                    index === 2 && "border-orange-500 bg-orange-500/10",
                    index > 2 && "border-[--gray-800] bg-[--gray-900]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 && "bg-yellow-500 text-black",
                      index === 1 && "bg-[--gray-600] text-white",
                      index === 2 && "bg-orange-500 text-white",
                      index > 2 && "bg-[--gray-800] text-[--gray-400]"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <LoreLine
                        content={submission.line.content}
                        lineNumber={0}
                        author={submission.line.author}
                        isApproved={true}
                        votes={submission.line.voteCount}
                      />
                      <div className="mt-2 text-xs text-[--gray-400]">
                        by @{submission.user.username || submission.user.fid}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Submit CTA */}
        {isActive && (
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              {isSignedIn ? (
                <div className="space-y-4">
                  <p className="text-[--gray-400]">
                    Submit a line to this week's challenge!
                  </p>
                  <Link href="/">
                    <Button variant="glow" size="lg">
                      <PenTool className="mr-2 h-5 w-5" />
                      Add Your Line
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[--gray-400]">
                    Sign in to participate in the weekly challenge
                  </p>
                  <Button variant="glow" size="lg" onClick={signIn}>
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

