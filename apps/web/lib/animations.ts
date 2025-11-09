/**
 * Shared animation configurations for Framer Motion
 */

export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.5,
} as const;

export const gentleSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
} as const;

export const bouncySpring = {
  type: "spring",
  stiffness: 400,
  damping: 10,
} as const;

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: springConfig,
} as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: springConfig,
} as const;

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

