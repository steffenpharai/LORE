"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyPromptProps {
  onSubmit: () => void;
  isSignedIn: boolean;
  onSignIn: () => void;
}

interface PromptData {
  prompt: {
    id: string;
    prompt: string;
    date: string;
    submissionCount: number;
  };
  userStreak: {
    currentStreak: number;
    longestStreak: number;
    lastSubmissionDate: string | null;
  } | null;
}

export function DailyPrompt({ onSubmit, isSignedIn, onSignIn }: DailyPromptProps) {
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const res = await fetch("/api/rituals/daily-prompt", {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch prompt");
      }

      const data = await res.json();
      setPromptData(data);
    } catch (error) {
      console.error("Failed to fetch daily prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[--farcaster-purple] bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[--gray-800] rounded w-1/4" />
            <div className="h-6 bg-[--gray-800] rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!promptData) {
    return null;
  }

  const { prompt, userStreak } = promptData;
  const hasSubmittedToday = userStreak?.lastSubmissionDate 
    ? new Date(userStreak.lastSubmissionDate).toDateString() === new Date().toDateString()
    : false;

  return (
    <Card className="border-[--farcaster-purple] bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[--farcaster-purple]" />
            <h3 className="text-lg font-semibold text-white">Daily Prompt</h3>
          </div>
          {userStreak && userStreak.currentStreak > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {userStreak.currentStreak} day streak
            </Badge>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-white font-medium"
        >
          {prompt.prompt}
        </motion.p>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[--gray-400]">
            {prompt.submissionCount} {prompt.submissionCount === 1 ? 'submission' : 'submissions'} today
          </p>
          {isSignedIn ? (
            <Button
              variant="glow"
              size="sm"
              onClick={onSubmit}
              disabled={hasSubmittedToday}
              className={cn(hasSubmittedToday && "opacity-50 cursor-not-allowed")}
            >
              <PenTool className="mr-2 h-4 w-4" />
              {hasSubmittedToday ? "Already Submitted" : "Submit Your Line"}
            </Button>
          ) : (
            <Button
              variant="glow"
              size="sm"
              onClick={onSignIn}
            >
              Sign In to Participate
            </Button>
          )}
        </div>

        {userStreak && userStreak.longestStreak > 0 && (
          <div className="pt-2 border-t border-[--gray-800]">
            <p className="text-xs text-[--gray-500]">
              Longest streak: {userStreak.longestStreak} days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

