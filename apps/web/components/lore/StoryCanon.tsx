"use client";

import { motion } from "framer-motion";
import { useStaggeredLoreAnimation } from "@/hooks/useLoreAnimation";
import { LoreLine } from "./LoreLine";
import { useTypewriter } from "@/hooks/useTypewriter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryLine {
  id: string;
  content: string;
  lineNumber: number;
  author: {
    fid: number;
    username: string | null;
    pfpUrl?: string | null;
  };
  votes: number;
}

interface StoryCanonProps {
  lines: StoryLine[];
  autoScroll?: boolean;
  showTypewriter?: boolean;
  className?: string;
  contributorCount?: number;
  onContinueStory?: () => void;
  storyId?: string;
}

export function StoryCanon({
  lines,
  autoScroll = true,
  showTypewriter = false,
  className,
  contributorCount,
  onContinueStory,
  storyId,
}: StoryCanonProps) {
  const { ref, containerVariants, itemVariants } = useStaggeredLoreAnimation();
  
  // Calculate unique contributors if not provided
  const uniqueContributors = contributorCount || new Set(lines.map((line) => line.author.fid)).size;

  // Typewriter effect for full story
  const fullText = lines.map((line) => line.content).join(" ");
  const { displayedText } = useTypewriter(fullText, {
    speed: 30,
    delay: 500,
  });

  if (showTypewriter) {
    return (
      <div
        className={cn(
          "space-y-4 rounded-xl border border-[--gray-800] bg-[--gray-900] p-6",
          className
        )}
      >
        <div className="font-mono text-white whitespace-pre-wrap leading-relaxed">
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-5 bg-[--base-blue] ml-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Contributor Badge */}
      {lines.length > 0 && uniqueContributors > 0 && (
        <div className="flex items-center gap-2 text-sm text-[--gray-400]">
          <Users className="h-4 w-4" />
          <span>{uniqueContributors} {uniqueContributors === 1 ? 'contributor' : 'contributors'}</span>
          <Badge variant="secondary" className="text-xs">
            Co-Created
          </Badge>
        </div>
      )}

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "space-y-4 max-h-[600px] overflow-y-auto rounded-xl border border-[--gray-800] bg-[--gray-900] p-6 scrollbar-thin scrollbar-thumb-[--gray-700] scrollbar-track-transparent",
        )}
      >
        {lines.length === 0 ? (
          <div className="text-center py-12 text-[--gray-400]">
            <p className="text-lg mb-2">No lore yet</p>
            <p className="text-sm">Be the first to write the next line of crypto history</p>
            {onContinueStory && (
              <Button
                variant="glow"
                onClick={onContinueStory}
                className="mt-4"
              >
                <PenTool className="mr-2 h-4 w-4" />
                Start the Story
              </Button>
            )}
          </div>
        ) : (
          <>
            {lines.map((line) => (
              <motion.div key={line.id} variants={itemVariants}>
                <LoreLine
                  content={line.content}
                  lineNumber={line.lineNumber}
                  author={{
                    fid: line.author.fid,
                    username: line.author.username,
                    pfpUrl: line.author.pfpUrl,
                  }}
                  isApproved={true}
                  votes={line.votes}
                />
              </motion.div>
            ))}
            
            {/* Continue Story CTA */}
            {onContinueStory && (
              <motion.div
                variants={itemVariants}
                className="pt-4 border-t border-[--gray-800]"
              >
                <Button
                  variant="glow"
                  onClick={onContinueStory}
                  className="w-full"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Continue This Story
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

