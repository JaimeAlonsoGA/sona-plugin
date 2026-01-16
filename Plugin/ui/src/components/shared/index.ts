/**
 * Shared Components Barrel Export
 */

export { SonaLogo } from './sona-logo'
export { IconButton } from './icon-button'
export { Button } from './button'
export { ToggleGroup } from './toggle-group'
export { Card } from './card'
export { GenerationStatus } from './generation-status'
export { ModeSwitch } from './mode-switch'
export type { GenerationMode } from './mode-switch'
export { KeySelector } from './key-selector'
export type { MusicalKey, Scale, KeyValue } from './key-selector'
export { DurationSelector } from './duration-selector'
export { DurationPresetSelector, DURATION_PRESET_VALUES, getDurationSeconds, getDefaultDuration } from './duration-preset-selector'
export type { DurationPreset, DurationValue, DurationContext } from './duration-preset-selector'
export { ProducerSettings, BPMSelector, calculateDuration, DEFAULT_PRODUCER_CONFIG } from './producer-settings'
export type { ProducerConfig, TimeSignature, BPMSelectorProps } from './producer-settings'
export * from './icons'

// Toast & Error Handling
export { ToastProvider, useToast, ErrorBoundary } from './toast'
export type { Toast, ToastType } from './toast'
