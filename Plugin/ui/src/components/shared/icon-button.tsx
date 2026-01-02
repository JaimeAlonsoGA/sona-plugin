/**
 * Icon Button Component
 * 
 * A circular button for icons with hover effects
 */

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: ReactNode
  variant?: 'ghost' | 'filled' | 'ember' | 'sage'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const variants = {
  ghost: 'bg-transparent hover:bg-[var(--sona-elevated)] text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]',
  filled: 'bg-[var(--sona-elevated)] hover:bg-[var(--sona-muted)] text-[var(--sona-text)]',
  ember: 'bg-[var(--gradient-ember)] text-white hover:shadow-lg hover:shadow-[var(--sona-ember)]/20',
  sage: 'bg-[var(--sona-sage)] text-white hover:brightness-110',
}

const sizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'md', label, disabled, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`
          ${sizes[size]} 
          ${variants[variant]} 
          rounded-full flex items-center justify-center 
          transition-colors duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          ${className}
        `}
        disabled={disabled}
        title={label}
        aria-label={label}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </motion.button>
    )
  }
)

IconButton.displayName = 'IconButton'
