/**
 * Producer Settings Component
 * 
 * BPM, Time Signature, and Bars controls for Producer mode
 * Calculates duration in seconds from musical parameters
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type DurationValue } from './duration-preset-selector'

export interface TimeSignature {
  beats: number
  division: number
}

export type ProducerType = 'loop'

export interface ProducerConfig {
  type: ProducerType
  bpm: number
  timeSignature: TimeSignature
  bars: number
  duration?: number // For 'song' mode (seconds)
}

interface ProducerSettingsProps {
  config: ProducerConfig
  onChange: (config: ProducerConfig) => void
  /** Duration value for one-shot/song modes */
  durationValue?: DurationValue
  /** Callback when duration changes */
  onDurationChange?: (value: DurationValue) => void
  disabled?: boolean
}

// Common BPM values
const BPM_PRESETS = [60, 80, 90, 100, 110, 120, 128, 140, 150, 160, 170, 180]

// Common time signatures
const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 4, division: 4 },
  { beats: 3, division: 4 },
  { beats: 6, division: 8 },
  { beats: 2, division: 4 },
  { beats: 5, division: 4 },
  { beats: 7, division: 8 },
]

/**
 * Calculate loop duration in seconds from BPM, bars, and time signature
 */
export function getLoopDuration(config: ProducerConfig): number {
  const { beats, division } = config.timeSignature
  // beats = numerador (ej: 6)
  // division = denominador (ej: 8)

  // Duración de una negra
  const secondsPerQuarter = 60 / config.bpm

  // Ajuste según denominador
  const beatDuration =
    secondsPerQuarter * (4 / division)
  const duration =
    beatDuration * beats * config.bars

  return Math.round(duration * 100) / 100
}

// Bar options based on time signature (powers of 2 for musical phrasing)
const BARS_OPTIONS = [1, 2, 4, 8, 16, 32]

/**
 * Calculate duration in seconds from producer config
 * Formula: (60 / BPM) * beatsPerBar * numBars
 */
export function calculateDuration(config: ProducerConfig): number {
  // Loop mode: calculate from bars
  return getLoopDuration(config);
}



export function ProducerSettings({ 
  config, 
  onChange, 
  disabled = false 
}: ProducerSettingsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Rhythmic Controls (Loop mode only) */}
      <div className="flex items-center gap-2">
        {/* BPM */}
        <BPMSelector
          value={config.bpm}
          onValueChange={(bpm) => onChange({ ...config, bpm })}
          disabled={disabled}
        />

        {/* Time Signature */}
        <TimeSignatureSelector
          value={config.timeSignature}
          onValueChange={(timeSignature) => onChange({ ...config, timeSignature })}
          disabled={disabled}
          />
        </div>

      {/* Bars */}
      <BarsSelector
        value={config.bars}
        onChange={(bars) => onChange({ ...config, bars })}
        disabled={disabled}
      />
    </div>
  )
}

// BPM Selector component - exported for reuse in Creator mode
export interface BPMSelectorProps {
  value: number
  onValueChange: (value: number) => void
  disabled?: boolean
  /** Optional accent color */
  accentColor?: string
  /** Optional label override */
  label?: string
}

export function BPMSelector({ value, onValueChange, disabled, accentColor, label = 'BPM' }: BPMSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setInputValue(rawValue)
    const num = parseInt(rawValue)
    if (!isNaN(num) && num >= 40 && num <= 200) {
      onValueChange(num)
    }
  }

  // Clamp value on blur to ensure it's within valid range
  const handleBlur = () => {
    const num = parseInt(inputValue)
    if (isNaN(num) || num < 40) {
      setInputValue('40')
      onValueChange(40)
    } else if (num > 200) {
      setInputValue('200')
      onValueChange(200)
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <span 
        className="text-[10px] uppercase tracking-wider font-medium"
        style={{ color: accentColor || 'var(--sona-text-subtle)' }}
      >
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          min={40}
          max={200}
          className={`
            w-14 px-2 py-1 rounded-lg text-xs font-medium text-center
            bg-[var(--sona-surface)] border border-[var(--sona-border)]
            focus:outline-none focus:border-[var(--sona-sage)]
            disabled:opacity-50 disabled:cursor-not-allowed
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 mt-1 z-50 bg-[var(--sona-elevated)] 
                         border border-[var(--sona-border)] rounded-lg shadow-lg overflow-hidden
                         max-h-[200px] overflow-y-auto"
            >
              {BPM_PRESETS.map(bpm => (
                <button
                  key={bpm}
                  onClick={() => {
                    onValueChange(bpm)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full px-4 py-1.5 text-left text-xs
                    transition-colors duration-150
                    ${value === bpm
                      ? 'bg-[var(--sona-sage)]/20 text-[var(--sona-sage)]'
                      : 'text-[var(--sona-text)] hover:bg-[var(--sona-surface)]'
                    }
                  `}
                >
                  {bpm}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Time Signature Selector
interface TimeSignatureSelectorProps {
  value: TimeSignature
  onValueChange: (value: TimeSignature) => void
  disabled?: boolean
}

function TimeSignatureSelector({ value, onValueChange, disabled }: TimeSignatureSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <span className="text-[10px] text-[var(--sona-text-subtle)] uppercase tracking-wider font-medium">
        Time
      </span>

      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            px-2 py-1 rounded-lg text-xs font-medium min-w-[40px]
            bg-[var(--sona-surface)] border border-[var(--sona-border)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen ? 'border-[var(--sona-sage)]' : 'hover:border-[var(--sona-sage)]/50'}
          `}
        >
          {value.beats}/{value.division}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 mt-1 z-50 bg-[var(--sona-elevated)] 
                         border border-[var(--sona-border)] rounded-lg shadow-lg overflow-hidden"
            >
              {TIME_SIGNATURES.map(ts => (
                <button
                  key={`${ts.beats}/${ts.division}`}
                  onClick={() => {
                    onValueChange(ts)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full px-4 py-1.5 text-left text-xs
                    transition-colors duration-150
                    ${value.beats === ts.beats && value.division === ts.division
                      ? 'bg-[var(--sona-sage)]/20 text-[var(--sona-sage)]'
                      : 'text-[var(--sona-text)] hover:bg-[var(--sona-surface)]'
                    }
                  `}
                >
                  {ts.beats}/{ts.division}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Bars Selector
interface BarsSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

function BarsSelector({ value, onChange, disabled }: BarsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <span className="text-[10px] text-[var(--sona-text-subtle)] uppercase tracking-wider">
        Bars
      </span>

      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 py-1 rounded-lg text-xs font-medium min-w-[40px]
          bg-[var(--sona-surface)] border border-[var(--sona-border)]
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-[var(--sona-sage)]' : 'hover:border-[var(--sona-sage)]/50'}
        `}
      >
        {value}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 mt-1 z-50 bg-[var(--sona-elevated)] 
                       border border-[var(--sona-border)] rounded-lg shadow-lg overflow-hidden"
          >
            {BARS_OPTIONS.map(bars => (
              <button
                key={bars}
                onClick={() => {
                  onChange(bars)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-1.5 text-left text-xs
                  transition-colors duration-150
                  ${value === bars
                    ? 'bg-[var(--sona-sage)]/20 text-[var(--sona-sage)]'
                    : 'text-[var(--sona-text)] hover:bg-[var(--sona-surface)]'
                  }
                `}
              >
                {bars} {bars === 1 ? 'bar' : 'bars'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const DEFAULT_PRODUCER_CONFIG: ProducerConfig = {
  type: 'loop',
  bpm: 120,
  timeSignature: { beats: 4, division: 4 },
  bars: 4,
  duration: 180,
}
