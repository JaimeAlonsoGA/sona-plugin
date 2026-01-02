/**
 * Sona Header Component
 * 
 * Clean, minimal navigation
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SonaLogo } from '../shared/sona-logo'
import { GenerationStatus } from '../shared/generation-status'
import { ROUTES } from '../../routes'

interface SonaHeaderProps {
  status?: 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
  userInitial?: string
}

export function SonaHeader({ status = 'idle', userInitial = '?' }: SonaHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-5 py-4">
      <SonaLogo size="md" />

      <div className="flex items-center gap-4">
        <GenerationStatus status={status} />

        <motion.button
          onClick={() => navigate(ROUTES.PROFILE)}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-[var(--sona-surface)] border border-[var(--sona-border)] flex items-center justify-center text-[var(--sona-text-muted)] font-medium text-sm transition-all hover:border-[var(--sona-muted)] hover:text-[var(--sona-text)]"
        >
          {userInitial}
        </motion.button>
      </div>
    </header>
  )
}
