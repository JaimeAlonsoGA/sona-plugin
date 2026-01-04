/**
 * Token Package Card Component
 * 
 * Displays a single token package for purchase
 */

import { motion } from 'framer-motion'
import type { TokenPackage } from '../../types/stripe.types'

interface TokenPackageCardProps {
  package: TokenPackage
  isLoading?: boolean
  onPurchase: () => void
  delay?: number
}

export function TokenPackageCard({ 
  package: pkg, 
  isLoading, 
  onPurchase,
  delay = 0 
}: TokenPackageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={!isLoading ? onPurchase : undefined}
      className={`
        relative cursor-pointer
        bg-[var(--sona-surface)] border rounded-2xl p-4
        transition-all duration-300
        ${pkg.popular 
          ? 'border-[var(--sona-gold)]/40 shadow-[0_0_20px_rgba(232,213,163,0.1)]' 
          : 'border-[var(--sona-border)] hover:border-[var(--sona-muted)]'
        }
        ${isLoading ? 'opacity-70 pointer-events-none' : ''}
      `}
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--sona-gold)] text-[var(--sona-void)] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
            Popular
          </span>
        </div>
      )}

      {/* Token Amount */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <TokenIcon />
          <span className="text-2xl font-bold text-[var(--sona-text)]">
            {pkg.tokens}
          </span>
        </div>
        <span className="text-[var(--sona-text-subtle)] text-xs">
          tokens
        </span>
      </div>

      {/* Price */}
      <div className="text-center mb-3">
        <span className="text-xl font-semibold text-[var(--sona-gold)]">
          {pkg.priceDisplay}
        </span>
      </div>

      {/* Description */}
      <p className="text-[var(--sona-text-muted)] text-xs text-center mb-4 min-h-[2rem]">
        {pkg.description}
      </p>

      {/* Buy Button */}
      <button
        disabled={isLoading}
        className={`
          w-full py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200
          ${pkg.popular
            ? 'bg-[var(--sona-gold)] text-[var(--sona-void)] hover:bg-[var(--sona-gold)]/90'
            : 'bg-[var(--sona-ember)] text-[var(--sona-cream)] hover:bg-[var(--sona-ember)]/90'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            Processing...
          </span>
        ) : (
          'Buy Now'
        )}
      </button>

      {/* Value indicator */}
      {pkg.id === 'tokens_1000' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--sona-sage)] text-[var(--sona-void)] text-[9px] font-semibold px-2 py-0.5 rounded-full">
            Best Value
          </span>
        </div>
      )}
    </motion.div>
  )
}

function TokenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--sona-gold)]">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path 
        d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
