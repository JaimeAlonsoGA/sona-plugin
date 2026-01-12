/**
 * Mode Switch Component
 * 
 * 3-way toggle switch between Designer, Producer, and Creator modes
 * Each mode has its own color identity:
 * - Designer (teal): Sound effects and foley
 * - Producer (amber): Loops and one-shots  
 * - Creator (violet): Full songs and compositions
 */

import { motion } from 'framer-motion'
import { AudioLines, Headphones, Music } from 'lucide-react'

export type GenerationMode = 'designer' | 'producer' | 'creator'

interface ModeSwitchProps {
  mode: GenerationMode
  onChange: (mode: GenerationMode) => void
  disabled?: boolean
}

const MODES: { value: GenerationMode; label: string; icon: typeof AudioLines }[] = [
  { value: 'designer', label: 'Designer', icon: AudioLines },
  { value: 'producer', label: 'Producer', icon: Headphones },
  { value: 'creator', label: 'Creator', icon: Music },
]

function getModeColor(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'var(--sona-designer)'
    case 'producer': return 'var(--sona-producer)'
    case 'creator': return 'var(--sona-creator)'
  }
}

function getModeSoftColor(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'var(--sona-designer-soft)'
    case 'producer': return 'var(--sona-producer-soft)'
    case 'creator': return 'var(--sona-creator-soft)'
  }
}

function getModeGlowColor(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'var(--sona-designer-glow)'
    case 'producer': return 'var(--sona-producer-glow)'
    case 'creator': return 'var(--sona-creator-glow)'
  }
}

function getModeGradient(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'linear-gradient(135deg, var(--sona-designer) 0%, #5A8A9A 100%)'
    case 'producer': return 'linear-gradient(135deg, var(--sona-producer) 0%, #B8915A 100%)'
    case 'creator': return 'linear-gradient(135deg, var(--sona-creator) 0%, #8A5AB8 100%)'
  }
}

export function ModeSwitch({ mode, onChange, disabled = false }: ModeSwitchProps) {
  const modeIndex = MODES.findIndex(m => m.value === mode)

  return (
    <div className="relative flex items-center">
      {/* Background track with mode-specific glow */}
      <div 
        className="relative flex rounded-xl p-1 border transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${getModeSoftColor(mode)} 0%, var(--sona-surface) 100%)`,
          borderColor: getModeColor(mode),
          boxShadow: `0 0 20px ${getModeSoftColor(mode)}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Animated background indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg"
          style={{
            background: getModeGradient(mode),
            boxShadow: `0 2px 8px ${getModeGlowColor(mode)}`,
          }}
          initial={false}
          animate={{
            left: `calc(${modeIndex * 33.333}% + 4px)`,
            width: 'calc(33.333% - 6px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />

        {/* Mode buttons */}
        {MODES.map((modeOption) => {
          const Icon = modeOption.icon
          const isActive = mode === modeOption.value
          
          return (
            <button
              key={modeOption.value}
              onClick={() => !disabled && onChange(modeOption.value)}
              disabled={disabled}
              className={`
                relative z-10 px-4 py-2.5 rounded-lg text-xs font-bold
                transition-all duration-300 min-w-[90px]
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive 
                  ? 'text-[var(--sona-void)]' 
                  : 'text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
                }
              `}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                {modeOption.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
