/**
 * Generation Settings Component
 * 
 * Unified controls for audio generation with Designer/Producer modes
 */

import { ToggleGroup } from '../shared/toggle-group'
import { ModeSwitch, type GenerationMode } from '../shared/mode-switch'
import { KeySelector, type KeyValue } from '../shared/key-selector'
import { ProducerSettings, type ProducerConfig, DEFAULT_PRODUCER_CONFIG, calculateDurationFromProducerConfig } from '../shared/producer-settings'
import { TokenCostIndicator } from './token-cost-indicator'

// Designer mode duration options
const DURATION_OPTIONS = [
  { value: 3, label: '3s' },
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
]

// Quality options
const QUALITY_OPTIONS = [
  { value: 'standard' as const, label: 'Std' },
  { value: 'high' as const, label: 'HQ', premium: true },
]

export interface GenerationConfig {
  mode: GenerationMode
  // Designer mode
  duration: number
  // Producer mode
  producerConfig: ProducerConfig
  // Shared
  quality: 'standard' | 'high'
  keyValue: KeyValue
}

interface GenerationSettingsProps {
  config: GenerationConfig
  onConfigChange: (config: GenerationConfig) => void
  disabled?: boolean
}

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  mode: 'designer',
  duration: 10,
  producerConfig: DEFAULT_PRODUCER_CONFIG,
  quality: 'standard',
  keyValue: { key: null, scale: 'major' },
}

export function GenerationSettings({
  config,
  onConfigChange,
  disabled = false,
}: GenerationSettingsProps) {
  const isDesigner = config.mode === 'designer'
  const modeColor = isDesigner ? 'var(--sona-designer)' : 'var(--sona-producer)'

  // Calculate effective duration based on mode
  const effectiveDuration = isDesigner 
    ? config.duration 
    : Math.round(calculateDurationFromProducerConfig(config.producerConfig))

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
          background: isDesigner 
            ? 'var(--sona-designer-soft)' 
            : 'var(--sona-producer-soft)',
          borderColor: `color-mix(in srgb, ${modeColor} 30%, transparent)`,
        }}
      >
        {isDesigner ? (
          // Designer: Duration selector
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{ color: modeColor }}
            >
              Duration
            </span>
            <ToggleGroup
              options={DURATION_OPTIONS}
              value={config.duration}
              onChange={(duration) => onConfigChange({ ...config, duration })}
              disabled={disabled}
              size="sm"
            />
          </div>
        ) : (
          // Producer: BPM, Time Signature, Bars
          <ProducerSettings
            config={config.producerConfig}
            onChange={(producerConfig) => onConfigChange({ ...config, producerConfig })}
            disabled={disabled}
          />
        )}

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

        {/* Divider */}
        <div 
          className="w-px h-5 opacity-30"
          style={{ background: modeColor }}
        />

        {/* Quality */}
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
