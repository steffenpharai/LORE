"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLoreAnimation } from "@/hooks/useLoreAnimation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LoreLineProps {
  content: string;
  lineNumber: number;
  author: {
    fid: number;
    username: string | null;
    pfpUrl?: string | null;
  };
  isApproved?: boolean;
  votes?: number;
  className?: string;
}

export const LoreLine = memo(function LoreLine({
  content,
  lineNumber,
  author,
  isApproved = true,
  votes = 0,
  className,
}: LoreLineProps) {
  const { ref, initial, animate } = useLoreAnimation();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      className={cn(
        "group relative rounded-lg border border-[--gray-800] bg-[--gray-900] p-4 transition-all hover:border-[--gray-700] hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {author.pfpUrl ? (
            <Image
              src={author.pfpUrl}
              alt={author.username || `User ${author.fid}`}
              width={32}
              height={32}
              className="rounded-full border border-[--gray-700]"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[--base-blue] to-[--farcaster-purple] text-xs font-bold text-white">
              {lineNumber}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-white leading-relaxed">{content}</p>
          <div className="flex items-center gap-2 text-xs text-[--gray-400]">
            <span>
              — Line {lineNumber} by{" "}
              {author.username ? `@${author.username}` : `user ${author.fid}`}
            </span>
            {isApproved && (
              <Badge variant="success" className="text-xs">
                Canon
              </Badge>
            )}
            {votes > 0 && (
              <Badge variant="secondary" className="text-xs">
                {votes} votes
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

