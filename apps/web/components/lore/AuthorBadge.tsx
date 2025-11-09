"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Trophy, Users, Zap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AuthorBadgeProps {
  pfpUrl?: string;
  badges: string[];
  className?: string;
  showUnlockAnimation?: boolean;
  newlyUnlocked?: string[];
}

const badgeConfig: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "secondary" | "success" | "outline";
  color: string;
}> = {
  "canonical-author": {
    label: "Canonical Author",
    icon: Crown,
    variant: "default",
    color: "from-[--base-blue] to-[--base-blue-light]",
  },
  "lore-smith": {
    label: "Lore Smith",
    icon: Sparkles,
    variant: "secondary",
    color: "from-[--farcaster-purple] to-[--farcaster-purple-light]",
  },
  "top-contributor": {
    label: "Top Contributor",
    icon: Trophy,
    variant: "success",
    color: "from-[--success] to-[--info]",
  },
  "first-author": {
    label: "First Author",
    icon: Zap,
    variant: "default",
    color: "from-yellow-500 to-orange-500",
  },
  "weekly-winner": {
    label: "Weekly Winner",
    icon: Trophy,
    variant: "secondary",
    color: "from-[--farcaster-purple] to-pink-500",
  },
  "ritual-master": {
    label: "Ritual Master",
    icon: Calendar,
    variant: "success",
    color: "from-green-500 to-emerald-500",
  },
  "co-creator": {
    label: "Co-Creator",
    icon: Users,
    variant: "outline",
    color: "from-cyan-500 to-blue-500",
  },
};

export function AuthorBadge({
  pfpUrl,
  badges,
  className,
  showUnlockAnimation = false,
  newlyUnlocked = [],
}: AuthorBadgeProps) {
  const validBadges = badges.filter((badge) => badgeConfig[badge]);

  return (
    <div className={cn("relative inline-block", className)}>
      {pfpUrl && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Image
            src={pfpUrl}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border-2 border-[--farcaster-purple]"
          />
          {validBadges.length > 0 && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 flex-wrap justify-center max-w-[200px]">
              <AnimatePresence>
                {validBadges.map((badge, index) => {
                  const config = badgeConfig[badge];
                  if (!config) return null;
                  const Icon = config.icon;
                  const isNewlyUnlocked = newlyUnlocked.includes(badge);
                  
                  return (
                    <motion.div
                      key={badge}
                      initial={isNewlyUnlocked && showUnlockAnimation ? { 
                        opacity: 0, 
                        scale: 0,
                        rotate: -180 
                      } : { opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: 0,
                        rotate: 0 
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        delay: isNewlyUnlocked && showUnlockAnimation ? 0 : index * 0.1,
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Badge
                        variant={config.variant}
                        className={cn(
                          "flex items-center gap-1 text-xs shadow-lg",
                          isNewlyUnlocked && showUnlockAnimation && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[--gray-900] animate-pulse"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
      {!pfpUrl && validBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {validBadges.map((badge) => {
              const config = badgeConfig[badge];
              if (!config) return null;
              const Icon = config.icon;
              const isNewlyUnlocked = newlyUnlocked.includes(badge);
              
              return (
                <motion.div
                  key={badge}
                  initial={isNewlyUnlocked && showUnlockAnimation ? { 
                    opacity: 0, 
                    scale: 0,
                    rotate: -180 
                  } : { opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0,
                    rotate: 0 
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Badge
                    variant={config.variant}
                    className={cn(
                      "flex items-center gap-1",
                      isNewlyUnlocked && showUnlockAnimation && "ring-2 ring-yellow-400 animate-pulse"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

