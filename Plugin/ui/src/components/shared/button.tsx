/**
 * Button Component
 * 
 * Confident, inviting action buttons
 */

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

const variantStyles = {
  primary: 'sona-btn-primary',
  secondary: 'sona-btn-secondary',
  ghost: 'sona-btn-ghost',
}

const sizeStyles = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading, icon, disabled, className = '', ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          inline-flex items-center justify-center gap-2
          font-medium rounded-xl
          disabled:opacity-40 disabled:cursor-not-allowed
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : icon ? (
          <span className="w-4 h-4">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
