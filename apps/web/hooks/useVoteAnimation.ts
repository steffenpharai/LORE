"use client";

import { useState } from "react";
import { useAnimation } from "framer-motion";
import { bouncySpring } from "@/lib/animations";

export type VoteResult = "approve" | "reject" | null;

/**
 * Hook for coin-flip vote feedback animation
 */
export function useVoteAnimation() {
  const [voteResult, setVoteResult] = useState<VoteResult>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();

  const animateVote = async (result: "approve" | "reject") => {
    setIsAnimating(true);
    setVoteResult(result);

    // Coin flip animation
    await controls.start({
      rotateY: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    });

    // Result animation
    await controls.start({
      scale: [1, 1.1, 1],
      transition: bouncySpring,
    });

    setIsAnimating(false);
  };

  const reset = () => {
    setVoteResult(null);
    controls.set({ rotateY: 0, scale: 1 });
  };

  return {
    voteResult,
    isAnimating,
    controls,
    animateVote,
    reset,
  };
}

/**
 * Hook for swipe-based voting
 */
export function useSwipeVote() {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleSwipe = (direction: "left" | "right", progress: number) => {
    setSwipeDirection(direction);
    setSwipeProgress(progress);
  };

  const resetSwipe = () => {
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  return {
    swipeDirection,
    swipeProgress,
    handleSwipe,
    resetSwipe,
  };
}

