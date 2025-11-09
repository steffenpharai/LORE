"use client";

import { useEffect, useState } from "react";
import { useAnimation, useMotionValue, useSpring } from "framer-motion";

/**
 * Hook for pulsing token glow effect
 */
export function useTokenGlow(enabled: boolean = true) {
  const [isGlowing, setIsGlowing] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (isGlowing) {
      controls.start({
        boxShadow: [
          "0 0 10px rgba(139, 92, 246, 0.3)",
          "0 0 30px rgba(139, 92, 246, 0.6)",
          "0 0 10px rgba(139, 92, 246, 0.3)",
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    } else {
      controls.start({
        boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
      });
    }
  }, [isGlowing, controls]);

  return {
    controls,
    isGlowing,
  };
}

/**
 * Hook for animated number updates (for token balance)
 */
export function useAnimatedNumber(targetValue: number, duration: number = 1000) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(targetValue);
  }, [targetValue, motionValue]);

  return spring;
}

