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
  
  if (input.duration !== undefined && input.duration !== null && (input.duration < 1 || input.duration > 180)) {
    throw new Error('Duration must be between 1 and 180 seconds')
  }

  // Get fresh session - this will auto-refresh if expired
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  console.log('[Auth Debug] getSession result:', {
    hasSession: !!session,
    sessionError: sessionError?.message,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none',
    tokenPreview: session?.access_token?.substring(0, 20) + '...',
  })
  
  if (sessionError) {
    console.error('Session error:', sessionError)
    throw new Error('Authentication error. Please sign in again.')
  }
  
  if (!session) {
    throw new Error('Not authenticated. Please sign in to submit a job.')
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  const isExpired = session.expires_at ? session.expires_at < now : false
  console.log('[Auth Debug] Token status:', {
    now,
    expiresAt: session.expires_at,
    isExpired,
    secondsUntilExpiry: session.expires_at ? session.expires_at - now : 'unknown',
  })

  // Force refresh if expired
  if (isExpired) {
    console.log('[Auth Debug] Token expired, forcing refresh...')
    const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.error('[Auth Debug] Refresh failed:', refreshError.message)
      throw new Error('Session expired. Please sign in again.')
    }
    
    if (!freshSession) {
      throw new Error('Failed to refresh session. Please sign in again.')
    }
    
    console.log('[Auth Debug] Session refreshed successfully')
  }

  try {
    // Use Supabase's built-in functions.invoke() which handles auth correctly
    console.log('[Auth Debug] Invoking Edge Function via supabase.functions.invoke')
    
    const { data, error } = await supabase.functions.invoke('generate', {
      body: input,
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(error.message || 'Failed to submit job')
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
