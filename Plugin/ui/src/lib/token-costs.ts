/**
 * Token Cost Configuration
 * 
 * Centralized cost calculation for audio generation.
 * These values should match the backend Edge Function.
 */

/**
 * Token cost constants
 */
export const TOKEN_COSTS = {
  /** Base cost for any generation */
  BASE_COST: 20,
  
  /** Additional cost by duration (seconds) */
  DURATION: {
    3: 0,   // Short - included in base
    10: 0,  // Standard - included in base
    30: 5,  // Long - extra processing
    60: 10, // Maximum - significant extra
  } as const,
  
  /** Additional cost by quality level */
  QUALITY: {
    standard: 0,  // Included in base
    high: 10,     // Premium quality
  } as const,
} as const

/**
 * Parameters for cost calculation
 */
export interface GenerationCostParams {
  duration: number
  quality: 'standard' | 'high'
}

/**
 * Cost breakdown with individual components
 */
export interface CostBreakdown {
  base: number
  duration: number
  quality: number
  total: number
}

/**
 * Calculate the total token cost for a generation
 * 
 * @param params - Generation parameters
 * @returns Total token cost
 */
export function calculateTokenCost(params: GenerationCostParams): number {
  const { duration, quality } = params
  
  let cost = TOKEN_COSTS.BASE_COST
  
  // Duration extra cost (find closest duration tier)
  const durationKey = findClosestDurationTier(duration)
  cost += TOKEN_COSTS.DURATION[durationKey]
  
  // Quality extra cost
  cost += TOKEN_COSTS.QUALITY[quality]
  
  return cost
}

/**
 * Get detailed cost breakdown for display
 * 
 * @param params - Generation parameters
 * @returns Breakdown of costs by component
 */
export function getCostBreakdown(params: GenerationCostParams): CostBreakdown {
  const { duration, quality } = params
  
  const durationKey = findClosestDurationTier(duration)
  
  return {
    base: TOKEN_COSTS.BASE_COST,
    duration: TOKEN_COSTS.DURATION[durationKey],
    quality: TOKEN_COSTS.QUALITY[quality],
    total: calculateTokenCost(params),
  }
}

/**
 * Find the closest duration tier for cost calculation
 * Rounds up to the next tier if between values
 * 
 * @param duration - Actual duration in seconds
 * @returns The duration tier key
 */
function findClosestDurationTier(duration: number): keyof typeof TOKEN_COSTS.DURATION {
  const tiers = [3, 10, 30, 60] as const
  
  // Find the tier that the duration falls into (round up)
  for (const tier of tiers) {
    if (duration <= tier) {
      return tier
    }
  }
  
  // If longer than max, use max tier
  return 60
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
  const { duration, quality } = params
  const promptSummary = prompt 
    ? `: "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}"`
    : ''
  
  return `Audio generation (${duration}s, ${quality})${promptSummary}`
}
