/**
 * Token Cost Indicator Component
 * 
 * Displays the real-time token cost for the current generation settings.
 * Shows warning when user doesn't have enough tokens.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { 
    getCostBreakdown, 
    formatDuration,
    type GenerationCostParams, 
    type GenerationTier,
    type QualityLevel 
} from '../../lib/token-costs'
import { useUserTokens } from '../../lib/hooks'

interface TokenCostIndicatorProps {
    /** Duration in seconds */
    duration: number
    /** Quality level (draft, standard, high) */
    quality: QualityLevel
    /** Current mode/tier for cost calculation and styling */
    mode: GenerationTier
    /** Compact mode for smaller displays */
    compact?: boolean
}

export function TokenCostIndicator({
    duration,
    quality,
    mode,
    compact = false,
}: TokenCostIndicatorProps) {
    const { data: userTokens, isLoading } = useUserTokens()

    const costParams: GenerationCostParams = {
        tier: mode,
        duration,
        quality,
    }

    const breakdown = getCostBreakdown(costParams)
    const balance = userTokens?.balance ?? 0
    const canAfford = balance >= breakdown.total

    const modeColor = mode === 'designer' ? 'var(--sona-designer)' : 'var(--sona-producer)'

    if (compact) {
        return (
            <CompactIndicator
                total={breakdown.total}
                balance={balance}
                canAfford={canAfford}
                modeColor={modeColor}
                isLoading={isLoading}
            />
        )
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
            style={{
                background: canAfford
                    ? 'var(--sona-surface)'
                    : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${canAfford ? 'var(--sona-border)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
        >
            {/* Token icon */}
            <TokenIcon color={canAfford ? modeColor : 'var(--sona-error)'} />

            {/* Cost display */}
            <AnimatePresence mode="wait">
                <motion.span
                    key={breakdown.total}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-sm font-medium tabular-nums"
                    style={{ color: canAfford ? modeColor : 'var(--sona-error)' }}
                >
                    {isLoading ? '...' : breakdown.total}
                </motion.span>
            </AnimatePresence>

            {/* Balance indicator */}
            <span className="text-[10px] text-[var(--sona-text-subtle)] tabular-nums">
                / {isLoading ? '...' : balance.toLocaleString()}
            </span>

            {/* Warning badge */}
            <AnimatePresence>
                {!canAfford && !isLoading && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-[10px] text-[var(--sona-error)] font-medium ml-1"
                    >
                        Insufficient
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/**
 * Compact version for tight spaces
 */
function CompactIndicator({
    total,
    balance,
    canAfford,
    modeColor,
    isLoading,
}: {
    total: number
    balance: number
    canAfford: boolean
    modeColor: string
    isLoading: boolean
}) {
    return (
        <div
            className="flex items-center gap-1.5"
            title={`Cost: ${total} tokens (Balance: ${balance})`}
        >
            <TokenIcon
                color={canAfford ? modeColor : 'var(--sona-error)'}
                size={12}
            />
            <span
                className="text-xs font-medium tabular-nums"
                style={{ color: canAfford ? modeColor : 'var(--sona-error)' }}
            >
                {isLoading ? '...' : total}
            </span>
        </div>
    )
}

/**
 * Token icon SVG
 */
export function TokenIcon({ color, size = 30 }: { color: string; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            {/* Outer ring */}
            <circle
                cx="24"
                cy="24"
                r="22"
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
            />
            {/* Inner ring */}
            <circle
                cx="24"
                cy="24"
                r="16"
                stroke={color}
                strokeWidth="2"
            />
            {/* Center symbol */}
            <path
                d="M24 14v20M18 20l6-6 6 6M18 28l6 6 6-6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

/**
 * Detailed breakdown tooltip content
 */
export function TokenCostBreakdown({
    duration,
    quality,
    mode,
}: Omit<TokenCostIndicatorProps, 'compact'>) {
    const costParams: GenerationCostParams = {
        tier: mode,
        duration,
        quality,
    }

    const breakdown = getCostBreakdown(costParams)
    const tierLabel = mode.charAt(0).toUpperCase() + mode.slice(1)
    const qualityLabel = quality === 'high' ? 'HQ' : quality === 'standard' ? 'Standard' : 'Draft'

    return (
        <div className="text-xs space-y-1">
            <div className="flex justify-between gap-4">
                <span className="text-[var(--sona-text-muted)]">{tierLabel} base</span>
                <span className="tabular-nums">{breakdown.base}</span>
            </div>
            {breakdown.duration > 0 && (
                <div className="flex justify-between gap-4">
                    <span className="text-[var(--sona-text-muted)]">Duration ({formatDuration(duration)})</span>
                    <span className="tabular-nums">+{breakdown.duration}</span>
                </div>
            )}
            {breakdown.quality > 0 && (
                <div className="flex justify-between gap-4">
                    <span className="text-[var(--sona-text-muted)]">{qualityLabel} quality</span>
                    <span className="tabular-nums">+{breakdown.quality}</span>
                </div>
            )}
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--sona-border)]">
                <span className="font-medium">Total</span>
                <span className="font-medium tabular-nums">{breakdown.total}</span>
            </div>
        </div>
    )
}
