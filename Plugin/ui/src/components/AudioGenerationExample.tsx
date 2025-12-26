/**
 * Audio Generation Example Component
 * 
 * This component demonstrates how to use the job submission hooks
 * and API to submit prompts and track job status.
 */

import { useState } from 'react'
import { useSubmitJob, useJobPolling, useIsAuthenticated } from '../lib/hooks'
import type { CreateJobInput } from '../types/jobs'

export function AudioGenerationExample() {
  const [prompt, setPrompt] = useState('')
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  
  const isAuthenticated = useIsAuthenticated()
  const submitJobMutation = useSubmitJob()
  
  // Poll for job status updates
  const { data: job, isLoading } = useJobPolling(currentJobId, !!currentJobId)

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
      console.log('Job submitted:', response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-yellow-400">
        <p>Please sign in to use audio generation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Audio Generation Example</h2>
      
      {/* Job Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your audio
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., peaceful ambient forest sounds with birds"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{prompt.length}/500 characters</p>
        </div>
        
        <button
          type="submit"
          disabled={!prompt.trim() || submitJobMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {submitJobMutation.isPending ? 'Submitting...' : 'Generate Audio'}
        </button>
      </form>

      {/* Error Display */}
      {submitJobMutation.isError && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          <p className="font-medium">Error:</p>
          <p>{submitJobMutation.error?.message || 'Failed to submit job'}</p>
        </div>
      )}

      {/* Job Status Display */}
      {currentJobId && job && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Job Status</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'completed' ? 'bg-green-900/20 text-green-400' :
              job.status === 'failed' ? 'bg-red-900/20 text-red-400' :
              'bg-blue-900/20 text-blue-400'
            }`}>
              {job.status.toUpperCase()}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 space-y-1">
            <p><span className="font-medium text-gray-300">Job ID:</span> {job.id}</p>
            <p><span className="font-medium text-gray-300">Prompt:</span> {job.prompt}</p>
            <p><span className="font-medium text-gray-300">Duration:</span> {job.duration}s</p>
            <p><span className="font-medium text-gray-300">Quality:</span> {job.quality}</p>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Polling for updates...</span>
            </div>
          )}

          {/* Error Message */}
          {job.status === 'failed' && job.error_message && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
              <p className="font-medium">Job Failed:</p>
              <p>{job.error_message}</p>
            </div>
          )}

          {/* Download Links */}
          {job.status === 'completed' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Download:</p>
              <div className="flex flex-col gap-2">
                {job.mp3_url && (
                  <a
                    href={job.mp3_url}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Preview (MP3)
                  </a>
                )}
                {job.wav_url && (
                  <a
                    href={job.wav_url}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Master (WAV)
                  </a>
                )}
                {job.result_url && !job.wav_url && !job.mp3_url && (
                  <a
                    href={job.result_url}
                    download
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Audio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
        <h4 className="font-medium text-gray-300 mb-2">How it works:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter a text description of the audio you want to generate</li>
          <li>Click "Generate Audio" to submit the job</li>
          <li>The job will be queued and processed by the backend worker</li>
          <li>Status updates automatically via polling and real-time subscriptions</li>
          <li>Download the audio files when the job completes</li>
        </ol>
      </div>
    </div>
  )
}
