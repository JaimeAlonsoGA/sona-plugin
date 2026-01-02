/**
 * Generation Status Indicator
 * 
 * Subtle, trustworthy status display
 */

import { motion, AnimatePresence } from 'framer-motion'

interface GenerationStatusProps {
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
  show?: boolean
}

export function GenerationStatus({ status, show = true }: GenerationStatusProps) {
  if (!show || status === 'idle' || status === 'completed') return null

  const statusConfig = {
    queued: {
      label: 'Queued',
      color: 'var(--sona-gold)',
    },
    processing: {
      label: 'Creating',
      color: 'var(--sona-sage)',
    },
    failed: {
      label: 'Failed',
      color: 'var(--sona-ember)',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  if (!config) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="flex items-center gap-2 text-[11px] font-medium tracking-wide"
        style={{ color: config.color }}
      >
        {/* Simple pulsing dot */}
        {(status === 'queued' || status === 'processing') && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        {config.label}
      </motion.div>
    </AnimatePresence>
  )
}
