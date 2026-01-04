/**
 * Prompt Input Component
 * 
 * Welcoming textarea for creative expression
 */

import { motion } from 'framer-motion'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface PromptInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  isGenerating?: boolean
  mode?: 'designer' | 'producer'
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ isGenerating = false, mode = 'designer', ...props }, ref) => {
    // Color schemes for each mode
    const colors = mode === 'designer' 
      ? {
          primary: 'var(--sona-designer)',      // #6BA3B5 - Blue-teal
          secondary: 'var(--sona-sage)',         // Complementary sage
          tertiary: 'var(--sona-gold)',          // Accent gold
        }
      : {
          primary: 'var(--sona-producer)',       // #D4A56A - Warm gold
          secondary: 'var(--sona-ember)',        // Complementary ember
          tertiary: 'var(--sona-cream)',         // Accent cream
        }

    return (
      <div className="relative h-full">
        {/* Animated color-shifting border when generating */}
        {isGenerating && (
          <>
            <motion.div
              className="absolute -inset-[2px] rounded-2xl"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary}, ${colors.secondary}, ${colors.primary})`,
                backgroundSize: '300% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {/* Inner mask to create border effect */}
            <div className="absolute inset-0 rounded-2xl bg-[var(--sona-surface-alt)]" />
          </>
        )}
        
        <textarea
          ref={ref}
          disabled={isGenerating}
          className={`
            sona-textarea h-full relative resize-none
            ${isGenerating ? 'opacity-60' : ''}
          `}
          {...props}
        />

        {/* Keyboard shortcut hint */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[var(--sona-text-subtle)] text-[10px] opacity-60">
          <kbd className="px-1.5 py-0.5 bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded text-[9px] font-mono">⌘↵</kbd>
          {/* <span>create</span> */}
        </div>
      </div>
    )
  }
)

PromptInput.displayName = 'PromptInput'
