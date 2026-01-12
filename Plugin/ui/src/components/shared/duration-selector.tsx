/**
 * Duration Selector Component
 *
 * Allows selecting any duration between 1 second and 3 minutes (180s)
 * or leaving it unspecified (null)
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIN_DURATION = 1
const MAX_DURATION = 180

// Quick preset options
const DURATION_PRESETS = [3, 10, 30, 60, 120, 180]

interface DurationSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
  min?: number
  max?: number
  presets?: number[]
}

export function DurationSelector({
  value,
  onChange,
  disabled = false,
  min,
  max,
  presets,
}: DurationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value?.toString() ?? '')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value?.toString() ?? '')
  }, [value])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (val === '') {
      onChange(null)
      return
    }

    const minVal = min ?? MIN_DURATION
    const maxVal = max ?? MAX_DURATION

    const num = parseInt(val)
    if (!isNaN(num) && num >= minVal && num <= maxVal) {
      onChange(num)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value)
    onChange(num)
    setInputValue(num.toString())
  }

  const handlePresetClick = (preset: number) => {
    onChange(preset)
    setInputValue(preset.toString())
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setInputValue('')
    setIsOpen(false)
  }

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return '—'
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${mins}m${secs}s` : `${mins}m`
    }
    return `${seconds}s`
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Main input */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            min-w-[52px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-center
            bg-[var(--sona-surface)] border border-[var(--sona-border)]
            hover:border-[var(--sona-designer)] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen ? 'border-[var(--sona-designer)]' : ''}
          `}
        >
          {formatDuration(value)}
        </button>
      </div>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 p-3 rounded-xl
              bg-[var(--sona-surface)] border border-[var(--sona-border)]
              shadow-lg min-w-[220px]"
          >
            {/* Number input with slider */}
            <div className="space-y-3">
              {/* Input field */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="—"
                  min={min ?? MIN_DURATION}
                  max={max ?? MAX_DURATION}
                  className={`
                    flex-1 px-2 py-1.5 rounded-lg text-xs font-medium text-center
                    bg-[var(--sona-bg)] border border-[var(--sona-border)]
                    focus:outline-none focus:border-[var(--sona-designer)]
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  `}
                />
                <span className="text-[10px] text-[var(--sona-text-subtle)]">
                  sec
                </span>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min={min ?? MIN_DURATION}
                  max={max ?? MAX_DURATION}
                  value={value ?? (min ?? MIN_DURATION)}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                    bg-[var(--sona-border)]
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3.5
                    [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[var(--sona-designer)]
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-sm
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between mt-1 text-[9px] text-[var(--sona-text-subtle)]">
                  <span>{min ?? MIN_DURATION}s</span>
                  <span>{(max ?? MAX_DURATION) / 60}min</span>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-[var(--sona-text-subtle)] uppercase tracking-wider">
                  Presets
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(presets ?? DURATION_PRESETS).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`
                        px-2 py-1 rounded-md text-[10px] font-medium transition-colors
                        ${value === preset
                          ? 'bg-[var(--sona-designer)] text-white'
                          : 'bg-[var(--sona-bg)] hover:bg-[var(--sona-designer-soft)] text-[var(--sona-text)]'
                        }
                      `}
                    >
                      {formatDuration(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unspecified option */}
              <button
                type="button"
                onClick={handleClear}
                className={`
                  w-full px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors
                  border border-dashed
                  ${value === null
                    ? 'border-[var(--sona-designer)] bg-[var(--sona-designer-soft)] text-[var(--sona-designer)]'
                    : 'border-[var(--sona-border)] hover:border-[var(--sona-designer)] text-[var(--sona-text-subtle)]'
                  }
                `}
              >
                Unspecified (auto)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
