/**
 * Duration Preset Selector Component
 * 
 * Supports multiple duration contexts:
 * - Designer mode: short (3s), medium (15s), long (30s)
 * - Producer One-shot: short (3s), medium (10s), long (30s)
 * - Song (Creator mode): short (1min), medium (2min), long (3min)
 * 
 * All contexts support Auto (null) and Custom options.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Duration presets
 */
export type DurationPreset = 'short' | 'medium' | 'long'

/**
 * Duration context determines which preset values to use
 */
export type DurationContext = 'designer' | 'one-shot' | 'song'

/**
 * Duration preset values by context (in seconds)
 */
export const DURATION_PRESET_VALUES: Record<DurationContext, Record<DurationPreset, number>> = {
  designer: {
    short: 3,     // 3 seconds
    medium: 15,   // 15 seconds
    long: 30,     // 30 seconds (under 47s limit)
  },
  'one-shot': {
    short: 3,     // 3 seconds
    medium: 10,   // 10 seconds
    long: 30,     // 30 seconds
  },
  song: {
    short: 60,    // 1 minute
    medium: 120,  // 2 minutes
    long: 180,    // 3 minutes (max)
  },
}

export const DURATION_PRESET_LABELS: Record<DurationPreset, string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
}

/**
 * Duration limits for custom input by context
 * Min/Max values that make sense for each mode
 */
export const DURATION_LIMITS: Record<DurationContext, { min: number; max: number }> = {
  designer: { min: 1, max: 30 },      // 1-30 seconds (max is 30, leave margin)
  'one-shot': { min: 1, max: 180 },   // 1-180 seconds
  song: { min: 10, max: 180 },        // 10-180 seconds (min 10s for songs)
}

/**
 * Duration value type - can be a preset, 'auto', or custom number
 */
export type DurationValue = DurationPreset | 'auto' | number

interface DurationPresetSelectorProps {
  value: DurationValue
  onChange: (value: DurationValue) => void
  context: DurationContext
  disabled?: boolean
  /** Accent color CSS variable */
  accentColor?: string
}

export function DurationPresetSelector({
  value,
  onChange,
  context,
  disabled = false,
  accentColor = 'var(--sona-designer)',
}: DurationPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const presetValues = DURATION_PRESET_VALUES[context]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetClick = (preset: DurationPreset | 'auto') => {
    onChange(preset)
    setIsOpen(false)
  }

  const handleCustomSubmit = () => {
    const num = parseInt(customInput)
    if (!isNaN(num) && num >= limits.min && num <= limits.max) {
      onChange(num)
      setIsOpen(false)
      setCustomInput('')
    }
  }

  const formatDuration = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${mins}m${secs}s` : `${mins}m`
    }
    return `${seconds}s`
  }

  const getShortDisplayValue = (): string => {
    if (value === 'auto') return 'Auto'
    if (typeof value === 'number') return formatDuration(value)
    return DURATION_PRESET_LABELS[value]
  }

  const isPresetSelected = (preset: DurationPreset): boolean => {
    return value === preset
  }

  const presets: DurationPreset[] = ['short', 'medium', 'long']

  // Get duration limits for this context
  const limits = DURATION_LIMITS[context]

  // Get max duration hint based on context
  const getMaxDurationHint = (): string => {
    return `${limits.min}s - ${limits.max}s`
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Main button showing current selection */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          min-w-[70px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-center
          bg-[var(--sona-surface)] border border-[var(--sona-border)]
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        style={{
          borderColor: isOpen ? accentColor : undefined,
        }}
      >
        <span>{getShortDisplayValue()}</span>
        {typeof value !== 'number' && value !== 'auto' && (
          <span className="text-[10px] text-[var(--sona-text-subtle)] ml-1">
            ({formatDuration(presetValues[value])})
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 p-2 rounded-xl
              bg-[var(--sona-surface)] border border-[var(--sona-border)]
              shadow-lg min-w-[160px]"
          >
            {/* Auto option */}
            <button
              type="button"
              onClick={() => handlePresetClick('auto')}
              className={`
                w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors
                flex items-center justify-between mb-1
                ${value === 'auto'
                  ? 'text-white'
                  : 'bg-[var(--sona-bg)] hover:opacity-80 text-[var(--sona-text)]'
                }
              `}
              style={{
                backgroundColor: value === 'auto' ? accentColor : undefined,
              }}
            >
              <span>Auto</span>
              <span className={`text-[10px] ${value === 'auto' ? 'text-white/70' : 'text-[var(--sona-text-subtle)]'}`}>
                Recommended
              </span>
            </button>

            {/* Divider */}
            <div className="h-px bg-[var(--sona-border)] my-2" />

            {/* Preset options */}
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`
                    w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    flex items-center justify-between
                    ${isPresetSelected(preset)
                      ? 'text-white'
                      : 'bg-[var(--sona-bg)] hover:opacity-80 text-[var(--sona-text)]'
                    }
                  `}
                  style={{
                    backgroundColor: isPresetSelected(preset) ? accentColor : undefined,
                  }}
                >
                  <span>{DURATION_PRESET_LABELS[preset]}</span>
                  <span className={`text-[10px] ${isPresetSelected(preset) ? 'text-white/70' : 'text-[var(--sona-text-subtle)]'}`}>
                    {formatDuration(presetValues[preset])}
                  </span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--sona-border)] my-2" />

            {/* Custom input */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-[var(--sona-text-subtle)] uppercase tracking-wider px-1">
                Custom
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="sec"
                  min={limits.min}
                  max={limits.max}
                  className={`
                    flex-1 px-2 py-1.5 rounded-lg text-xs font-medium text-center
                    bg-[var(--sona-bg)] border border-[var(--sona-border)]
                    focus:outline-none
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  `}
                  style={{
                    borderColor: customInput ? accentColor : undefined,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomSubmit()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customInput}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                    disabled:opacity-30 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Set
                </button>
              </div>
            </div>
            
            {/* Info text */}
            <div className="mt-2 pt-2 border-t border-[var(--sona-border)]">
              <p className="text-[9px] text-[var(--sona-text-subtle)] text-center">
                {getMaxDurationHint()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Get seconds from duration value
 */
export function getDurationSeconds(value: DurationValue, context: DurationContext): number | null {
  if (value === 'auto') return null
  if (typeof value === 'number') return value
  return DURATION_PRESET_VALUES[context][value]
}

/**
 * Get default duration for context (medium preset)
 */
export function getDefaultDuration(context: DurationContext): number {
  return DURATION_PRESET_VALUES[context].medium
}
