/**
 * API Client for Audio Generation Jobs
 * 
 * This module provides functions to interact with Supabase Edge Functions
 * for job submission and Supabase database for job status queries.
 */

import { supabase } from '../supabase'
import type { CreateJobInput, GenerateJobResponse, Job, ApiErrorResponse } from '../../types/jobs'

/**
 * Submit a job to the Edge Function
 * 
 * @param input - Job creation parameters
 * @returns Promise with job creation response
 * @throws Error if not authenticated or submission fails
 */
export async function submitJob(input: CreateJobInput): Promise<GenerateJobResponse> {
  // Validate input before submission
  if (!input.prompt || input.prompt.trim().length === 0) {
    throw new Error('Prompt is required and cannot be empty')
  }
  
  if (input.prompt.length > 500) {
    throw new Error('Prompt must be 500 characters or less')
  }
  
  if (input.duration !== undefined && (input.duration < 1 || input.duration > 60)) {
    throw new Error('Duration must be between 1 and 60 seconds')
  }

  // Validate that we have a session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated. Please sign in to submit a job.')
  }

  try {
    // Call the generate Edge Function
    const { data, error } = await supabase.functions.invoke<GenerateJobResponse | ApiErrorResponse>('generate', {
      body: input,
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(`Failed to submit job: ${error.message}`)
    }

    if (!data || !('success' in data)) {
      throw new Error('Invalid response from server')
    }

    if ('error' in data) {
      // Type guard for error response
      const errorResponse = data as ApiErrorResponse
      throw new Error(errorResponse.message || 'Failed to submit job')
    }

    return data as GenerateJobResponse
  } catch (error) {
    console.error('Submit job error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to submit job')
  }
}

/**
 * Get a job by ID
 * 
 * @param jobId - The job ID
 * @returns Promise with job data
 * @throws Error if job not found or fetch fails
 */
export async function getJob(jobId: string): Promise<Job> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Get job error:', error)
      throw new Error(`Failed to fetch job: ${error.message}`)
    }

    if (!data) {
      throw new Error('Job not found')
    }

    return data as Job
  } catch (error) {
    console.error('Get job error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch job')
  }
}

/**
 * Get all jobs for the current user
 * 
 * @param limit - Maximum number of jobs to return (default: 50)
 * @returns Promise with array of jobs
 * @throws Error if fetch fails
 */
export async function getUserJobs(limit = 50): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Get user jobs error:', error)
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    return (data as Job[]) || []
  } catch (error) {
    console.error('Get user jobs error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch jobs')
  }
}

/**
 * Subscribe to job status updates
 * 
 * @param jobId - The job ID to subscribe to
 * @param callback - Callback function called when job status changes
 * @returns Unsubscribe function
 */
export function subscribeToJob(
  jobId: string,
  callback: (job: Job) => void
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`job-${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        callback(payload.new as Job)
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      channel.unsubscribe()
    },
  }
}
