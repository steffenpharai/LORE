"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoteCard } from "@/components/lore/VoteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSignIn } from "@/hooks/use-sign-in";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface PendingLine {
  id: string;
  content: string;
  author: {
    fid: number;
    username: string | null;
  };
  currentVotes: number;
  threshold: number;
}

export default function VotePage() {
  const [pendingLines, setPendingLines] = useState<PendingLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [votedLines, setVotedLines] = useState<Set<string>>(new Set());
  const { isSignedIn, signIn } = useSignIn({ autoSignIn: true });

  useEffect(() => {
    fetchPendingLines();
    // Poll for new pending lines
    const interval = setInterval(fetchPendingLines, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingLines = async () => {
    try {
      // In production, this would fetch from /api/vote/pending
      // For now, we'll use a mock or fetch from stories API
      const res = await fetch("/api/stories?limit=10");
      const data = await res.json();
      
      // Transform stories into pending lines (simplified - in production would have separate endpoint)
      const lines: PendingLine[] = [];
      data.stories?.forEach((story: any) => {
        // This is a simplified version - in production, pending lines would come from a separate endpoint
      });
      
      setPendingLines(lines);
    } catch (error) {
      console.error("Failed to fetch pending lines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (lineId: string, approve: boolean) => {
    if (!isSignedIn) {
      await signIn();
      return;
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          lineId,
          approve,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to vote");
      }

      setVotedLines((prev) => new Set([...prev, lineId]));
      
      // Move to next line after a delay
      setTimeout(() => {
        if (currentIndex < pendingLines.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Refresh pending lines
          fetchPendingLines();
          setCurrentIndex(0);
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const currentLine = pendingLines[currentIndex];
  const hasMore = currentIndex < pendingLines.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <div className="animate-pulse text-[--gray-400]">Loading pending lines...</div>
      </div>
    );
  }

  if (!currentLine) {
    return (
      <div className="min-h-screen bg-[--background]">
        <div className="container mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-[--success] mx-auto" />
              <h2 className="text-2xl font-bold text-white">
                All caught up!
              </h2>
              <p className="text-[--gray-400]">
                There are no pending lines to vote on. Check back soon for new
                submissions.
              </p>
              <Link href="/">
                <Button variant="glow" className="mt-4">
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background]">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="text-sm text-[--gray-400]">
            {currentIndex + 1} of {pendingLines.length}
          </div>
        </div>

        {/* Voting Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLine.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <VoteCard
              lineId={currentLine.id}
              content={currentLine.content}
              author={currentLine.author}
              currentVotes={currentLine.currentVotes}
              threshold={currentLine.threshold}
              onVote={handleVote}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        {pendingLines.length > 1 && (
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-sm text-[--gray-400] mb-2">
              <span>Voting Progress</span>
              <span>
                {votedLines.size} / {pendingLines.length} voted
              </span>
            </div>
            <div className="flex gap-2">
              {pendingLines.map((line, index) => (
                <div
                  key={line.id}
                  className={`
                    h-2 flex-1 rounded-full transition-all
                    ${
                      index === currentIndex
                        ? "bg-[--base-blue]"
                        : votedLines.has(line.id)
                        ? "bg-[--success]"
                        : "bg-[--gray-800]"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        )}

        {/* Skip Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="text-[--gray-400]"
            >
              Skip to Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

