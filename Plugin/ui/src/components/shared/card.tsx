/**
 * Card Component
 * 
 * Reusable card with Sona glass effect
 */

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  variant?: 'default' | 'glass' | 'elevated'
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variants = {
  default: 'sona-card',
  glass: 'sona-glass',
  elevated: 'bg-[var(--sona-elevated)] border border-[var(--sona-border)] rounded-xl',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', interactive = false, padding = 'md', className = '', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { scale: 1.01, y: -2 } : {}}
        className={`
          ${variants[variant]}
          ${paddingStyles[padding]}
          ${interactive ? 'cursor-pointer hover:border-[var(--sona-ember)]/30' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
