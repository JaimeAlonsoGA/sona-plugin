/**
 * Sona Footer Component
 * 
 * Shows naming convention, audio specs, and version
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NamingConvention } from "../../types/naming"
import { useNamingSettings } from "../../lib/hooks"
import { ChevronDownIcon, CheckIcon } from "../shared/icons"
import { CommandShortcut } from '../ui/command'

interface SonaFooterProps {
  namingEnabled: boolean
  version?: string
  namingConvention?: NamingConvention
  mode?: 'designer' | 'producer' | 'creator'
}

export function SonaFooter({
  namingEnabled,
  version = '0.1.0',
  namingConvention,
  mode = 'designer'
}: SonaFooterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { getConventionsForMode, setActiveConvention } = useNamingSettings()
  const conventions = getConventionsForMode(mode)

  const modeColor = mode === 'designer'
    ? 'var(--sona-designer)'
    : mode === 'producer'
      ? 'var(--sona-producer)'
      : 'var(--sona-creator)'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectConvention = (id: string) => {
    setActiveConvention(mode, id)
    setIsOpen(false)
  }

  return (
    <footer className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--sona-border)] bg-[var(--sona-void)]">
      {/* Naming convention with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          disabled={!namingEnabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 text-[10px] text-[var(--sona-text-subtle)] 
            transition-colors group
            ${!namingEnabled ? 'cursor-not-allowed hover:text-[var(--sona-text-subtle)]' : 'hover:text-[var(--sona-text)] cursor-pointer'}`}
        >
          <span className={`uppercase tracking-wider ${!namingEnabled ? '' : 'group-hover:opacity-80'}`}>Naming</span>
          <span
            className={`font-medium tracking-wide ${!namingEnabled ? 'opacity-50 line-through' : ''}`}
            style={{ color: modeColor }}
          >
            {namingConvention?.name || 'Default UCS'}
          </span>
          <ChevronDownIcon
            size={12}
            className={`opacity-40 ${!namingEnabled ? 'hidden' : 'group-hover:opacity-70'} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Upward dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 min-w-[220px] z-50
                bg-[var(--sona-void)] border border-[var(--sona-border)] rounded-xl
                shadow-lg overflow-hidden"
            >
              <div className="py-1 max-h-48 overflow-y-auto">
                {conventions.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConvention(conv.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-left
                      transition-colors
                      ${conv.id === namingConvention?.id
                        ? 'bg-[var(--sona-sage)]/10'
                        : 'hover:bg-[var(--sona-surface)]'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-medium truncate"
                          style={{ color: conv.id === namingConvention?.id ? modeColor : 'var(--sona-text)' }}
                        >
                          {conv.name}
                        </span>
                        {conv.isBuiltin && (
                          <span className="text-[8px] px-1 py-0.5 bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] rounded uppercase shrink-0">
                            Built-in
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-[var(--sona-text-muted)] truncate">
                        {conv.description}
                      </p>
                    </div>
                    {conv.id === namingConvention?.id && (
                      <CheckIcon size={12} style={{ color: modeColor }} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Audio specs */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5 text-[var(--sona-text-subtle)]">
          {/* <span>Shortcuts</span> */}
          <CommandShortcut>ctrl+J</CommandShortcut>
          <span className="opacity-30">·</span>
          <WaveformIcon className="w-3 h-3 opacity-50" />
          <span className="font-mono">44.1kHz</span>
          <span className="opacity-30">·</span>
          <span className="font-mono">16bit</span>
        </div>

        <span className="text-[var(--sona-text-subtle)]">|</span>

        <span className="text-[var(--sona-text-subtle)] tracking-wider">
          sona · v{version}
        </span>
      </div>
    </footer>
  )
}

function WaveformIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 6h1M3 4v4M5 2v8M7 4v4M9 5v2M11 6h-1" strokeLinecap="round" />
    </svg>
  )
}
