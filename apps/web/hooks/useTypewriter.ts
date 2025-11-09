"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting
  onComplete?: () => void;
}

/**
 * Hook for typewriter effect on story display
 */
export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
) {
  const { speed = 50, delay = 0, onComplete } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, delay, onComplete]);

  return {
    displayedText,
    isComplete,
  };
}

/**
 * Hook for typewriter effect with multiple lines (for story canon)
 */
export function useMultiLineTypewriter(
  lines: string[],
  options: UseTypewriterOptions = {}
) {
  const { speed = 50, delay = 0, onComplete } = options;
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setCurrentLineIndex(0);
    setDisplayedText("");
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let lineIndex = 0;
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        if (lineIndex < lines.length) {
          const currentLine = lines[lineIndex];
          if (charIndex < currentLine.length) {
            setDisplayedText(
              lines
                .slice(0, lineIndex)
                .join("\n") +
                "\n" +
                currentLine.slice(0, charIndex + 1)
            );
            charIndex++;
          } else {
            // Move to next line
            lineIndex++;
            charIndex = 0;
            if (lineIndex < lines.length) {
              setDisplayedText(lines.slice(0, lineIndex).join("\n") + "\n");
            }
          }
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [lines, speed, delay, onComplete]);

  return {
    displayedText,
    isComplete,
    currentLineIndex,
  };
}

