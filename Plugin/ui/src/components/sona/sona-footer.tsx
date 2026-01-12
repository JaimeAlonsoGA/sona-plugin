/**
 * Sona Footer Component
 * 
 * Shows naming convention, audio specs, and version
 */

import { NamingConvention } from "../../types/naming"

interface SonaFooterProps {
  version?: string
  namingConvention?: NamingConvention
  mode?: 'designer' | 'producer' | 'creator'
}

export function SonaFooter({ 
  version = '0.1.0',
  namingConvention,
  mode = 'designer'
}: SonaFooterProps) {
  const modeColor = mode === 'designer' 
    ? 'var(--sona-designer)' 
    : mode === 'producer' 
      ? 'var(--sona-producer)'
      : 'var(--sona-creator)'
  
  return (  
    <footer className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--sona-border)] bg-[var(--sona-void)]">
      {/* Naming convention */}
      <div className="flex items-center gap-2 text-[10px] text-[var(--sona-text-subtle)]">
        <span className="uppercase tracking-wider opacity-60">Naming</span>
        <span 
          className="font-medium tracking-wide"
          style={{ color: modeColor }}
        >
          {namingConvention?.name || 'Default UCS'}
        </span>
        <span className="font-medium tracking-wide truncate">
          {namingConvention?.description}
        </span>
      </div>

      {/* Audio specs */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5 text-[var(--sona-text-subtle)]">
          <WaveformIcon className="w-3 h-3 opacity-50" />
          <span className="font-mono">44.1kHz</span>
          <span className="opacity-30">·</span>
          <span className="font-mono">16bit</span>
        </div>
        
        <span className="text-[var(--sona-text-subtle)]/50">|</span>
        
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
