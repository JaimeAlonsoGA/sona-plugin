/**
 * Prompt Input Component
 * 
 * Welcoming textarea for creative expression
 */

import { motion } from 'framer-motion'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface PromptInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  isGenerating?: boolean
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ isGenerating = false, ...props }, ref) => {
    return (
      <div className="relative flex-1">
        {/* Subtle animated border when generating */}
        {isGenerating && (
          <motion.div
            className="absolute -inset-px rounded-[20px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, var(--sona-sage), var(--sona-gold), var(--sona-sage))',
              backgroundSize: '200% 100%',
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
        )}
        
        <textarea
          ref={ref}
          disabled={isGenerating}
          className={`
            sona-textarea h-full min-h-[100px] relative
            ${isGenerating ? 'opacity-60' : ''}
          `}
          {...props}
        />

        {/* Keyboard shortcut hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[var(--sona-text-subtle)] text-[10px] opacity-60">
          <kbd className="px-1.5 py-0.5 bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded text-[9px] font-mono">⌘↵</kbd>
          <span>create</span>
        </div>
      </div>
    )
  }
)

PromptInput.displayName = 'PromptInput'
