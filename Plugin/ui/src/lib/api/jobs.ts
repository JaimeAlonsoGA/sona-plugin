/**
 * API Client for Audio Generation Jobs
 * 
 * This module provides functions to interact with Supabase Edge Functions
 * for job submission and Supabase database for job status queries.
 */

import { supabase } from '../supabase'
import { validateGenerateJobInput } from '../validations/generate-job'
import type { CreateJobInput, GenerateJobResponse, Job, ApiErrorResponse } from '../../types/jobs'

/**
 * Submit a job to the Edge Function
 * 
 * @param input - Job creation parameters
 * @returns Promise with job creation response
 * @throws Error if not authenticated or submission fails
 */
export async function submitJob(input: CreateJobInput): Promise<GenerateJobResponse> {
  // Validate input with Zod before submission
  // This mirrors the Edge Function validation to catch errors early
  const validation = validateGenerateJobInput(input)
  if (!validation.success) {
    throw new Error(validation.errors?.join(', ') || 'Invalid input')
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

/**
 * Get the total count of completed jobs for the current user (historical)
 * This includes all completed jobs, even those without audio files in storage
 * 
 * @returns Promise with the total count of completed jobs
 */
export async function getTotalCompletedJobsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (error) {
      console.error('Get total completed jobs count error:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Get total completed jobs count error:', error)
    return 0
  }
}
