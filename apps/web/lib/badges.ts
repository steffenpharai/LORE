/**
 * Badge eligibility and unlock tracking system
 * Supports Identity Playgrounds pattern from Base viral mini-apps guide
 */

export type BadgeType =
  | "canonical-author"
  | "lore-smith"
  | "top-contributor"
  | "first-author"
  | "weekly-winner"
  | "ritual-master"
  | "co-creator";

export interface BadgeEligibility {
  badge: BadgeType;
  eligible: boolean;
  reason?: string;
  progress?: {
    current: number;
    required: number;
  };
}

export interface UserStats {
  approvedContributions: number;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  hasWonWeeklyChallenge: boolean;
  challengeSubmissions: number;
}

/**
 * Check which badges a user is eligible for based on their stats
 */
export function checkBadgeEligibility(
  stats: UserStats,
  existingBadges: string[]
): BadgeEligibility[] {
  const eligibility: BadgeEligibility[] = [];

  // First Author - first approved contribution
  if (stats.approvedContributions >= 1 && !existingBadges.includes("first-author")) {
    eligibility.push({
      badge: "first-author",
      eligible: true,
      reason: "You wrote your first approved line!",
    });
  }

  // Canonical Author - at least one approved contribution
  if (stats.approvedContributions >= 1 && !existingBadges.includes("canonical-author")) {
    eligibility.push({
      badge: "canonical-author",
      eligible: true,
      reason: "Your line became part of the canon!",
    });
  }

  // Co-Creator - has any contribution
  if (stats.totalContributions >= 1 && !existingBadges.includes("co-creator")) {
    eligibility.push({
      badge: "co-creator",
      eligible: true,
      reason: "You're contributing to the story!",
    });
  }

  // Lore Smith - 10+ approved contributions
  if (stats.approvedContributions >= 10 && !existingBadges.includes("lore-smith")) {
    eligibility.push({
      badge: "lore-smith",
      eligible: true,
      reason: "You've crafted 10+ lines of lore!",
      progress: {
        current: stats.approvedContributions,
        required: 10,
      },
    });
  }

  // Top Contributor - 50+ approved contributions
  if (stats.approvedContributions >= 50 && !existingBadges.includes("top-contributor")) {
    eligibility.push({
      badge: "top-contributor",
      eligible: true,
      reason: "You're a top contributor with 50+ lines!",
      progress: {
        current: stats.approvedContributions,
        required: 50,
      },
    });
  }

  // Weekly Winner - won a weekly challenge
  if (stats.hasWonWeeklyChallenge && !existingBadges.includes("weekly-winner")) {
    eligibility.push({
      badge: "weekly-winner",
      eligible: true,
      reason: "You won a weekly challenge!",
    });
  }

  // Ritual Master - 7+ day streak
  if (stats.currentStreak >= 7 && !existingBadges.includes("ritual-master")) {
    eligibility.push({
      badge: "ritual-master",
      eligible: true,
      reason: "You've maintained a 7+ day streak!",
      progress: {
        current: stats.currentStreak,
        required: 7,
      },
    });
  }

  return eligibility;
}

/**
 * Get newly unlocked badges by comparing old and new badge lists
 */
export function getNewlyUnlockedBadges(
  oldBadges: string[],
  newBadges: string[]
): string[] {
  return newBadges.filter((badge) => !oldBadges.includes(badge));
}

/**
 * Format badge name for display
 */
export function formatBadgeName(badge: string): string {
  return badge
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

