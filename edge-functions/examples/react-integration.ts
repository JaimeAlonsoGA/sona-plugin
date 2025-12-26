/**
 * Example: How to call the generate Edge Function from React/TypeScript
 * 
 * This file demonstrates the client-side integration with the Edge Function.
 * Add this to your React app or use it as a reference.
 */

import { supabase } from './lib/supabase'

/**
 * Generate audio job by calling the Edge Function
 * 
 * @param prompt - Text description for audio generation
 * @param duration - Duration in seconds (1-60)
 * @param quality - Quality level
 * @param mode - Generation mode
 * @returns Promise with job data
 */
export async function createAudioJob(
  prompt: string,
  duration: number = 10,
  quality: 'low' | 'medium' | 'high' = 'medium',
  mode: string = 'default'
) {
  try {
    // Ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated. Please sign in first.')
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('generate', {
      body: {
        prompt,
        duration,
        quality,
        mode,
      }
    })

    if (error) {
      console.error('Edge function error:', error)
      throw new Error(`Failed to create job: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error creating audio job:', error)
    throw error
  }
}

/**
 * React Hook Example
 */
import { useMutation } from '@tanstack/react-query'

export function useCreateAudioJob() {
  return useMutation({
    mutationFn: ({ 
      prompt, 
      duration, 
      quality, 
      mode 
    }: {
      prompt: string
      duration?: number
      quality?: 'low' | 'medium' | 'high'
      mode?: string
    }) => createAudioJob(prompt, duration, quality, mode),
    onSuccess: (data) => {
      console.log('Job created:', data)
    },
    onError: (error) => {
      console.error('Failed to create job:', error)
    }
  })
}

/**
 * React Component Example
 */
export function AudioGeneratorExample() {
  const createJob = useCreateAudioJob()

  const handleGenerate = async () => {
    try {
      const result = await createJob.mutateAsync({
        prompt: 'peaceful ambient forest sounds with birds',
        duration: 10,
        quality: 'medium',
        mode: 'ambient'
      })

      console.log('Job created successfully:', result)
      alert(`Job created! ID: ${result.job_id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create job')
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={handleGenerate}
        disabled={createJob.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {createJob.isPending ? 'Creating Job...' : 'Generate Audio'}
      </button>

      {createJob.isSuccess && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          Job created successfully! ID: {createJob.data.job_id}
        </div>
      )}

      {createJob.isError && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          Error: {createJob.error.message}
        </div>
      )}
    </div>
  )
}

/**
 * Direct Fetch Example (without Supabase client)
 */
export async function createAudioJobWithFetch(
  supabaseUrl: string,
  accessToken: string,
  prompt: string,
  duration: number = 10,
  quality: 'low' | 'medium' | 'high' = 'medium',
  mode: string = 'default'
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration,
      quality,
      mode,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create job')
  }

  return await response.json()
}
