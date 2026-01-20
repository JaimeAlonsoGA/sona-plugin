/**
 * Sound Card Component
 * 
 * Individual sound item with playback and metadata display
 */

import { Card } from '../shared'
import { ClockIcon, CalendarIcon } from '../shared/icons'
import { formatDuration, formatDate } from '../../lib/formatters'
import { CompactPlayer } from './compact-player'
import type { CompletedJobWithUrl } from '../../lib/hooks/use-jobs'

interface SoundCardProps {
  job: CompletedJobWithUrl
  index?: number
}

export function SoundCard({ job, index = 0 }: SoundCardProps) {
  // audioUrl comes pre-signed from useCompletedJobs
  const audioUrl = job.audioUrl

  // Use UCS filename if available, fallback to prompt-based name
  const displayFilename = job.filename || `sona-${job.prompt.slice(0, 20).replace(/\s+/g, '-')}`

  return (
    <Card
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      padding="none"
      className="overflow-hidden"
    >
      {/* Sound Info */}
      <div className="p-3 pb-2">
        {/* UCS Filename */}
        {job.filename && (
          <p className="text-[var(--sona-sage)] text-xs font-mono mb-1 truncate">
            {job.filename}
          </p>
        )}
        <p className="text-[var(--sona-text)] text-sm font-medium leading-snug mb-2 line-clamp-2">
          {job.prompt}
        </p>
        <div className="flex items-center gap-3 text-[var(--sona-text-muted)] text-xs">
          <span className="flex items-center gap-1">
            <ClockIcon size={12} />
            {formatDuration(job.duration)}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon size={12} />
            {formatDate(job.created_at)}
          </span>
          <span className="sona-chip active text-[10px]">
            {job.quality === 'high' ? 'HQ' : job.quality === 'standard' ? 'Std' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="px-3 pb-3">
        <CompactPlayer
          audioUrl={audioUrl}
          filename={displayFilename}
        />
      </div>
    </Card>
  )
}
