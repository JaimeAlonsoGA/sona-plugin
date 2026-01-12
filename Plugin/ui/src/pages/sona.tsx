/**
 * Sona - Main Sound Generation Page
 * 
 * The heart of Sona where creativity flows into sound.
 * Features: Prompt input, generation settings, and professional audio player.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Hooks
import { useIsAuthenticated, useJobPolling, useSubmitJob, useSession, useNamingSettings, exportNamingConventionForJob, useEnhancePrompt } from '../lib/hooks'
import { getStorageUrl } from '../lib/utils'
import { getApiQuality } from '../lib/audio'
import { promptToFilename } from '../lib/formatters'

// Components
import { SonaHeader, SonaFooter, SonaPlayer, PromptInput, GenerationSettings, DEFAULT_GENERATION_CONFIG, getEffectiveDuration } from '../components/sona'
import type { GenerationConfig } from '../components/sona'
import { Button, SonaLogo } from '../components/shared'

// Types
import type { CreateJobInput } from '../types/jobs'

// =============================================================================
// PROMPTING TIPS
// =============================================================================

const DESIGNER_TIPS = [
  "Describe the sound source first: 'Metal plate', 'Wooden door', 'Glass shatter'",
  "Add the action: 'falling', 'creaking', 'breaking', 'whooshing'",
  "Include texture: 'gritty', 'smooth', 'resonant', 'hollow'",
  "Specify size/scale: 'small click', 'massive explosion', 'tiny squeak'",
  "Add environment: 'in a cave', 'underwater', 'in empty room'",
  "Use onomatopoeia: 'whoosh', 'thud', 'crackle', 'hiss'",
  "Describe emotional quality: 'tense', 'eerie', 'playful', 'aggressive'",
  "Combine materials: 'metal scraping on concrete', 'glass on wood'",
]

const PRODUCER_TIPS = [
  "Start with genre: 'Lo-fi Hip Hop', 'Dark Techno', 'Ambient Drone'",
  "Describe instruments: 'dusty drums', 'warm synth pad', 'plucked bass'",
  "Add mood/vibe: 'melancholic', 'energetic', 'dreamy', 'aggressive'",
  "Include production style: 'vintage', 'modern', 'lo-fi', 'crisp'",
  "Specify tempo feel: 'laid-back groove', 'driving rhythm', 'slow burn'",
  "Reference decades: '80s synthwave', '90s boom bap', '2000s trance'",
  "Add texture words: 'saturated', 'airy', 'punchy', 'wide stereo'",
  "Describe dynamics: 'building intensity', 'sparse arrangement', 'full mix'",
]

const CREATOR_TIPS = [
  "Describe the genre: 'Epic cinematic trailer', 'Indie folk ballad', 'Electronic dance'",
  "Set the mood: 'uplifting', 'melancholic', 'intense', 'peaceful', 'dramatic'",
  "Add instrumentation: 'orchestral strings', 'acoustic guitar', 'synth pads'",
  "Describe structure: 'building intro', 'powerful chorus', 'emotional bridge'",
  "Include production style: 'polished', 'raw', 'layered', 'minimalist'",
  "Reference artists/styles: 'Hans Zimmer style', 'Lo-fi bedroom pop', 'Ambient Brian Eno'",
  "Specify energy: 'high energy drop', 'subtle build', 'explosive climax'",
  "Add sonic textures: 'warm analog', 'crisp digital', 'vintage vinyl'",
]

export default function SonaPage() {
  const navigate = useNavigate()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(DEFAULT_GENERATION_CONFIG)
  const [tipIndex, setTipIndex] = useState(0)

  // Job state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Auth & data
  const isAuthenticated = useIsAuthenticated()
  const { data: session } = useSession()
  const submitJobMutation = useSubmitJob()
  const { data: job, isLoading } = useJobPolling(currentJobId, Boolean(currentJobId))
  const enhancePromptMutation = useEnhancePrompt()

  // Instant feedback: isPending is true immediately when mutation starts
  const isPending = submitJobMutation.isPending
  const isEnhancing = enhancePromptMutation.isPending
  const { getActiveConvention, settings } = useNamingSettings()
  
  // Check if naming convention is enabled (default true if not set)
  const namingEnabled = settings.namingEnabled !== false

  // Get tips based on current mode
  const tips = generationConfig.mode === 'designer' 
    ? DESIGNER_TIPS 
    : generationConfig.mode === 'producer' 
      ? PRODUCER_TIPS 
      : CREATOR_TIPS
  const currentTip = tips[tipIndex % tips.length]

  // Get mode color for tips
  const modeColor = generationConfig.mode === 'designer' 
    ? 'var(--sona-designer)' 
    : generationConfig.mode === 'producer' 
      ? 'var(--sona-producer)' 
      : 'var(--sona-creator)'

  // Reset tip index when mode changes
  useEffect(() => {
    setTipIndex(0)
  }, [generationConfig.mode])

  const nextTip = useCallback(() => {
    setTipIndex((prev) => (prev + 1) % tips.length)
  }, [tips.length])

  // Get current naming convention name
  const activeConvention = useMemo(() =>
    getActiveConvention(generationConfig.mode),
    [getActiveConvention, generationConfig.mode]
  )

  // Calculate effective duration based on mode using centralized function
  const effectiveDuration = useMemo(() => {
    return getEffectiveDuration(generationConfig)
  }, [generationConfig])

  // Derived state - Reset loading when job completes (success or failure)
  // isPending provides instant feedback, then job status takes over
  const isGenerating = isPending ||
    isLoading ||
    job?.status === 'processing' ||
    job?.status === 'queued'

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

  // Handlers
  const handleEnhance = useCallback(async () => {
    if (!prompt.trim() || isEnhancing || isGenerating) return

    try {
      const result = await enhancePromptMutation.mutateAsync({
        prompt: prompt.trim(),
        mode: generationConfig.mode,
      })
      setPrompt(result.enhancedPrompt)
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    }
  }, [prompt, generationConfig.mode, isEnhancing, isGenerating, enhancePromptMutation])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || isGenerating) return

    // Get the active naming convention based on current mode (only if naming is enabled)
    const convention = namingEnabled ? getActiveConvention(generationConfig.mode) : null
    const namingConfig = convention ? exportNamingConventionForJob(convention) : undefined

    const isProducer = generationConfig.mode === 'producer'
    const isCreator = generationConfig.mode === 'creator'
    const producerType = generationConfig.producerConfig.type

    // Debug logging
    console.log('[Sona] Generation config:', {
      mode: generationConfig.mode,
      effectiveDuration,
      designerDuration: generationConfig.designerDuration,
      producerDuration: generationConfig.producerDuration,
      creatorDuration: generationConfig.creatorDuration,
      key: generationConfig.keyValue,
      producerConfig: generationConfig.producerConfig,
      creatorConfig: generationConfig.creatorConfig,
      convention: convention?.name || 'none found',
      namingEnabled,
    })

    const input: CreateJobInput = {
      prompt: prompt.trim(),
      duration: effectiveDuration,
      quality: getApiQuality(generationConfig.quality),
      mode: generationConfig.mode,
      namingConvention: namingConfig,
      // Skip naming convention generation if disabled (faster processing)
      skipNaming: !namingEnabled,
      // Include musical key for producer and creator modes
      ...((isProducer || isCreator) && generationConfig.keyValue.key && {
        key: generationConfig.keyValue.key,
        scale: generationConfig.keyValue.scale,
      }),
      // Include producer config for producer mode
      ...(isProducer && {
        bpm: generationConfig.producerConfig.bpm,
        timeSignature: `${generationConfig.producerConfig.timeSignature.beats}/${generationConfig.producerConfig.timeSignature.division}`,
        bars: generationConfig.producerConfig.bars,
        producerType: producerType,
      }),
      // Include creator config for creator mode
      ...(isCreator && {
        bpm: generationConfig.creatorConfig.bpm,
        producerType: 'song' as const,
        // Include user email for AES naming convention
        userEmail: session?.user?.email || undefined,
      }),
    }

    console.log('[Sona] Submitting job with FULL input:', JSON.stringify(input, null, 2))

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setCurrentJobId(response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }, [prompt, generationConfig, effectiveDuration, isGenerating, submitJobMutation, getActiveConvention, namingEnabled])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }, [handleSubmit])

  const handleDismissError = useCallback(() => {
    setCurrentJobId(null)
  }, [])

  const handleRetry = useCallback(() => {
    setCurrentJobId(null)
    // Small delay to ensure state is reset before submitting
    setTimeout(() => handleSubmit(), 100)
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
          : generationConfig.mode === 'producer'
            ? 'linear-gradient(180deg, rgba(212, 165, 106, 0.03) 0%, var(--sona-void) 30%)'
            : 'linear-gradient(180deg, rgba(165, 107, 212, 0.03) 0%, var(--sona-void) 30%)',
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
          <div className="flex items-center justify-between gap-3">
            <div className='flex flex-row gap-4'>
              <label className="sona-label shrink-0">Describe your sound</label>

              {/* Tip display */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <AnimatePresence mode="wait">
                  <motion.span
                    onClick={nextTip}
                    key={`${generationConfig.mode}-${tipIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="cursor-pointer text-[10px] text-[var(--sona-text-muted)] truncate"
                  >
                    <span
                      className="font-semibold italic"
                      style={{ color: modeColor }}
                    >
                      TIP:
                    </span>
                    {' '}{currentTip}
                  </motion.span>
                </AnimatePresence>
                {/* <button
                  onClick={nextTip}
                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all hover:scale-110"
                  style={{
                    background: `color-mix(in srgb, ${generationConfig.mode === 'designer' ? 'var(--sona-designer)' : 'var(--sona-producer)'} 20%, transparent)`,
                    color: generationConfig.mode === 'designer' ? 'var(--sona-designer)' : 'var(--sona-producer)',
                  }}
                  title="Next tip"
                >
                  + 
                </button> */}
              </div>
            </div>
            <button
              onClick={() => navigate('/prompting')}
              className="text-[10px] text-[var(--sona-sage)] hover:text-[var(--sona-sage-light)] flex items-center gap-1 transition-colors"
            >
              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">?</span>
              Prompting Guide
            </button>
          </div>
          <div className="flex-1 flex gap-3 min-h-[80px] max-h-[120px]">
            <div className="flex-1">
              <PromptInput
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                isGenerating={isGenerating}
                isEnhancing={isEnhancing}
                onEnhance={handleEnhance}
                showEnhanceButton={true}
                mode={generationConfig.mode}
                placeholder={generationConfig.mode === 'designer'
                  ? "Sound Source > Action > Mood... (e.g. 'Metallic debris falling, fast collision, tense')"
                  : generationConfig.mode === 'producer'
                    ? "Genre > Instruments > Mood... (e.g. 'Lo-fi Hip Hop, dusty drums, chill')"
                    : "Genre > Mood > Style... (e.g. 'Epic cinematic trailer, dramatic orchestral, building intensity')"
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
                    : generationConfig.mode === 'producer'
                    ? 'linear-gradient(135deg, var(--sona-producer) 0%, #B8915A 100%)'
                    : 'linear-gradient(135deg, var(--sona-creator) 0%, #B8915A 100%)'
              }}
            >
              {isGenerating ? '...' : 'Create'}
            </Button>
          </div>
        </section>

        {/* Audio Player - Fixed height */}
        <section className="py-2 relative">
          <SonaPlayer
            audioUrl={previewUrl}
            filename={audioFilename}
          />

          {/* Error Message - Absolute positioned overlay to avoid layout shift */}
          <AnimatePresence>
            {job?.status === 'failed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-0 top-full mt-2 z-10"
              >
                <div className="p-3 bg-[var(--sona-void)] border border-[var(--sona-ember)] rounded-xl shadow-lg">
                  <div className="flex items-start gap-3">
                    {/* Error icon */}
                    <div className="shrink-0 w-5 h-5 rounded-full bg-[var(--sona-ember)]/20 flex items-center justify-center mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1L11 10H1L6 1Z" stroke="var(--sona-ember)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 5V7" stroke="var(--sona-ember)" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="6" cy="8.5" r="0.5" fill="var(--sona-ember)" />
                      </svg>
                    </div>

                    {/* Error message */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--sona-ember)] text-xs font-medium mb-1">
                        Generation Failed
                      </p>
                      <p className="text-[var(--sona-text-muted)] text-[11px] leading-relaxed">
                        {job.error_message || 'An error occurred during generation. Please try again or contact support if the issue persists.'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-center gap-2 shrink-0">
                      <button
                        onClick={handleRetry}
                        disabled={!prompt.trim()}
                        className="text-center px-3 py-3 rounded-lg text-[10px] font-medium transition-all
                                   bg-[var(--sona-ember)] text-white hover:bg-[var(--sona-ember)]/90
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Retry
                      </button>
                      <button
                        onClick={handleDismissError}
                        className="w-6 h-6 rounded-lg flex items-center justify-center
                                   text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] hover:bg-[var(--sona-surface)]
                                   transition-colors"
                        title="Dismiss"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div >

      <SonaFooter
        namingConvention={activeConvention}
        mode={generationConfig.mode}
      />
    </motion.div >
  )
}
