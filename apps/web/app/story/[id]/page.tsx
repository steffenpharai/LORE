"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { StoryCanon } from "@/components/lore/StoryCanon";
import { ConfettiBurst } from "@/components/lore/ConfettiBurst";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Coins, Users, FileText } from "lucide-react";
import Link from "next/link";

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
  isComplete: boolean;
  nftTokenId?: string;
}

const STORY_LINE_CAP = 100;

export default function StoryPage() {
  const params = useParams();
  const storyId = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  useEffect(() => {
    if (story?.isComplete && !showConfetti) {
      setShowConfetti(true);
    }
  }, [story?.isComplete, showConfetti]);

  const fetchStory = async () => {
    try {
      const res = await fetch(`/api/stories?id=${storyId}`);
      const data = await res.json();
      setStory(data.story || null);
    } catch (error) {
      console.error("Failed to fetch story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    setMinting(true);
    try {
      // In production, this would call the mint API
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Refresh story to get NFT token ID
      await fetchStory();
    } catch (error) {
      console.error("Failed to mint:", error);
    } finally {
      setMinting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "LORE MACHINE Story",
        text: `Check out this collaborative lore story on LORE MACHINE!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <div className="animate-pulse text-[--gray-400]">Loading story...</div>
      </div>
    );
  }

  if (!story) {
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
            <CardContent className="p-12 text-center">
              <p className="text-[--gray-400]">Story not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isComplete = story.isComplete || story.lineCount >= STORY_LINE_CAP;
  const contributors = new Set(story.lines.map((line) => line.author.fid)).size;

  return (
    <div className="min-h-screen bg-[--background]">
      <ConfettiBurst trigger={showConfetti} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white font-[--font-space-grotesk] mb-2">
                Story #{story.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant={isComplete ? "success" : "default"}>
                  {isComplete ? "Complete" : "In Progress"}
                </Badge>
                <span className="text-sm text-[--gray-400]">
                  {story.lineCount} lines • {story.totalVotes} votes
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[--base-blue]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {story.lineCount}
                  </div>
                  <div className="text-sm text-[--gray-400]">Lines</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-[--farcaster-purple]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {contributors}
                  </div>
                  <div className="text-sm text-[--gray-400]">Contributors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-[--success]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {story.totalVotes}
                  </div>
                  <div className="text-sm text-[--gray-400]">Total Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story Canon with Typewriter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Story</CardTitle>
          </CardHeader>
          <CardContent>
            <StoryCanon
              lines={story.lines}
              showTypewriter={isComplete}
              autoScroll={false}
            />
          </CardContent>
        </Card>

        {/* Mint Section */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-[--farcaster-purple] bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Story Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[--gray-400]">
                  This story has reached {STORY_LINE_CAP} lines and is now
                  complete. You can mint it as a fractionalized NFT on Base.
                </p>
                {story.nftTokenId ? (
                  <div className="space-y-2">
                    <Badge variant="success">Minted</Badge>
                    <p className="text-sm text-[--gray-400]">
                      NFT Token ID: {story.nftTokenId}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="glow"
                    size="lg"
                    onClick={handleMint}
                    disabled={minting}
                    className="w-full"
                  >
                    {minting ? "Minting..." : "Own the Story"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Royalty Distribution (if minted) */}
        {story.nftTokenId && (
          <Card>
            <CardHeader>
              <CardTitle>Royalty Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[--gray-400] mb-4">
                Royalties are automatically distributed to contributors based on
                their share of the story.
              </p>
              <div className="space-y-2">
                {story.lines.slice(0, 5).map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between p-3 bg-[--gray-800] rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-white">
                        Line {line.lineNumber} by{" "}
                      {line.author.username
                        ? `@${line.author.username}`
                        : `user ${line.author.fid}`}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {((1 / story.lineCount) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

