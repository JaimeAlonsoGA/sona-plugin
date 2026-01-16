/**
 * Token Cost Configuration
 * 
 * Centralized cost calculation for audio generation.
 * These values should match the backend Edge Function.
 * 
 * Tiers:
 * - Designer: Short SFX and UI sounds (10s, 20s)
 * - Producer: Loops and musical elements (8s, 18s, 30s)
 * - Creator: Full tracks and long-form audio (2min, 3min)
 */

/**
 * Generation tier types
 */
export type GenerationTier = 'designer' | 'producer' | 'creator'

/**
 * Quality level types
 */
export type QualityLevel = 'draft' | 'standard' | 'high'

/**
 * Token cost constants by tier
 */
export const TOKEN_COSTS = {
  /** Base cost by tier */
  BASE: {
    designer: 4,
    producer: 12,
    creator: 20,
  } as const,

  /** Additional cost by quality level per tier */
  QUALITY: {
    designer: {
      draft: 0,
      standard: 3,
      high: 8,
    },
    producer: {
      draft: 0,
      standard: 4,
      high: 10,
    },
    creator: {
      draft: 0,
      standard: 5,
      high: 13,
    },
  } as const,

  /** Additional cost by duration per tier (in seconds) */
  DURATION: {
    designer: {
      10: 2,
      20: 4,
    },
    producer: {
      8: 3,
      18: 5,
      30: 8,
    },
    creator: {
      120: 5,  // 2 minutes
      180: 8,  // 3 minutes
    },
  } as const,
} as const

/**
 * Parameters for cost calculation
 */
export interface GenerationCostParams {
  tier: GenerationTier
  duration: number
  quality: QualityLevel
}

/**
 * Cost breakdown with individual components
 */
export interface CostBreakdown {
  base: number
  duration: number
  quality: number
  total: number
  tier: GenerationTier
}

/**
 * Calculate the total token cost for a generation
 * 
 * @param params - Generation parameters
 * @returns Total token cost
 */
export function calculateTokenCost(params: GenerationCostParams): number {
  const { tier, duration, quality } = params

  let cost = TOKEN_COSTS.BASE[tier]

  // Duration extra cost (find closest duration tier)
  const durationKey = findClosestDurationTier(tier, duration)
  if (durationKey !== null) {
    cost += TOKEN_COSTS.DURATION[tier][durationKey]
  }

  // Quality extra cost
  cost += TOKEN_COSTS.QUALITY[tier][quality]

  return cost
}

/**
 * Get detailed cost breakdown for display
 * 
 * @param params - Generation parameters
 * @returns Breakdown of costs by component
 */
export function getCostBreakdown(params: GenerationCostParams): CostBreakdown {
  const { tier, duration, quality } = params

  const durationKey = findClosestDurationTier(tier, duration)
  const durationCost = durationKey !== null ? TOKEN_COSTS.DURATION[tier][durationKey] : 0

  return {
    base: TOKEN_COSTS.BASE[tier],
    duration: durationCost,
    quality: TOKEN_COSTS.QUALITY[tier][quality],
    total: calculateTokenCost(params),
    tier,
  }
}

/**
 * Find the closest duration tier for cost calculation
 * Rounds up to the next tier if between values
 * 
 * @param tier - Generation tier
 * @param duration - Actual duration in seconds
 * @returns The duration tier key or null if no matching tier
 */
function findClosestDurationTier<T extends GenerationTier>(
  tier: T,
  duration: number
): keyof typeof TOKEN_COSTS.DURATION[T] | null {
  const tierDurations = TOKEN_COSTS.DURATION[tier]
  const tiers: number[] = Object.keys(tierDurations)
    .map(Number)
    .sort((a, b) => a - b)

  // Find the tier that the duration falls into (round up)
  for (const tierKey of tiers) {
    if (duration <= tierKey) {
      return tierKey as keyof typeof TOKEN_COSTS.DURATION[T]
    }
  }

  // If longer than max, use max tier
  return (tiers[tiers.length - 1] ?? null) as keyof typeof TOKEN_COSTS.DURATION[T] | null
}

/**
 * Get available durations for a tier
 * 
 * @param tier - Generation tier
 * @returns Array of available duration options in seconds
 */
export function getAvailableDurations(tier: GenerationTier): number[] {
  return Object.keys(TOKEN_COSTS.DURATION[tier])
    .map(Number)
    .sort((a, b) => a - b)
}

/**
 * Get loop duration for producer tier (used for beat-synced loops)
 * Calculates duration based on BPM and bars
 * 
 * @param bpm - Beats per minute
 * @param bars - Number of bars
 * @param beatsPerBar - Beats per bar (default 4)
 * @returns Duration in seconds
 */
export function getLoopDuration(bpm: number, bars: number, beatsPerBar: number = 4): number {
  const secondsPerBeat = 60 / bpm
  const totalBeats = bars * beatsPerBar
  return Math.round(secondsPerBeat * totalBeats * 100) / 100
}

/**
 * Format token cost for display
 * 
 * @param cost - Token amount
 * @returns Formatted string
 */
export function formatTokenCost(cost: number): string {
  return cost.toLocaleString()
}

/**
 * Format duration for display
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "30s", "2m", "2m 30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Generate a description for the transaction log
 * 
 * @param params - Generation parameters
 * @param prompt - Optional prompt summary
 * @returns Description string
 */
export function generateCostDescription(
  params: GenerationCostParams,
  prompt?: string
): string {
  const { tier, duration, quality } = params
  const promptSummary = prompt
    ? `: "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}"`
    : ''

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
  return `${tierLabel} generation (${formatDuration(duration)}, ${quality})${promptSummary}`
}

/**
 * Get tier display information
 * 
 * @param tier - Generation tier
 * @returns Display name and description
 */
export function getTierInfo(tier: GenerationTier): { name: string; description: string } {
  const info = {
    designer: {
      name: 'Designer',
      description: 'Short SFX and UI sounds',
    },
    producer: {
      name: 'Producer',
      description: 'Loops and musical elements',
    },
    creator: {
      name: 'Creator',
      description: 'Full tracks and long-form audio',
    },
  }
  return info[tier]
}

/**
 * Estimate token cost for preview (before generation)
 * 
 * @param tier - Generation tier
 * @param quality - Quality level
 * @returns Min and max possible costs for the tier
 */
export function estimateCostRange(
  tier: GenerationTier,
  quality: QualityLevel
): { min: number; max: number } {
  const baseCost = TOKEN_COSTS.BASE[tier]
  const qualityCost = TOKEN_COSTS.QUALITY[tier][quality]
  const durations = getAvailableDurations(tier)
  
  const minDuration = durations[0]
  const maxDuration = durations[durations.length - 1]
  
  const minDurationCost = TOKEN_COSTS.DURATION[tier][minDuration as keyof typeof TOKEN_COSTS.DURATION[typeof tier]]
  const maxDurationCost = TOKEN_COSTS.DURATION[tier][maxDuration as keyof typeof TOKEN_COSTS.DURATION[typeof tier]]
  
  return {
    min: baseCost + qualityCost + minDurationCost,
    max: baseCost + qualityCost + maxDurationCost,
  }
}
