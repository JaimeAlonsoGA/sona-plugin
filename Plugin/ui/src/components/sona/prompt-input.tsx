/**
 * Prompt Input Component
 * 
 * Welcoming textarea for creative expression with optional AI enhancement
 */

import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, useMemo, type TextareaHTMLAttributes } from 'react'
import { Wand } from 'lucide-react'
import { TokenIcon } from './token-cost-indicator'
import { getPromptValidationHint } from '../../lib/validations/generate-job'

interface PromptInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  isGenerating?: boolean
  mode?: 'designer' | 'producer' | 'creator'
  /** Callback when user clicks the enhance button */
  onEnhance?: () => void
  /** Whether enhancement is in progress */
  isEnhancing?: boolean
  /** Whether the enhance button should be shown */
  showEnhanceButton?: boolean
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({
    isGenerating = false,
    mode = 'designer',
    onEnhance,
    isEnhancing = false,
    showEnhanceButton = true,
    ...props
  }, ref) => {
    // Color schemes for each mode
    const colors = mode === 'designer'
      ? {
        primary: 'var(--sona-designer)',      // #6BA3B5 - Blue-teal
        secondary: 'var(--sona-sage)',         // Complementary sage
        tertiary: 'var(--sona-gold)',          // Accent gold
      }
      : mode === 'producer'
        ? {
          primary: 'var(--sona-producer)',       // #D4A56A - Warm gold
          secondary: 'var(--sona-ember)',        // Complementary ember
          tertiary: 'var(--sona-cream)',         // Accent cream
        }
        : {
          primary: 'var(--sona-creator)',        // #A56BD4 - Violet
          secondary: 'var(--sona-sage)',         // Complementary sage
          tertiary: 'var(--sona-producer)',      // Accent warm
        }

    const hasPrompt = props.value && String(props.value).trim().length > 0
    const canEnhance = showEnhanceButton && hasPrompt && !isGenerating && !isEnhancing && onEnhance
    const showEnhanceState = showEnhanceButton && isEnhancing
    
    // Real-time validation hint
    const promptValue = String(props.value || '')
    const validationHint = useMemo(() => getPromptValidationHint(promptValue), [promptValue])
    const hasValidationError = validationHint !== null && promptValue.length >= 5

    return (
      <div className="relative h-full">
        {/* Animated color-shifting border when generating */}
        {isGenerating && (
          <>
            <motion.div
              className="absolute -inset-0 rounded-2xl"
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
            {/* <div className="absolute inset-0 rounded-2xl bg-[var(--sona-surface-alt)]" /> */}
          </>
        )}

        {/* Animated sparkle border when enhancing */}
        {showEnhanceState && (
          <>
            <motion.div
              className="absolute -inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, var(--sona-sage), ${colors.primary}, var(--sona-gold), ${colors.primary}, var(--sona-sage))`,
                backgroundSize: '400% 400%',
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.6, 1, 0.6],
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Inner mask to create border effect */}
            {/* <div className="absolute inset-0 rounded-2xl bg-[var(--sona-surface-alt)]" /> */}
          </>
        )}

        <textarea
          ref={ref}
          disabled={isGenerating || isEnhancing}
          maxLength={800}
          minLength={5}
          className={`
            sona-textarea h-full relative resize-none
            ${isGenerating || isEnhancing ? 'opacity-60' : ''}
          `}
          {...props}
        />

        {/* Character counter and validation hint */}
        <div className="absolute top-2 right-3 text-[10px] text-[var(--sona-text-subtle)] flex items-center gap-2">
          {/* Validation hint */}
          {hasValidationError && (
            <span className="text-[var(--sona-ember)]">{validationHint}</span>
          )}
          {/* Character count */}
          <span className={promptValue.length >= 750 ? 'text-[var(--sona-ember)]' : ''}>
            {promptValue.length}
          </span>
          <span>/800</span>
        </div>

        {/* Bottom bar with enhance button and keyboard shortcut */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
          {/* Enhance button - shows different states */}
          <AnimatePresence mode="wait">
            {showEnhanceState ? (
              <motion.div
                key="enhancing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium
                           bg-black border border-[var(--sona-sage)]
                           text-[var(--sona-sage)]"
              >
                <motion.div
                  animate={{ rotate: 10 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Wand size={12} />
                </motion.div>
                <span>Enhancing...</span>
              </motion.div>
            ) : canEnhance ? (
              <motion.button
                key="enhance-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={onEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                           bg-[var(--sona-surface)] border border-[var(--sona-border)]
                           text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]
                           hover:border-[var(--sona-sage)] hover:bg-[var(--sona-surface)]
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  '--hover-color': colors.primary,
                } as React.CSSProperties}
                title="Enhance prompt with AI (1 token)"
              >
                <Wand size={12} />
                <span>Enhance:</span>
                <span className='flex flex-row items-center gap-0.5'>
                  <TokenIcon
                    color={'var(--sona-sage)'}
                    size={12}
                  />
                  <p className='text-['>1</p>
                </span>
              </motion.button>
            ) : null}
          </AnimatePresence>

          {/* Keyboard shortcut hint - hide when enhancing */}
          {/* {!showEnhanceState && (
            <div className="flex items-center gap-1.5 text-[var(--sona-text-subtle)] text-[10px] opacity-60">
              <kbd className="px-1.5 py-0.5 bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded text-[9px] font-mono">⌘↵</kbd>
            </div>
          )} */}
        </div>
      </div>
    )
  }
)

PromptInput.displayName = 'PromptInput'
