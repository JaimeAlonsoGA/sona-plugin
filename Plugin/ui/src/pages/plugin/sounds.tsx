/**
 * Sound Library Page
 * 
 * Browse and play all generated sounds
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../routes'
import { useCompletedJobs } from '../../lib/hooks'
import { SoundCard } from '../../components/sounds'
import { IconButton, Button, Card } from '../../components/shared'
import { ChevronLeftIcon, RefreshIcon, WaveformIcon } from '../../components/shared/icons'

// Loading skeleton
function SoundCardSkeleton() {
  return (
    <div className="sona-card overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="h-4 bg-[var(--sona-muted)] rounded w-3/4 mb-3" />
        <div className="h-3 bg-[var(--sona-muted)] rounded w-1/2" />
      </div>
    </div>
  )
}

export default function SoundsPage() {
  const navigate = useNavigate()
  const { data: completedJobs, isLoading, isError, refetch, isFetching, completedCount } = useCompletedJobs()

  return (
    <div className="page">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-4">
        <IconButton
          icon={<ChevronLeftIcon size={18} />}
          onClick={() => navigate(ROUTES.HOME)}
          label="Back"
        />
        <div className="flex-1">
          <h1 className="text-base font-medium text-[var(--sona-text)]">My Sounds</h1>
          <p className="text-[11px] text-[var(--sona-text-subtle)]">
            {isLoading ? '...' : `${completedCount} most recent in storage`}
          </p>
        </div>
        <IconButton
          icon={<RefreshIcon size={15} className={isFetching ? 'animate-spin' : ''} />}
          onClick={() => refetch()}
          disabled={isFetching}
          label="Refresh"
        />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-md mx-auto space-y-3">
          {/* Error State */}
          {isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-[var(--sona-ember)]/10 border border-[var(--sona-ember)]/20 rounded-2xl text-center"
            >
              <p className="text-[var(--sona-ember)] text-sm mb-4">Failed to load</p>
              <Button onClick={() => refetch()} variant="secondary" size="sm">
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <>
              <SoundCardSkeleton />
              <SoundCardSkeleton />
              <SoundCardSkeleton />
            </>
          )}

          {/* Empty State */}
          {!isLoading && !isError && completedJobs?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="text-center py-14">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--sona-surface)] border border-[var(--sona-border)] flex items-center justify-center">
                  <WaveformIcon size={24} className="text-[var(--sona-text-subtle)]" />
                </div>
                <h3 className="text-[var(--sona-text)] font-medium mb-2">No sounds yet</h3>
                <p className="text-[var(--sona-text-muted)] text-sm mb-8">
                  Your creations will appear here
                </p>
                <Button onClick={() => navigate(ROUTES.HOME)}>
                  Create your first sound
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Info Banner - Storage Limit */}
          {!isLoading && !isError && completedJobs && completedJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 p-3 bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded-xl text-center"
            >
              <p className="text-[var(--sona-text-muted)] text-xs">
                Sona stores your last 7 generations for 24 hours
              </p>
            </motion.div>
          )}

          {/* Sounds List */}
          {!isLoading && !isError && completedJobs && completedJobs.length > 0 && (
            completedJobs.map((job, index) => (
              <SoundCard key={job.id} job={job} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-3 text-center">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="text-[var(--sona-text-subtle)] hover:text-[var(--sona-sage)] text-xs transition-colors"
        >
          ← Back to create
        </button>
      </footer>
    </div>
  )
}
