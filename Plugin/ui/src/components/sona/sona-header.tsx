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
import { useUserTokens } from '@/lib/hooks'
import { openWebPage, WEBSITE_ROUTES } from '@/lib/navigation'

interface SonaHeaderProps {
  status?: 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
  userInitial?: string
  isGenerating?: boolean
}

export function SonaHeader({ status = 'idle', userInitial = '?', isGenerating = false }: SonaHeaderProps) {
  const { data: userTokens } = useUserTokens()
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-5 py-2.5">
      <SonaLogo size="md" />

      <div className="flex items-center gap-4">
        <GenerationStatus status={status} />

        <motion.button
          onClick={() => openWebPage(WEBSITE_ROUTES.FEEDBACK)}
          whileTap={{ scale: 0.95 }}
          className="h-8 text-xs font-thin rounded-full px-4 bg-[var(--sona-surface)] border border-[var(--sona-border)] flex items-center justify-center text-[var(--sona-text-muted)] transition-all hover:border-[var(--sona-muted)] hover:text-[var(--sona-text)]"
        >
          Feedback
        </motion.button>

        <motion.button
          onClick={() => navigate(ROUTES.BILLING)}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-[var(--sona-surface)] border border-[var(--sona-border)] flex items-center justify-center text-[var(--sona-text-muted)] font-medium text-sm transition-all hover:border-[var(--sona-muted)] hover:text-[var(--sona-text)]"
        >
          {isGenerating ? (
            <span className="text-[10px] text-[var(--sona-gold)] animate-pulse">...</span>
          ) : (
            <span className='text-[10px] text-[var(--sona-gold)]'>{userTokens?.balance}</span>
          )}
        </motion.button>

        <motion.button
          onClick={() => navigate(ROUTES.PROFILE)}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-[var(--sona-surface)] border border-[var(--sona-border)] flex items-center justify-center text-[var(--sona-text-muted)] font-medium text-sm transition-all hover:border-[var(--sona-muted)] hover:text-[var(--sona-text)]"
        >
          {userInitial}
        </motion.button>
      </div>
    </header >
  )
}
