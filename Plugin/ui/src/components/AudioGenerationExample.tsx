/**
 * Audio Generation Example Component
 *
 * Demonstrates how to submit audio generation jobs
 * and track their status using Supabase Edge Functions.
 *
 * Architecture:
 * React UI → Edge Function → jobs table → Audio Worker → Storage → UI
 */

import { useState, useMemo } from 'react'
import {
  useSubmitJob,
  useJobPolling,
  useIsAuthenticated,
} from '../lib/hooks'
import type { CreateJobInput } from '../types/jobs'

// Supabase Storage configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const STORAGE_BUCKET = 'audio-files'

/**
 * Build a public URL from a storage path
 */
function getStorageUrl(path: string | null): string | null {
  if (!path) return null
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

export function AudioGenerationExample() {
  const [prompt, setPrompt] = useState('')
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const isAuthenticated = useIsAuthenticated()
  const submitJobMutation = useSubmitJob()

  // Polls job status until completed or failed
  const { data: job, isLoading } = useJobPolling(
    currentJobId,
    Boolean(currentJobId)
  )

  // Build URLs from storage paths
  const previewUrl = useMemo(() => getStorageUrl(job?.preview_path ?? null), [job?.preview_path])
  const masterUrl = useMemo(() => getStorageUrl(job?.master_path ?? null), [job?.master_path])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const input: CreateJobInput = {
      prompt: prompt.trim(),
      duration: 10,
      quality: 'medium',
      mode: 'default',
    }

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setCurrentJobId(response.job_id)
      console.log('Audio job submitted:', response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-yellow-400">
        <p>Please sign in to generate audio.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        Audio Generation
      </h2>

      {/* Job Submission */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Describe your audio
          </label>

          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. cinematic sci-fi laser impact with tail"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            rows={3}
            maxLength={500}
          />

          <p className="text-xs text-gray-500 mt-1">
            {prompt.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || submitJobMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {submitJobMutation.isPending
            ? 'Submitting…'
            : 'Generate Audio'}
        </button>
      </form>

      {/* Submission Error */}
      {submitJobMutation.isError && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          <p className="font-medium">Submission failed</p>
          <p>
            {submitJobMutation.error?.message ??
              'Unable to create job'}
          </p>
        </div>
      )}

      {/* Job Status */}
      {currentJobId && job && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Job Status
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'completed'
                  ? 'bg-green-900/20 text-green-400'
                  : job.status === 'failed'
                    ? 'bg-red-900/20 text-red-400'
                    : 'bg-blue-900/20 text-blue-400'
                }`}
            >
              {job.status.toUpperCase()}
            </span>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p>
              <span className="font-medium text-gray-300">
                Job ID:
              </span>{' '}
              {job.id}
            </p>
            <p>
              <span className="font-medium text-gray-300">
                Prompt:
              </span>{' '}
              {job.prompt}
            </p>
            <p>
              <span className="font-medium text-gray-300">
                Duration:
              </span>{' '}
              {job.duration}s
            </p>
            <p>
              <span className="font-medium text-gray-300">
                Quality:
              </span>{' '}
              {job.quality}
            </p>
          </div>

          {/* Processing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-400">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm">
                Processing audio…
              </span>
            </div>
          )}

          {/* Failure */}
          {job.status === 'failed' &&
            job.error_message && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                <p className="font-medium">Job failed</p>
                <p>{job.error_message}</p>
              </div>
            )}

          {/* Audio Player */}
          {job.status === 'completed' && previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">
                Play Audio
              </p>
              <audio
                controls
                className="w-full"
                src={previewUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Downloads */}
          {job.status === 'completed' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">
                Downloads
              </p>

              <div className="flex flex-col gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                  >
                    Preview (MP3)
                  </a>
                )}

                {masterUrl && (
                  <a
                    href={masterUrl}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                  >
                    Master (WAV)
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      {/* <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
        <h4 className="font-medium text-gray-300 mb-2">
          How it works
        </h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Submit a text prompt</li>
          <li>A job is created and queued</li>
          <li>The audio worker processes it asynchronously</li>
          <li>Preview and master audio become available</li>
        </ol>
      </div> */}
    </div>
  )
}
