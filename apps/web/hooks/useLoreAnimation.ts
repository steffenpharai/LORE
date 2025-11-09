"use client";

import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { springConfig } from "@/lib/animations";

/**
 * Hook for animating lore lines with spring-based motion
 */
export function useLoreAnimation() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: springConfig,
      });
    }
  }, [controls, inView]);

  return {
    ref,
    controls,
    initial: { opacity: 0, y: 20 },
    animate: controls,
  };
}

/**
 * Hook for staggered lore line animations
 */
export function useStaggeredLoreAnimation(delay: number = 0.1) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springConfig,
    },
  };

  return {
    ref,
    controls,
    containerVariants,
    itemVariants,
  };
}

