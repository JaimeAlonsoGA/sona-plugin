/**
 * Generation Settings Component
 * 
 * Unified controls for audio generation with Designer/Producer/Creator modes
 * 
 * Designer mode (Sound Effects):
 * - Duration (short/medium/long/auto/custom)
 * - Quality (draft/standard/high)
 * - NO key selector
 * 
 * Producer mode (Loops):
 * - BPM, Time Signature, Bars, Key
 * - Quality (draft/standard/high)
 * 
 * Creator mode (Songs):
 * - Duration (short=1min/medium=2min/long=3min)
 * - BPM, Key
 * - Quality (draft/standard/high)
 */

import { ToggleGroup } from '../shared/toggle-group'
import { ModeSwitch, type GenerationMode } from '../shared/mode-switch'
import { KeySelector, type KeyValue } from '../shared/key-selector'
import { 
  DurationPresetSelector, 
  type DurationValue, 
  getDurationSeconds,
  getDefaultDuration
} from '../shared/duration-preset-selector'
import { ProducerSettings, BPMSelector, type ProducerConfig, DEFAULT_PRODUCER_CONFIG, calculateDuration } from '../shared/producer-settings'
import { TokenCostIndicator } from './token-cost-indicator'
import type { QualityLevel } from '../../lib/token-costs'

// Re-export QualityLevel for backward compatibility
export type { QualityLevel } from '../../lib/token-costs'

// Quality options - 3 levels: draft, standard, high
const QUALITY_OPTIONS = [
  { value: 'draft' as const, label: 'Draft' },
  { value: 'standard' as const, label: 'Std' },
  { value: 'high' as const, label: 'HQ', premium: true },
]

export interface CreatorConfig {
  bpm: number
}

export const DEFAULT_CREATOR_CONFIG: CreatorConfig = {
  bpm: 120,
}

export interface GenerationConfig {
  mode: GenerationMode
  // Designer mode - duration value (preset, auto, or custom)
  designerDuration: DurationValue
  // Producer mode config
  producerConfig: ProducerConfig
  // Producer one-shot duration
  producerDuration: DurationValue
  // Creator mode config
  creatorConfig: CreatorConfig
  // Creator mode duration
  creatorDuration: DurationValue
  // Quality (all modes)
  quality: QualityLevel
  // Key (producer and creator modes)
  keyValue: KeyValue
}

interface GenerationSettingsProps {
  config: GenerationConfig
  onConfigChange: (config: GenerationConfig) => void
  disabled?: boolean
}

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  mode: 'designer',
  designerDuration: 'auto',
  producerConfig: DEFAULT_PRODUCER_CONFIG,
  producerDuration: 'auto',
  creatorConfig: DEFAULT_CREATOR_CONFIG,
  creatorDuration: 'medium', // 2 minutes default for songs
  quality: 'standard',
  keyValue: { key: null, scale: 'major' },
}

/**
 * Get mode-specific color
 */
function getModeColor(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'var(--sona-designer)'
    case 'producer': return 'var(--sona-producer)'
    case 'creator': return 'var(--sona-creator)'
  }
}

/**
 * Get mode-specific soft color
 */
function getModeSoftColor(mode: GenerationMode): string {
  switch (mode) {
    case 'designer': return 'var(--sona-designer-soft)'
    case 'producer': return 'var(--sona-producer-soft)'
    case 'creator': return 'var(--sona-creator-soft)'
  }
}

/**
 * Get effective duration in seconds based on config
 */
export function getEffectiveDuration(config: GenerationConfig): number {
  if (config.mode === 'designer') {
    const seconds = getDurationSeconds(config.designerDuration, 'designer')
    return seconds ?? getDefaultDuration('designer')
  }
  
  if (config.mode === 'creator') {
    // Creator mode uses song context for duration
    const seconds = getDurationSeconds(config.creatorDuration, 'song')
    return seconds ?? getDefaultDuration('song')
  }
  
  // Producer mode - always loop
  return Math.round(calculateDuration(config.producerConfig))
}

export function GenerationSettings({
  config,
  onConfigChange,
  disabled = false,
}: GenerationSettingsProps) {
  const modeColor = getModeColor(config.mode)
  const modeSoftColor = getModeSoftColor(config.mode)

  // Calculate effective duration based on mode
  const effectiveDuration = getEffectiveDuration(config)

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Mode Switch - Centered and prominent */}
      <div className="flex justify-center">
        <ModeSwitch
          mode={config.mode}
          onChange={(mode) => onConfigChange({ ...config, mode })}
          disabled={disabled}
        />
      </div>

      {/* Settings row - Mode-specific + shared controls */}
      <div
        className="flex items-center justify-center gap-3 flex-wrap px-3 py-2.5 rounded-xl border transition-all duration-300"
        style={{
          background: modeSoftColor,
          borderColor: `color-mix(in srgb, ${modeColor} 30%, transparent)`,
        }}
      >
        {config.mode === 'designer' && (
          // Designer mode: Duration only (no key)
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color: modeColor }}
            >
              Duration
            </span>
            <DurationPresetSelector
              value={config.designerDuration}
              onChange={(designerDuration) => onConfigChange({ ...config, designerDuration })}
              context="designer"
              accentColor={modeColor}
              disabled={disabled}
            />
          </div>
        )}

        {config.mode === 'producer' && (
          // Producer mode: Type switch, BPM, Time Sig, Bars, Duration, Key
          <>
            <ProducerSettings
              config={config.producerConfig}
              onChange={(producerConfig) => onConfigChange({ ...config, producerConfig })}
              durationValue={config.producerDuration}
              onDurationChange={(producerDuration) => onConfigChange({ ...config, producerDuration })}
              disabled={disabled}
            />

            {/* Divider before Key */}
            <div
              className="w-px h-5 opacity-30"
              style={{ background: modeColor }}
            />

            {/* Key selector */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: modeColor }}
              >
                Key
              </span>
              <KeySelector
                value={config.keyValue}
                onChange={(keyValue) => onConfigChange({ ...config, keyValue })}
                disabled={disabled}
              />
            </div>
          </>
        )}

        {config.mode === 'creator' && (
          // Creator mode: Duration, BPM, Key
          <>
            {/* Duration */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: modeColor }}
              >
                Duration
              </span>
              <DurationPresetSelector
                value={config.creatorDuration}
                onChange={(creatorDuration) => onConfigChange({ ...config, creatorDuration })}
                context="song"
                accentColor={modeColor}
                disabled={disabled}
              />
            </div>

            {/* Divider */}
            <div
              className="w-px h-5 opacity-30"
              style={{ background: modeColor }}
            />

            {/* BPM - Use unified BPMSelector */}
            <BPMSelector
              value={config.creatorConfig.bpm}
              onValueChange={(bpm) => onConfigChange({
                ...config,
                creatorConfig: { ...config.creatorConfig, bpm }
              })}
              accentColor={modeColor}
              disabled={disabled}
            />

            {/* Divider */}
            <div
              className="w-px h-5 opacity-30"
              style={{ background: modeColor }}
            />

            {/* Key selector */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: modeColor }}
              >
                Key
              </span>
              <KeySelector
                value={config.keyValue}
                onChange={(keyValue) => onConfigChange({ ...config, keyValue })}
                disabled={disabled}
              />
            </div>
          </>
        )}

        {/* Divider */}
        <div
          className="w-px h-5 opacity-30"
          style={{ background: modeColor }}
        />

        {/* Quality (all modes) */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-wider font-medium"
            style={{ color: modeColor }}
          >
            Quality
          </span>
          <ToggleGroup
            options={QUALITY_OPTIONS}
            value={config.quality}
            onChange={(quality) => onConfigChange({ ...config, quality })}
            disabled={disabled}
            size="sm"
          />
        </div>

        {/* Divider */}
        <div
          className="w-px h-5 opacity-30"
          style={{ background: modeColor }}
        />

        {/* Token Cost Indicator */}
        <TokenCostIndicator
          duration={effectiveDuration}
          quality={config.quality}
          mode={config.mode}
          compact
        />
      </div>
    </div>
  )
}
