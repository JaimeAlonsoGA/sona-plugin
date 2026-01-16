/**
 * Sona State Provider
 * 
 * Global state management for the Sona generation page.
 * Persists state across page navigation within the plugin.
 * 
 * State includes:
 * - Generation mode (designer/producer/creator)
 * - Mode-specific configuration
 * - Prompt text
 * - Current job and generated audio
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { DEFAULT_GENERATION_CONFIG, type GenerationConfig } from '../components/sona'
import type { Job } from '../types/jobs'

// =============================================================================
// TYPES
// =============================================================================

export interface GeneratedAudio {
  jobId: string
  previewUrl: string | null
  filename: string | null
  job: Job | null
}

interface SonaState {
  // Form state
  prompt: string
  generationConfig: GenerationConfig
  tipIndex: number
  
  // Job/Audio state  
  currentJobId: string | null
  generatedAudio: GeneratedAudio | null
}

interface SonaContextValue extends SonaState {
  // Form actions
  setPrompt: (prompt: string) => void
  setGenerationConfig: (config: GenerationConfig) => void
  updateGenerationConfig: (updates: Partial<GenerationConfig>) => void
  setTipIndex: (index: number) => void
  nextTip: (tipsLength: number) => void
  
  // Job actions
  setCurrentJobId: (jobId: string | null) => void
  setGeneratedAudio: (audio: GeneratedAudio | null) => void
  updateGeneratedAudio: (updates: Partial<GeneratedAudio>) => void
  
  // Utility
  resetState: () => void
  clearJobState: () => void
}

// =============================================================================
// CONTEXT
// =============================================================================

const SonaContext = createContext<SonaContextValue | null>(null)

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: SonaState = {
  prompt: '',
  generationConfig: DEFAULT_GENERATION_CONFIG,
  tipIndex: 0,
  currentJobId: null,
  generatedAudio: null,
}

// =============================================================================
// PROVIDER
// =============================================================================

interface SonaProviderProps {
  children: ReactNode
}

export function SonaProvider({ children }: SonaProviderProps) {
  // Form state
  const [prompt, setPrompt] = useState(INITIAL_STATE.prompt)
  const [generationConfig, setGenerationConfig] = useState(INITIAL_STATE.generationConfig)
  const [tipIndex, setTipIndex] = useState(INITIAL_STATE.tipIndex)
  
  // Job state
  const [currentJobId, setCurrentJobId] = useState<string | null>(INITIAL_STATE.currentJobId)
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(INITIAL_STATE.generatedAudio)

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const updateGenerationConfig = useCallback((updates: Partial<GenerationConfig>) => {
    setGenerationConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const nextTip = useCallback((tipsLength: number) => {
    setTipIndex(prev => (prev + 1) % tipsLength)
  }, [])

  const updateGeneratedAudio = useCallback((updates: Partial<GeneratedAudio>) => {
    setGeneratedAudio(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const resetState = useCallback(() => {
    setPrompt(INITIAL_STATE.prompt)
    setGenerationConfig(INITIAL_STATE.generationConfig)
    setTipIndex(INITIAL_STATE.tipIndex)
    setCurrentJobId(INITIAL_STATE.currentJobId)
    setGeneratedAudio(INITIAL_STATE.generatedAudio)
  }, [])

  const clearJobState = useCallback(() => {
    setCurrentJobId(null)
    setGeneratedAudio(null)
  }, [])

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const value = useMemo<SonaContextValue>(() => ({
    // State
    prompt,
    generationConfig,
    tipIndex,
    currentJobId,
    generatedAudio,
    
    // Form actions
    setPrompt,
    setGenerationConfig,
    updateGenerationConfig,
    setTipIndex,
    nextTip,
    
    // Job actions
    setCurrentJobId,
    setGeneratedAudio,
    updateGeneratedAudio,
    
    // Utility
    resetState,
    clearJobState,
  }), [
    prompt,
    generationConfig,
    tipIndex,
    currentJobId,
    generatedAudio,
    updateGenerationConfig,
    nextTip,
    updateGeneratedAudio,
    resetState,
    clearJobState,
  ])

  return (
    <SonaContext.Provider value={value}>
      {children}
    </SonaContext.Provider>
  )
}

// =============================================================================
// HOOK
// =============================================================================

export function useSonaState(): SonaContextValue {
  const context = useContext(SonaContext)
  
  if (!context) {
    throw new Error('useSonaState must be used within a SonaProvider')
  }
  
  return context
}

// =============================================================================
// SELECTOR HOOKS (for performance optimization)
// =============================================================================

/**
 * Get only the prompt state
 */
export function useSonaPrompt() {
  const { prompt, setPrompt } = useSonaState()
  return { prompt, setPrompt }
}

/**
 * Get only the generation config
 */
export function useSonaConfig() {
  const { generationConfig, setGenerationConfig, updateGenerationConfig } = useSonaState()
  return { generationConfig, setGenerationConfig, updateGenerationConfig }
}

/**
 * Get only the job/audio state
 */
export function useSonaJob() {
  const { 
    currentJobId, 
    setCurrentJobId, 
    generatedAudio, 
    setGeneratedAudio,
    updateGeneratedAudio,
    clearJobState 
  } = useSonaState()
  
  return { 
    currentJobId, 
    setCurrentJobId, 
    generatedAudio, 
    setGeneratedAudio,
    updateGeneratedAudio,
    clearJobState 
  }
}
