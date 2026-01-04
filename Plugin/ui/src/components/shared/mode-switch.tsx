/**
 * Mode Switch Component
 * 
 * Weighted toggle switch between Designer and Producer modes
 * Each mode has its own color identity
 */

import { motion } from 'framer-motion'
import { AudioLines, Headphones } from 'lucide-react'

export type GenerationMode = 'designer' | 'producer'

interface ModeSwitchProps {
  mode: GenerationMode
  onChange: (mode: GenerationMode) => void
  disabled?: boolean
}

export function ModeSwitch({ mode, onChange, disabled = false }: ModeSwitchProps) {
  const isDesigner = mode === 'designer'

  return (
    <div className="relative flex items-center">
      {/* Background track with mode-specific glow */}
      <div 
        className="relative flex rounded-xl p-1 border transition-all duration-500"
        style={{
          background: isDesigner 
            ? 'linear-gradient(135deg, var(--sona-designer-soft) 0%, var(--sona-surface) 100%)'
            : 'linear-gradient(135deg, var(--sona-producer-soft) 0%, var(--sona-surface) 100%)',
          borderColor: isDesigner 
            ? 'var(--sona-designer)' 
            : 'var(--sona-producer)',
          boxShadow: isDesigner
            ? '0 0 20px var(--sona-designer-soft), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 0 20px var(--sona-producer-soft), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Animated background indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg"
          style={{
            background: isDesigner 
              ? 'linear-gradient(135deg, var(--sona-designer) 0%, #5A8A9A 100%)'
              : 'linear-gradient(135deg, var(--sona-producer) 0%, #B8915A 100%)',
            boxShadow: isDesigner
              ? '0 2px 8px var(--sona-designer-glow)'
              : '0 2px 8px var(--sona-producer-glow)',
          }}
          initial={false}
          animate={{
            left: isDesigner ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />

        {/* Designer button */}
        <button
          onClick={() => !disabled && onChange('designer')}
          disabled={disabled}
          className={`
            relative z-10 px-5 py-2.5 rounded-lg text-xs font-bold
            transition-all duration-300 min-w-[100px]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDesigner 
              ? 'text-[var(--sona-void)]' 
              : 'text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <AudioLines className={`w-4 h-4 ${isDesigner ? 'opacity-100' : 'opacity-50'}`} />
            Designer
          </span>
        </button>

        {/* Producer button */}
        <button
          onClick={() => !disabled && onChange('producer')}
          disabled={disabled}
          className={`
            relative z-10 px-5 py-2.5 rounded-lg text-xs font-bold
            transition-all duration-300 min-w-[100px]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!isDesigner 
              ? 'text-[var(--sona-void)]' 
              : 'text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <Headphones className={`w-4 h-4 ${!isDesigner ? 'opacity-100' : 'opacity-50'}`} />
            Producer
          </span>
        </button>
      </div>
    </div>
  )
}
