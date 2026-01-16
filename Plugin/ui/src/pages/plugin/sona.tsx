/**
 * Sona - Main Sound Generation Page
 * 
 * The heart of Sona where creativity flows into sound.
 * Features: Prompt input, generation settings, and professional audio player.
 */

import { useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Hooks
import { useIsAuthenticated, useJobPolling, useSubmitJob, useSession, useNamingSettings, exportNamingConventionForJob, useEnhancePrompt, useUserTokens } from '../../lib/hooks'
import { useSonaState } from '../../hooks/use-sona-state'
import { getStorageUrl } from '../../lib/utils'
import { getApiQuality } from '../../lib/audio'
import { promptToFilename } from '../../lib/formatters'
import { openWebPage, WEBSITE_ROUTES } from '../../lib/navigation'
import { useToast } from '../../components/shared'
import { parseError } from '../../lib/utils/error-parser'
import { validateGenerateJobInput } from '../../lib/validations/generate-job'
import { calculateTokenCost } from '../../lib/token-costs'

// Components
import { SonaHeader, SonaFooter, SonaPlayer, PromptInput, GenerationSettings, getEffectiveDuration } from '../../components/sona'
import { Button, SonaLogo } from '../../components/shared'

// Types
import type { CreateJobInput } from '../../types/jobs'

// =============================================================================
// PROMPTING TIPS - Based on TangoFlux & Stable Audio 2.5 documentation
// =============================================================================

const DESIGNER_TIPS = [
  "Combine multiple sound events: 'Birds chirping and thunder in the distance'",
  "Use temporal words: 'drawer creaks open, then papers rustle, followed by lock snap'",
  "Always prompt in english, or use the prompt enhancer to translate it",
  "Describe spatial context: 'distant growl reverberates, soft scraping nearby'",
  "Specify materials: 'metallic clatter on wooden table, glass vials clinking'",
  "Add actions: 'robotic arm whirs frantically while plasma arc crackles'",
  "Include environment: 'footsteps in cathedral with long natural reverb'",
  "Use onomatopoeia: 'whoosh of wind, sharp crack, sizzling sparks'",
  "Describe intensity: 'subtle rustling, then loud thunderclap, fading to soft rain'",
  "Add emotional context: 'tense, unsettling drone with subtle pulsing'",
  "Specify sound character: 'sharp metallic ping with long reverb tail'",
]

const PRODUCER_TIPS = [
  "Follow this order: Genre → Instruments → Mood → BPM for best results",
  "Use specific subgenres: 'Chicago house', 'Outlaw country', 'Lo-fi hip hop'",
  "Set appropriate BPM: 60-80 ballads, 100-120 pop/rock, 140-160 dubstep",
  "Always prompt in english, or use the prompt enhancer to translate it",
  "Name specific gear: '808 drums, SP-1200 beats, tube-distorted bass'",
  "Add production style: 'Lo-fi bedroom quality' or 'pristine studio mix'",
  "Detail rhythm: 'syncopated hi-hats, punchy kick, snappy snare with tight reverb'",
  "Include textures: 'atmospheric pads, subtle vinyl crackle, reverb tails'",
  "Describe mix character: 'bright and airy' or 'dark, murky low-end focused'",
  "Specify key: 'D minor melancholic' or 'G major uplifting progression'",
  "Reference recording: 'warm analog tape saturation' or 'clean digital precision'",
]

const CREATOR_TIPS = [
  "Define use case: 'cinematic piece perfect for opening credits'",
  "Add titles: 'epic orchestral titled Rise of the Phoenix' for creative direction",
  "Include location: 'Detroit techno', 'Nashville country', 'Ibiza house'",
  "Layer instruments: 'piano melody, strings countermelody, bass anchors harmony'",
  "Use sophisticated mood words: 'euphoric' not 'happy', 'melancholic' not 'sad'",
  "Reference eras: '80s gated reverb', '90s grunge distortion', '70s analog warmth'",
  "Describe structure: 'starts sparse, builds to powerful chorus, quiet outro'",
  "Add cultural references: 'Bollywood strings', 'Celtic folk', 'Brazilian bossa'",
  "Always prompt in english, or use the prompt enhancer to translate it",
  "Describe emotional journey: 'starts melancholic, shifts hopeful, ends triumphant'",
  "Specify vocal style: 'ethereal female vocals with heavy reverb' if needed",
]

export default function SonaPage() {
  const navigate = useNavigate()

  // Global state from provider (persists across navigation)
  const {
    prompt,
    setPrompt,
    generationConfig,
    setGenerationConfig,
    tipIndex,
    setTipIndex,
    nextTip: nextTipAction,
    currentJobId,
    setCurrentJobId,
  } = useSonaState()

  // Auth & data
  const isAuthenticated = useIsAuthenticated()
  const { data: session } = useSession()
  const submitJobMutation = useSubmitJob()
  const { data: job, isLoading } = useJobPolling(currentJobId, Boolean(currentJobId))
  const enhancePromptMutation = useEnhancePrompt()
  const { data: userTokens } = useUserTokens()

  // Toast notifications - destructure to get stable references
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast()

  // Token balance
  const tokenBalance = userTokens?.balance ?? 0

  // Instant feedback: isPending is true immediately when mutation starts
  const isPending = submitJobMutation.isPending
  const isEnhancing = enhancePromptMutation.isPending
  const { getActiveConvention, settings, } = useNamingSettings()

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

  // Set random tip index when mode changes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tips.length)
    setTipIndex(randomIndex)
  }, [generationConfig.mode, tips.length, setTipIndex])

  const nextTip = useCallback(() => {
    nextTipAction(tips.length)
  }, [tips.length, nextTipAction])

  // Get current naming convention name
  const activeConvention = useMemo(() =>
    getActiveConvention(generationConfig.mode),
    [getActiveConvention, generationConfig.mode]
  )

  // Calculate effective duration based on mode using centralized function
  const effectiveDuration = useMemo(() => {
    return getEffectiveDuration(generationConfig)
  }, [generationConfig])

  // Calculate token cost for current config
  const currentTokenCost = useMemo(() => {
    return calculateTokenCost({
      tier: generationConfig.mode,
      duration: effectiveDuration,
      quality: generationConfig.quality,
    })
  }, [generationConfig.mode, effectiveDuration, generationConfig.quality])

  // Check if user has enough tokens
  const hasEnoughTokens = tokenBalance >= currentTokenCost
  const hasAnyTokens = tokenBalance > 0

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
    if (!prompt.trim() || isEnhancing || isGenerating || !hasAnyTokens) return

    console.log('[Sona] handleEnhance called with prompt:', prompt.substring(0, 50))

    try {
      const result = await enhancePromptMutation.mutateAsync({
        prompt: prompt.trim(),
        mode: generationConfig.mode,
      })
      console.log('[Sona] Got enhanced prompt:', result.enhancedPrompt?.substring(0, 50))
      console.log('[Sona] Calling setPrompt...')
      setPrompt(result.enhancedPrompt)
      toastSuccess('Prompt Enhanced', 'Your prompt has been improved by AI')
      console.log('[Sona] setPrompt called successfully')
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
      const parsed = parseError(error)
      toastError(parsed.title, parsed.message)
    }
  }, [prompt, generationConfig.mode, isEnhancing, isGenerating, hasAnyTokens, enhancePromptMutation, setPrompt, toastSuccess, toastError])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || isGenerating || !hasEnoughTokens) return

    // Get the active naming convention based on current mode (only if naming is enabled)
    const convention = settings.namingEnabled ? getActiveConvention(generationConfig.mode) : null
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
      namingEnabled: settings.namingEnabled,
    })

    const input: CreateJobInput = {
      prompt: prompt.trim(),
      duration: effectiveDuration,
      quality: getApiQuality(generationConfig.quality),
      mode: generationConfig.mode,
      namingConvention: namingConfig,
      // Skip naming convention generation if disabled (faster processing)
      skipNaming: !settings.namingEnabled,
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

    // Frontend validation with Zod before sending to API
    const validation = validateGenerateJobInput(input)
    if (!validation.success) {
      console.warn('[Sona] Validation failed:', validation.errors)
      toastWarning('Validation Error', validation.errors?.[0] || 'Please check your input')
      return
    }

    console.log('[Sona] Submitting job with FULL input:', JSON.stringify(input, null, 2))

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setCurrentJobId(response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
      const parsed = parseError(error)
      toastError(parsed.title, parsed.message)
    }
  }, [prompt, generationConfig, effectiveDuration, isGenerating, submitJobMutation, getActiveConvention, settings.namingEnabled, session, toastWarning, toastError])

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

  // =============================================================================
  // JOB STATUS TOAST NOTIFICATIONS
  // =============================================================================

  // Show toast when job completes or fails
  useEffect(() => {
    if (!job) return
    
    // if (job.status === 'completed' && job.preview_path) {
    //   toastSuccess('Generation Complete', 'Your audio is ready to play!')
    // }
    
    if (job.status === 'failed') {
      toastError(
        'Generation Failed',
        job.error_message || 'An error occurred during generation. Please try again.'
      )
    }
  }, [job?.status, job?.preview_path, job?.error_message, toastSuccess, toastError])

  // =============================================================================
  // KEYBOARD SHORTCUT EVENT LISTENERS
  // =============================================================================

  // Listen for mode changes from Command Palette (Alt+1/2/3)
  useEffect(() => {
    const handleSetMode = (e: CustomEvent<string>) => {
      if (isGenerating) return
      const newMode = e.detail as 'designer' | 'producer' | 'creator'
      if (['designer', 'producer', 'creator'].includes(newMode)) {
        setGenerationConfig({ ...generationConfig, mode: newMode })
      }
    }

    window.addEventListener('sona:set-mode', handleSetMode as EventListener)
    return () => window.removeEventListener('sona:set-mode', handleSetMode as EventListener)
  }, [generationConfig, setGenerationConfig, isGenerating])

  // Listen for quality changes from Command Palette (1/2/3)
  useEffect(() => {
    const handleSetQuality = (e: CustomEvent<string>) => {
      if (isGenerating) return
      const newQuality = e.detail as 'low' | 'medium' | 'high'
      const qualityMap: Record<string, 'draft' | 'standard' | 'high'> = {
        low: 'draft',
        medium: 'standard',
        high: 'high',
      }
      if (qualityMap[newQuality]) {
        setGenerationConfig({ ...generationConfig, quality: qualityMap[newQuality] })
      }
    }

    window.addEventListener('sona:set-quality', handleSetQuality as EventListener)
    return () => window.removeEventListener('sona:set-quality', handleSetQuality as EventListener)
  }, [generationConfig, setGenerationConfig, isGenerating])

  // Listen for enhance prompt from Command Palette (Ctrl+Space)
  useEffect(() => {
    const handleEnhanceEvent = () => {
      handleEnhance()
    }

    window.addEventListener('sona:enhance-prompt', handleEnhanceEvent)
    return () => window.removeEventListener('sona:enhance-prompt', handleEnhanceEvent)
  }, [handleEnhance])

  // Listen for create/generate from Command Palette (Ctrl+Enter)
  useEffect(() => {
    const handleCreateEvent = () => {
      handleSubmit()
    }

    window.addEventListener('sona:create', handleCreateEvent)
    return () => window.removeEventListener('sona:create', handleCreateEvent)
  }, [handleSubmit])

  // Listen for next tip from Command Palette (Ctrl+N)
  useEffect(() => {
    const handleNextTipEvent = () => {
      nextTip()
    }

    window.addEventListener('sona:next-tip', handleNextTipEvent)
    return () => window.removeEventListener('sona:next-tip', handleNextTipEvent)
  }, [nextTip])

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
      <SonaHeader status={generationStatus} userInitial={userInitial} isGenerating={isGenerating} />

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
              onClick={() => openWebPage(WEBSITE_ROUTES.PROMPTING)}
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
                onEnhance={hasAnyTokens ? handleEnhance : undefined}
                showEnhanceButton={hasAnyTokens}
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
              disabled={!prompt.trim() || isGenerating || !hasEnoughTokens}
              loading={isGenerating}
              className="h-full w-24 shrink-0"
              title={!hasEnoughTokens ? `Requires ${currentTokenCost} tokens (you have ${tokenBalance})` : undefined}
              style={{
                background: !prompt.trim() || isGenerating || !hasEnoughTokens
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
        namingEnabled={settings.namingEnabled ?? true}
      />
    </motion.div >
  )
}
