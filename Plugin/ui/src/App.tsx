import { useState, useEffect } from 'react'
import { useBridge } from './lib/bridge'
import { useAuthStateListener, useSubmitJob, useJobPolling } from './lib/hooks'
import { ModeSelector } from './components/ModeSelector'
import { PromptInput } from './components/PromptInput'
import { GenerateButton } from './components/GenerateButton'
import { AudioPreview } from './components/AudioPreview'
import { StatusBar } from './components/StatusBar'
import type { CreateJobInput } from './types/jobs'

export function App() {
  const { sendToPlugin, onMessage } = useBridge()
  const [prompt, setPrompt] = useState('')
  const [connected, setConnected] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Listen to auth state changes
  useAuthStateListener()

  // Job submission mutation
  const submitJobMutation = useSubmitJob()

  // Poll for job status updates
  const { data: currentJob, isLoading: isJobLoading } = useJobPolling(
    currentJobId,
    !!currentJobId
  )

  useEffect(() => {
    // Listen for messages from the C++ plugin
    const unsubscribe = onMessage((message) => {
      console.log('Message from C++:', message)
      
      if (message.type === 'connected') {
        setConnected(true)
      }
      
      if (message.type === 'generation-complete') {
        // Handle legacy message if needed
        console.log('Generation complete (legacy)')
      }
    })

    // Notify the plugin that the UI is ready
    sendToPlugin({ type: 'ui-ready' })

    return unsubscribe
  }, [onMessage, sendToPlugin])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return
    }

    const jobInput: CreateJobInput = {
      prompt: prompt.trim(),
      duration: 10,
      quality: 'medium',
      mode: 'default',
    }

    try {
      // Submit the job to Edge Function
      const response = await submitJobMutation.mutateAsync(jobInput)
      
      // Set the current job ID to start polling
      setCurrentJobId(response.job_id)

      // Notify the C++ plugin about the new job
      sendToPlugin({
        type: 'job-submitted',
        payload: {
          jobId: response.job_id,
          prompt: prompt.trim(),
        }
      })
    } catch (error) {
      console.error('Failed to submit job:', error)
      // Error is already handled by the mutation
    }
  }

  const isGenerating = submitJobMutation.isPending || 
    (currentJob?.status === 'pending' || 
     currentJob?.status === 'queued' || 
     currentJob?.status === 'processing')

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <ModeSelector />
        <PromptInput value={prompt} onChange={setPrompt} />
        <GenerateButton 
          onClick={handleGenerate} 
          isGenerating={isGenerating}
          disabled={!prompt.trim() || submitJobMutation.isPending}
        />
        
        {/* Show error if job submission failed */}
        {submitJobMutation.isError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            <p className="font-medium mb-1">Failed to submit job</p>
            <p className="text-sm">{submitJobMutation.error?.message || 'Unknown error occurred'}</p>
          </div>
        )}
        
        <AudioPreview 
          job={currentJob || null} 
          isLoading={isJobLoading && !!currentJobId}
        />
        <StatusBar connected={connected} />
      </div>
    </div>
  )
}
