/**
 * Token Balance Component
 * 
 * Displays the user's current token balance
 */

import { motion } from 'framer-motion'
import { Card } from '../shared'

interface TokenBalanceProps {
  balance: number
  isLoading?: boolean
}

export function TokenBalance({ balance, isLoading }: TokenBalanceProps) {
  return (
    <Card
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--sona-gold)]/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[var(--sona-text-muted)] text-sm mb-1">
            Current Balance
          </p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-9 w-20 bg-[var(--sona-border)] rounded animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-[var(--sona-gold)]">
                  {balance.toLocaleString()}
                </span>
                <span className="text-[var(--sona-text-subtle)] text-sm">
                  tokens
                </span>
              </>
            )}
          </div>
        </div>

        {/* Token Icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 flex items-center justify-center"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Outer ring */}
            <circle 
              cx="24" 
              cy="24" 
              r="22" 
              stroke="var(--sona-gold)" 
              strokeWidth="2" 
              strokeOpacity="0.3"
              strokeDasharray="4 4"
            />
            {/* Inner ring */}
            <circle 
              cx="24" 
              cy="24" 
              r="16" 
              stroke="var(--sona-gold)" 
              strokeWidth="2"
            />
            {/* Center symbol */}
            <path
              d="M24 14v20M18 20l6-6 6 6M18 28l6 6 6-6"
              stroke="var(--sona-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Token usage info */}
      <div className="relative mt-4 pt-4 border-t border-[var(--sona-border)]">
        <p className="text-[var(--sona-text-subtle)] text-xs">
          Each audio generation costs <span className="text-[var(--sona-text-muted)]">~18 tokens</span>
        </p>
      </div>
    </Card>
  )
}
