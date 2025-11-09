"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiBurstProps {
  trigger: boolean;
  options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
  };
}

export function ConfettiBurst({ trigger, options = {} }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#0052FF", "#8B5CF6", "#10B981", "#F59E0B"],
      ...options,
    };

    // Create canvas element if it doesn't exist
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "9999";
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    // Burst from center
    myConfetti({
      ...defaultOptions,
      angle: 60,
      origin: { x: 0, y: 0.5 },
    });

    myConfetti({
      ...defaultOptions,
      angle: 120,
      origin: { x: 1, y: 0.5 },
    });

    myConfetti({
      ...defaultOptions,
      angle: 90,
      origin: { x: 0.5, y: 0.5 },
    });

    // Cleanup after animation
    const timeout = setTimeout(() => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [trigger, options]);

  return null;
}

