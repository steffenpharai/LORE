"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSignIn } from "@/hooks/use-sign-in";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { PenTool, TrendingUp, Users, Sparkles } from "lucide-react";
import Link from "next/link";

// Lazy load heavy components
const StoryCanon = dynamic(() => import("@/components/lore/StoryCanon").then(mod => ({ default: mod.StoryCanon })), {
  loading: () => <div className="animate-pulse h-64 bg-[--gray-800] rounded-lg" />,
  ssr: false,
});

const ComposerModal = dynamic(() => import("@/components/lore/ComposerModal").then(mod => ({ default: mod.ComposerModal })), {
  ssr: false,
});

const DailyPrompt = dynamic(() => import("@/components/lore/DailyPrompt").then(mod => ({ default: mod.DailyPrompt })), {
  ssr: false,
});

const FrameSubmit = dynamic(() => import("@/components/frame/FrameSubmit").then(mod => ({ default: mod.FrameSubmit })), {
  ssr: false,
});

interface Story {
  id: string;
  lineCount: number;
  totalVotes: number;
  lines: Array<{
    id: string;
    content: string;
    lineNumber: number;
    author: {
      fid: number;
      username: string | null;
    };
    votes: number;
  }>;
}

interface Stats {
  totalStories: number;
  totalLines: number;
  totalContributors: number;
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalStories: 0,
    totalLines: 0,
    totalContributors: 0,
  });
  const [composerOpen, setComposerOpen] = useState(false);
  const { signIn, isSignedIn, user } = useSignIn({ autoSignIn: true });
  const { context } = useMiniKit();
  
  // Detect if we're in a Frame context
  const isInFrame = context?.client?.added === true || context?.location?.type === 'cast_embed';

  useEffect(() => {
    fetchStories();
    fetchStats();
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchStories();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories?limit=1");
      const data = await res.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stories?limit=100");
      const data = await res.json();
      const allStories = data.stories || [];
      const contributors = new Set<number>();
      let totalLines = 0;

      allStories.forEach((story: Story) => {
        totalLines += story.lineCount;
        story.lines.forEach((line) => {
          contributors.add(line.author.fid);
        });
      });

      setStats({
        totalStories: allStories.length,
        totalLines,
        totalContributors: contributors.size,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSubmit = useCallback(async (content: string, storyId?: string) => {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isSignedIn && {
            // Authorization would come from cookie/session in production
          }),
        },
        credentials: "include",
        body: JSON.stringify({
          storyId: storyId || null,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      // Refresh stories after submission
      await fetchStories();
      await fetchStats();
    } catch (error) {
      console.error("Failed to submit:", error);
      throw error;
    }
  }, [isSignedIn]);

  const handleAddLine = useCallback(() => {
    if (!isSignedIn) {
      signIn();
      return;
    }
    setComposerOpen(true);
  }, [isSignedIn, signIn]);

  const activeStory = useMemo(() => stories[0], [stories]);
  const activeLines = useMemo(() => activeStory?.lines || [], [activeStory]);

  // If in Frame, show simplified Frame-first UI
  if (isInFrame) {
    return (
      <div className="min-h-screen bg-[--background] text-[--foreground] flex items-center justify-center p-4">
        <FrameSubmit
          storyId={activeStory?.id}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[--gray-800]">
        <div className="absolute inset-0 bg-gradient-to-br from-[--base-blue]/10 via-transparent to-[--farcaster-purple]/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-5xl md:text-7xl font-bold font-[--font-space-grotesk] bg-gradient-to-r from-[--base-blue] to-[--farcaster-purple] bg-clip-text text-transparent"
            >
              Write the next line of crypto history.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-[--gray-400]"
            >
              Transform meme momentum into canonical community IP. Submit,
              vote, and earn rewards as stories become lore.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                size="lg"
                variant="glow"
                onClick={handleAddLine}
                className="text-lg px-8 py-6"
              >
                <PenTool className="mr-2 h-5 w-5" />
                Add Your Line
              </Button>
              <Link href="/vote">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Vote on Lore
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-[--gray-800] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[--gray-400] mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Active Stories</span>
              </div>
              <div className="text-3xl font-bold text-white font-[--font-space-grotesk]">
                {stats.totalStories}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[--gray-400] mb-2">
                <PenTool className="h-5 w-5" />
                <span className="text-sm font-medium">Total Lines</span>
              </div>
              <div className="text-3xl font-bold text-white font-[--font-space-grotesk]">
                {stats.totalLines}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[--gray-400] mb-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Contributors</span>
              </div>
              <div className="text-3xl font-bold text-white font-[--font-space-grotesk]">
                {stats.totalContributors}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Daily Prompt Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <DailyPrompt
            onSubmit={handleAddLine}
            isSignedIn={isSignedIn}
            onSignIn={signIn}
          />
        </div>
      </section>

      {/* Canon Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold font-[--font-space-grotesk] text-white">
              Live Canon
            </h2>
            {activeStory && (
              <Link href={`/story/${activeStory.id}`}>
                <Button variant="ghost" size="sm">
                  View Full Story →
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[--gray-800] rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-[--gray-800] rounded w-1/2 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ) : activeStory ? (
            <StoryCanon lines={activeLines} autoScroll={true} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <Sparkles className="h-12 w-12 text-[--gray-600] mx-auto" />
                <p className="text-xl text-[--gray-400]">
                  No stories yet. Be the first to create one!
                </p>
                <Button onClick={handleAddLine} variant="glow" className="mt-4">
                  <PenTool className="mr-2 h-4 w-4" />
                  Start the First Story
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Animated Prompt Box */}
          {activeStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-[--farcaster-purple] bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Next slot available
                      </h3>
                      <p className="text-sm text-[--gray-400]">
                        Line {activeStory.lineCount + 1} is waiting for your
                        contribution
                      </p>
                    </div>
                    <Button onClick={handleAddLine} variant="glow">
                      Add Line
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Composer Modal */}
      <ComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onSubmit={handleSubmit}
        currentUser={
          user
            ? {
                fid: typeof user.fid === 'string' ? parseInt(user.fid, 10) : user.fid,
                username: user.username || null,
              }
            : undefined
        }
      />
    </div>
  );
}
