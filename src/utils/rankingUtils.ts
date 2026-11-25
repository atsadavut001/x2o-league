/**
 * rankingUtils.ts
 * Helper functions for calculating player rank tiers, points progress, and badge presentation
 * Project: x2o-league
 * Zberus Tech Co, Ltd.
 */

import { RANK_TIERS, RankTier, RankTierId } from '../interfaces/ranking.types';

/**
 * Get player rank tier information based on their current score/points.
 * Safely handles negative values or missing points.
 */
export function getPlayerTier(score: number): RankTier {
  const points = Math.max(0, isNaN(score) ? 0 : score);

  if (points >= 1500) return RANK_TIERS.master;
  if (points >= 1000) return RANK_TIERS.diamond;
  if (points >= 600) return RANK_TIERS.platinum;
  if (points >= 300) return RANK_TIERS.gold;
  if (points >= 100) return RANK_TIERS.silver;
  return RANK_TIERS.bronze;
}

/**
 * Get the next tier relative to the current score, or null if player is already at Max (Master).
 */
export function getNextTier(score: number): RankTier | null {
  const currentTier = getPlayerTier(score);

  switch (currentTier.id) {
    case 'bronze':
      return RANK_TIERS.silver;
    case 'silver':
      return RANK_TIERS.gold;
    case 'gold':
      return RANK_TIERS.platinum;
    case 'platinum':
      return RANK_TIERS.diamond;
    case 'diamond':
      return RANK_TIERS.master;
    case 'master':
    default:
      return null; // Master is the highest tier
  }
}

/**
 * Calculate progress percentage towards the next tier.
 * Returns a number between 0 and 100. For Master tier, always returns 100%.
 */
export function calculateTierProgress(score: number): {
  currentPoints: number;
  minPoints: number;
  maxPoints: number | null;
  pointsNeeded: number;
  progressPercent: number;
} {
  const points = Math.max(0, isNaN(score) ? 0 : score);
  const tier = getPlayerTier(points);

  if (tier.id === 'master' || tier.maxPoints === null) {
    return {
      currentPoints: points,
      minPoints: tier.minPoints,
      maxPoints: null,
      pointsNeeded: 0,
      progressPercent: 100,
    };
  }

  const minPoints = tier.minPoints;
  const maxPoints = tier.maxPoints;
  const tierSpan = maxPoints - minPoints + 1;
  const pointsIntoTier = points - minPoints;
  
  const rawPercent = (pointsIntoTier / tierSpan) * 100;
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const pointsNeeded = Math.max(0, maxPoints + 1 - points);

  return {
    currentPoints: points,
    minPoints,
    maxPoints,
    pointsNeeded,
    progressPercent,
  };
}

/**
 * Format score with commas or standard display
 */
export function formatScore(score: number): string {
  const points = Math.max(0, isNaN(score) ? 0 : score);
  return points.toLocaleString('en-US');
}

/**
 * Get tier by its identifier string safely
 */
export function getTierById(tierId: RankTierId): RankTier {
  return RANK_TIERS[tierId] || RANK_TIERS.bronze;
}
