/**
 * Key Selector Component
 * 
 * Musical key selection with optional "No key" option
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type MusicalKey = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' 
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B' 
  | null

export type Scale = 'major' | 'minor'

export interface KeyValue {
  key: MusicalKey
  scale: Scale
}

interface KeySelectorProps {
  value: KeyValue
  onChange: (value: KeyValue) => void
  disabled?: boolean
}

const KEYS: MusicalKey[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 
  'F#', 'G', 'G#', 'A', 'A#', 'B'
]

const SCALES: { value: Scale; label: string }[] = [
  { value: 'major', label: 'Maj' },
  { value: 'minor', label: 'Min' },
]

export function KeySelector({ value, onChange, disabled = false }: KeySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayText = value.key 
    ? `${value.key} ${value.scale === 'major' ? 'Maj' : 'Min'}`
    : 'No key'

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          bg-[var(--sona-surface)] border border-[var(--sona-border)]
          text-xs font-medium min-w-[80px] justify-between
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-[var(--sona-sage)]' : 'hover:border-[var(--sona-sage)]/50'}
          ${value.key ? 'text-[var(--sona-text)]' : 'text-[var(--sona-text-muted)]'}
        `}
      >
        <span className="flex items-center gap-1.5">
          <KeyIcon className="w-3 h-3 opacity-60" />
          {displayText}
        </span>
        <ChevronIcon className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 z-50 bg-[var(--sona-elevated)] 
                       border border-[var(--sona-border)] rounded-xl shadow-lg overflow-hidden
                       min-w-[200px]"
          >
            {/* No key option */}
            <button
              onClick={() => {
                onChange({ key: null, scale: value.scale })
                setIsOpen(false)
              }}
              className={`
                w-full px-3 py-2 text-left text-xs
                transition-colors duration-150
                ${!value.key 
                  ? 'bg-[var(--sona-sage)]/20 text-[var(--sona-sage)]' 
                  : 'text-[var(--sona-text-muted)] hover:bg-[var(--sona-surface)]'
                }
              `}
            >
              No key
            </button>

            <div className="border-t border-[var(--sona-border)]" />

            {/* Scale selector */}
            <div className="flex p-2 gap-1 border-b border-[var(--sona-border)]">
              {SCALES.map(scale => (
                <button
                  key={scale.value}
                  onClick={() => onChange({ ...value, scale: scale.value })}
                  className={`
                    flex-1 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-150
                    ${value.scale === scale.value
                      ? 'bg-[var(--sona-sage)] text-[var(--sona-cream)]'
                      : 'text-[var(--sona-text-muted)] hover:bg-[var(--sona-surface)]'
                    }
                  `}
                >
                  {scale.label}
                </button>
              ))}
            </div>

            {/* Keys grid */}
            <div className="p-2 grid grid-cols-4 gap-1">
              {KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => {
                    onChange({ key, scale: value.scale })
                    setIsOpen(false)
                  }}
                  className={`
                    px-2 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-150
                    ${value.key === key
                      ? 'bg-[var(--sona-sage)] text-[var(--sona-cream)]'
                      : 'text-[var(--sona-text)] hover:bg-[var(--sona-surface)]'
                    }
                    ${key?.includes('#') ? 'bg-[var(--sona-void)]/50' : ''}
                  `}
                >
                  {key}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 14V6l6-4v8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="2" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
