"use client";

import { motion, PanInfo } from "framer-motion";
import { useVoteAnimation } from "@/hooks/useVoteAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteCardProps {
  lineId: string;
  content: string;
  author: {
    fid: number;
    username: string | null;
  };
  currentVotes: number;
  threshold: number;
  onVote: (lineId: string, approve: boolean) => void;
  className?: string;
}

export function VoteCard({
  lineId,
  content,
  author,
  currentVotes,
  threshold,
  onVote,
  className,
}: VoteCardProps) {
  const { voteResult, isAnimating, controls, animateVote, reset } =
    useVoteAnimation();

  const progress = Math.min((currentVotes / threshold) * 100, 100);

  const handleVote = async (approve: boolean) => {
    await animateVote(approve ? "approve" : "reject");
    onVote(lineId, approve);
    setTimeout(() => reset(), 2000);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      handleVote(info.offset.x > 0);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={cn("w-full", className)}
    >
      <Card className="relative overflow-hidden" role="article" aria-label="Vote on lore line">
        {voteResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center rounded-xl",
              voteResult === "approve"
                ? "bg-[--success]/90"
                : "bg-[--error]/90"
            )}
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-4xl mb-2"
              >
                {voteResult === "approve" ? "🔥" : "❌"}
              </motion.div>
              <p className="text-xl font-bold">
                {voteResult === "approve" ? "Lore Accepted!" : "Rejected"}
              </p>
            </div>
          </motion.div>
        )}

        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-white text-lg leading-relaxed">{content}</p>
            <p className="text-sm text-[--gray-400]">
              by {author.username ? `@${author.username}` : `user ${author.fid}`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--gray-400]">Progress to approval</span>
              <span className="text-white font-semibold">
                {currentVotes} / {threshold}
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-[--error] text-[--error] hover:bg-[--error] hover:text-white"
              onClick={() => handleVote(false)}
              disabled={isAnimating}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="glow"
              size="lg"
              className="flex-1"
              onClick={() => handleVote(true)}
              disabled={isAnimating}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

