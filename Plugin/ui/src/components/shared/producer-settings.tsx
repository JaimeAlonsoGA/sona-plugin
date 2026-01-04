/**
 * Producer Settings Component
 * 
 * BPM, Time Signature, and Bars controls for Producer mode
 * Calculates duration in seconds from musical parameters
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TimeSignature {
  beats: number
  division: number
}

export interface ProducerConfig {
  bpm: number
  bpmSync: boolean
  timeSignature: TimeSignature
  timeSignatureSync: boolean
  bars: number
}

interface ProducerSettingsProps {
  config: ProducerConfig
  onChange: (config: ProducerConfig) => void
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

// Bar options based on time signature (powers of 2 for musical phrasing)
const BARS_OPTIONS = [1, 2, 4, 8, 16, 32]

/**
 * Calculate duration in seconds from producer config
 * Formula: (60 / BPM) * beatsPerBar * numBars
 */
export function calculateDurationFromProducerConfig(config: ProducerConfig): number {
  const secondsPerBeat = 60 / config.bpm
  const beatsPerBar = config.timeSignature.beats
  const duration = secondsPerBeat * beatsPerBar * config.bars
  return Math.round(duration * 100) / 100 // Round to 2 decimals
}

export function ProducerSettings({ config, onChange, disabled = false }: ProducerSettingsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* BPM */}
      <BPMSelector
        value={config.bpm}
        sync={config.bpmSync}
        onValueChange={(bpm) => onChange({ ...config, bpm })}
        onSyncChange={(bpmSync) => onChange({ ...config, bpmSync })}
        disabled={disabled}
      />

      {/* Time Signature */}
      <TimeSignatureSelector
        value={config.timeSignature}
        sync={config.timeSignatureSync}
        onValueChange={(timeSignature) => onChange({ ...config, timeSignature })}
        onSyncChange={(timeSignatureSync) => onChange({ ...config, timeSignatureSync })}
        disabled={disabled}
      />

      {/* Bars */}
      <BarsSelector
        value={config.bars}
        onChange={(bars) => onChange({ ...config, bars })}
        disabled={disabled}
      />
    </div>
  )
}

// BPM Selector with sync toggle
interface BPMSelectorProps {
  value: number
  sync: boolean
  onValueChange: (value: number) => void
  onSyncChange: (sync: boolean) => void
  disabled?: boolean
}

function BPMSelector({ value, sync, onValueChange, onSyncChange, disabled }: BPMSelectorProps) {
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
    setInputValue(e.target.value)
    const num = parseInt(e.target.value)
    if (!isNaN(num) && num >= 20 && num <= 300) {
      onValueChange(num)
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <span className="text-[10px] text-[var(--sona-text-subtle)] uppercase tracking-wider">
        BPM
      </span>
      
      <div className="flex items-center">
        {/* Main button / input */}
        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            disabled={disabled || sync}
            min={20}
            max={300}
            className={`
              w-14 px-2 py-1 rounded-l-lg text-xs font-medium text-center
              bg-[var(--sona-surface)] border border-[var(--sona-border)] border-r-0
              focus:outline-none focus:border-[var(--sona-sage)]
              disabled:opacity-50 disabled:cursor-not-allowed
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            `}
          />
          
          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && !sync && (
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

        {/* Sync toggle */}
        <button
          onClick={() => onSyncChange(!sync)}
          disabled={disabled}
          title={sync ? 'BPM synced to DAW' : 'Click to sync BPM'}
          className={`
            px-2 py-1 rounded-r-lg text-[10px] font-medium
            border border-[var(--sona-border)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sync 
              ? 'bg-[var(--sona-sage)] text-[var(--sona-cream)] border-[var(--sona-sage)]' 
              : 'bg-[var(--sona-surface)] text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
            }
          `}
        >
          SYNC
        </button>
      </div>
    </div>
  )
}

// Time Signature Selector
interface TimeSignatureSelectorProps {
  value: TimeSignature
  sync: boolean
  onValueChange: (value: TimeSignature) => void
  onSyncChange: (sync: boolean) => void
  disabled?: boolean
}

function TimeSignatureSelector({ value, sync, onValueChange, onSyncChange, disabled }: TimeSignatureSelectorProps) {
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
        Time
      </span>
      
      <div className="flex items-center">
        <button
          onClick={() => !disabled && !sync && setIsOpen(!isOpen)}
          disabled={disabled || sync}
          className={`
            px-2 py-1 rounded-l-lg text-xs font-medium min-w-[40px]
            bg-[var(--sona-surface)] border border-[var(--sona-border)] border-r-0
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen ? 'border-[var(--sona-sage)]' : 'hover:border-[var(--sona-sage)]/50'}
          `}
        >
          {value.beats}/{value.division}
        </button>

        {/* Sync toggle */}
        <button
          onClick={() => onSyncChange(!sync)}
          disabled={disabled}
          title={sync ? 'Time signature synced to DAW' : 'Click to sync time signature'}
          className={`
            px-2 py-1 rounded-r-lg text-[10px] font-medium
            border border-[var(--sona-border)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sync 
              ? 'bg-[var(--sona-sage)] text-[var(--sona-cream)] border-[var(--sona-sage)]' 
              : 'bg-[var(--sona-surface)] text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
            }
          `}
        >
          SYNC
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
  bpm: 120,
  bpmSync: false,
  timeSignature: { beats: 4, division: 4 },
  timeSignatureSync: false,
  bars: 4,
}
