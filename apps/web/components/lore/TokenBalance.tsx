"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTokenGlow, useAnimatedNumber } from "@/hooks/useTokenGlow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TokenBalanceProps {
  balance: number;
  pending?: number;
  showGlow?: boolean;
  className?: string;
}

export function TokenBalance({
  balance,
  pending = 0,
  showGlow = true,
  className,
}: TokenBalanceProps) {
  const { controls, isGlowing } = useTokenGlow(showGlow);
  const animatedBalance = useAnimatedNumber(balance);
  const displayValue = useTransform(animatedBalance, (latest) => Math.round(latest));

  return (
    <motion.div animate={controls} className={cn("w-full", className)}>
      <Card
        className={cn(
          "relative overflow-hidden border-[--farcaster-purple]",
          isGlowing && "glow-purple"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[--gray-400]">
                <Coins className="h-4 w-4" />
                <span>$LORE Balance</span>
              </div>
              <motion.div
                className="text-3xl font-bold text-white font-[--font-space-grotesk]"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                key={balance}
              >
                <motion.span>{displayValue}</motion.span>
              </motion.div>
            </div>
            {pending > 0 && (
              <Badge variant="warning" className="text-xs">
                +{pending} pending
              </Badge>
            )}
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-[--farcaster-purple]/10 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
}

