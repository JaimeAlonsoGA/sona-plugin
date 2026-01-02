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
import { useIsAuthenticated, useJobPolling, useSubmitJob, useSession } from '../lib/hooks'
import { getStorageUrl } from '../lib/utils'
import { getApiQuality } from '../lib/audio'
import { promptToFilename } from '../lib/formatters'

// Components
import { SonaHeader, SonaFooter, SonaPlayer, PromptInput, GenerationSettings } from '../components/sona'
import { Button, SonaLogo } from '../components/shared'

// Types
import type { CreateJobInput } from '../types/jobs'

type QualityLevel = 'standard' | 'high'

export default function SonaPage() {
  const navigate = useNavigate()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(10)
  const [quality, setQuality] = useState<QualityLevel>('standard')
  
  // Job state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Auth & data
  const isAuthenticated = useIsAuthenticated()
  const { data: session } = useSession()
  const submitJobMutation = useSubmitJob()
  const { data: job, isLoading } = useJobPolling(currentJobId, Boolean(currentJobId))

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

  // Handlers
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || isGenerating) return

    const input: CreateJobInput = {
      prompt: prompt.trim(),
      duration,
      quality: getApiQuality(quality),
      mode: 'designer',
    }

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setCurrentJobId(response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }, [prompt, duration, quality, isGenerating, submitJobMutation])

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
    <div className="page">
      <SonaHeader status={generationStatus} userInitial={userInitial} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
        {/* Prompt Section */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <label className="sona-label">Describe your sound</label>
          <PromptInput
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            isGenerating={isGenerating}
            placeholder="A warm analog synth pad with gentle modulation, evolving through ethereal textures..."
          />
        </div>

        {/* Settings & Generate */}
        <div className="flex items-center justify-between gap-4">
          <GenerationSettings
            duration={duration}
            quality={quality}
            onDurationChange={setDuration}
            onQualityChange={setQuality}
            disabled={isGenerating}
          />

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            loading={isGenerating}
          >
            {isGenerating ? 'Creating...' : 'Create'}
          </Button>
        </div>

        {/* Audio Player */}
        <SonaPlayer
          audioUrl={previewUrl}
          filename={audioFilename}
        />

        {/* Error Message */}
        {job?.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[var(--sona-ember)]/10 border border-[var(--sona-ember)]/20 rounded-2xl text-[var(--sona-ember)] text-sm"
          >
            {job.error_message || 'Generation failed. Please try again.'}
          </motion.div>
        )}
      </div>

      <SonaFooter />
    </div>
  )
}
