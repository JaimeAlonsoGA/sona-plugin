/**
 * Sona - Main Sound Generation Page
 * 
 * The heart of Sona where creativity flows into sound.
 * Features: Prompt input, generation settings, and professional audio player.
 */

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Hooks
import { useIsAuthenticated, useJobPolling, useSubmitJob, useSession, useNamingSettings, exportNamingConventionForJob } from '../lib/hooks'
import { getStorageUrl } from '../lib/utils'
import { getApiQuality } from '../lib/audio'
import { promptToFilename } from '../lib/formatters'

// Components
import { SonaHeader, SonaFooter, SonaPlayer, PromptInput, GenerationSettings, DEFAULT_GENERATION_CONFIG } from '../components/sona'
import type { GenerationConfig } from '../components/sona'
import { Button, SonaLogo } from '../components/shared'
import { calculateDurationFromProducerConfig } from '../components/shared/producer-settings'

// Types
import type { CreateJobInput } from '../types/jobs'

export default function SonaPage() {
  const navigate = useNavigate()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(DEFAULT_GENERATION_CONFIG)
  
  // Job state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Auth & data
  const isAuthenticated = useIsAuthenticated()
  const { data: session } = useSession()
  const submitJobMutation = useSubmitJob()
  const { data: job, isLoading } = useJobPolling(currentJobId, Boolean(currentJobId))
  const { getActiveConvention } = useNamingSettings()

  // Get current naming convention name
  const activeConvention = useMemo(() => 
    getActiveConvention(generationConfig.mode),
    [getActiveConvention, generationConfig.mode]
  )

  // Calculate effective duration based on mode
  const effectiveDuration = useMemo(() => {
    if (generationConfig.mode === 'designer') {
      return generationConfig.duration
    }
    // Producer mode: calculate from BPM, time signature, and bars
    return Math.round(calculateDurationFromProducerConfig(generationConfig.producerConfig))
  }, [generationConfig])

  // Derived state
  const isGenerating = isLoading || 
    job?.status === 'processing' || 
    job?.status === 'queued' || 
    (job?.status !== 'completed' && currentJobId !== null)

  const generationStatus = currentJobId 
    ? (job?.status ?? 'queued') as 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
    : 'idle'

  const previewUrl = useMemo(
    () => getStorageUrl(job?.preview_path ?? null), 
    [job?.preview_path]
  )

  // Use the UCS filename from the job, or fallback to promptToFilename
  const audioFilename = useMemo(
    () => job?.filename ?? promptToFilename(prompt),
    [job?.filename, prompt]
  )

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() ?? '?'

  // Mode-specific accent color
  const modeAccent = generationConfig.mode === 'designer' 
    ? 'var(--sona-designer)' 
    : 'var(--sona-producer)'

  // Handlers
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || isGenerating) return

    // Get the active naming convention based on current mode
    const convention = getActiveConvention(generationConfig.mode)
    const namingConfig = convention ? exportNamingConventionForJob(convention) : undefined
    
    // Debug logging
    console.log('[Sona] Generation config:', {
      mode: generationConfig.mode,
      effectiveDuration,
      key: generationConfig.keyValue,
      producerConfig: generationConfig.producerConfig,
      convention: convention?.name || 'none found',
    })

    const input: CreateJobInput = {
      prompt: prompt.trim(),
      duration: effectiveDuration,
      quality: getApiQuality(generationConfig.quality),
      mode: generationConfig.mode,
      namingConvention: namingConfig,
      // Include musical key if selected (will be used in prompt enhancement)
      ...(generationConfig.keyValue.key && {
        key: generationConfig.keyValue.key,
        scale: generationConfig.keyValue.scale,
      }),
      // Include producer config for reference
      ...(generationConfig.mode === 'producer' && {
        bpm: generationConfig.producerConfig.bpm,
        timeSignature: `${generationConfig.producerConfig.timeSignature.beats}/${generationConfig.producerConfig.timeSignature.division}`,
        bars: generationConfig.producerConfig.bars,
      }),
    }
    
    console.log('[Sona] Submitting job with FULL input:', JSON.stringify(input, null, 2))

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setCurrentJobId(response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }, [prompt, generationConfig, effectiveDuration, isGenerating, submitJobMutation, getActiveConvention])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }, [handleSubmit])

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="page flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <SonaLogo size="xl" />
          <p className="text-[var(--sona-text-muted)] mt-8 mb-10 max-w-[280px] mx-auto leading-relaxed">
            Transform your imagination into sound
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Get Started
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="page"
      initial={false}
      animate={{
        background: generationConfig.mode === 'designer'
          ? 'linear-gradient(180deg, rgba(107, 163, 181, 0.03) 0%, var(--sona-void) 30%)'
          : 'linear-gradient(180deg, rgba(212, 165, 106, 0.03) 0%, var(--sona-void) 30%)',
      }}
      transition={{ duration: 0.5 }}
    >
      <SonaHeader status={generationStatus} userInitial={userInitial} />

      {/* Main Content - Fixed height sections */}
      <div className="flex-1 flex flex-col px-5 pb-0 gap-0 overflow-hidden">
        
        {/* Mode Switch - Prominent at top */}
        <section className="flex justify-center pb-3">
          <GenerationSettings
            config={generationConfig}
            onConfigChange={setGenerationConfig}
            disabled={isGenerating}
          />
        </section>

        {/* Prompt + Create Section */}
        <section className="flex-1 flex flex-col gap-2 min-h-0 py-2">
          <div className="flex items-center justify-between">
            <label className="sona-label">Describe your sound</label>
            <span 
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: modeAccent, opacity: 0.7 }}
            >
              {generationConfig.mode === 'designer' 
                ? `${effectiveDuration}s` 
                : `${generationConfig.producerConfig.bars} bars · ${effectiveDuration}s`
              }
            </span>
          </div>
          <div className="flex-1 flex gap-3 min-h-[80px] max-h-[120px]">
            <div className="flex-1">
              <PromptInput
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                isGenerating={isGenerating}
                mode={generationConfig.mode}
                placeholder={generationConfig.mode === 'designer'
                  ? "Cinematic impact with metallic resonance, deep sub rumble..."
                  : "Funky bass loop with syncopated rhythm, warm analog tone..."
                }
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              loading={isGenerating}
              className="h-full w-24 shrink-0"
              style={{
                background: !prompt.trim() || isGenerating 
                  ? undefined 
                  : generationConfig.mode === 'designer'
                    ? 'linear-gradient(135deg, var(--sona-designer) 0%, #5A8A9A 100%)'
                    : 'linear-gradient(135deg, var(--sona-producer) 0%, #B8915A 100%)',
              }}
            >
              {isGenerating ? '...' : 'Create'}
            </Button>
          </div>
        </section>

        {/* Audio Player - Fixed height */}
        <section className="py-2">
          <SonaPlayer
            audioUrl={previewUrl}
            filename={audioFilename}
          />
        </section>

        {/* Error Message */}
        {job?.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-2"
          >
            <div className="p-3 bg-[var(--sona-ember)]/10 border border-[var(--sona-ember)]/20 rounded-xl text-[var(--sona-ember)] text-xs">
              {job.error_message || 'Generation failed. Please try again.'}
            </div>
          </motion.div>
        )}
      </div>

      <SonaFooter 
        namingConvention={activeConvention}
        mode={generationConfig.mode}
      />
    </motion.div>
  )
}
