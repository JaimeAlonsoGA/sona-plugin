/**
 * Toggle Group Component
 * 
 * Segmented control for selecting options
 */

import { motion } from 'framer-motion'

interface ToggleOption<T> {
  value: T
  label: string
  premium?: boolean
}

interface ToggleGroupProps<T> {
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  size = 'md',
}: ToggleGroupProps<T>) {
  const paddingClass = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <div className="sona-toggle-group">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <motion.button
            key={String(option.value)}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`
              ${paddingClass} ${textClass}
              rounded-lg font-medium
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive
                ? option.premium
                  ? 'bg-gradient-to-r from-[var(--sona-gold)] to-[var(--sona-ember)] text-[var(--sona-void)]'
                  : 'bg-[var(--sona-sage)] text-[var(--sona-cream)]'
                : 'text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] hover:bg-[var(--sona-elevated)]'
              }
            `}
          >
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}
