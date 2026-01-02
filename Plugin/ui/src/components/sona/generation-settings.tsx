/**
 * Generation Settings Component
 * 
 * Simple, clear controls for audio generation
 */

import { ToggleGroup } from '../shared/toggle-group'

interface GenerationSettingsProps {
  duration: number
  quality: 'standard' | 'high'
  onDurationChange: (duration: number) => void
  onQualityChange: (quality: 'standard' | 'high') => void
  disabled?: boolean
}

const DURATION_OPTIONS = [
  { value: 3, label: '3s' },
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
]

const QUALITY_OPTIONS = [
  { value: 'standard' as const, label: 'Standard' },
  { value: 'high' as const, label: 'High' },
]

export function GenerationSettings({
  duration,
  quality,
  onDurationChange,
  onQualityChange,
  disabled = false,
}: GenerationSettingsProps) {
  return (
    <div className="flex items-center gap-5">
      {/* Duration */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] text-[var(--sona-text-subtle)] uppercase tracking-wider">
          Duration
        </span>
        <ToggleGroup
          options={DURATION_OPTIONS}
          value={duration}
          onChange={onDurationChange}
          disabled={disabled}
          size="sm"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--sona-border)]" />

      {/* Quality */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] text-[var(--sona-text-subtle)] uppercase tracking-wider">
          Quality
        </span>
        <ToggleGroup
          options={QUALITY_OPTIONS}
          value={quality}
          onChange={onQualityChange}
          disabled={disabled}
          size="sm"
        />
      </div>
    </div>
  )
}
