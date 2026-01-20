/**
 * React Query Hooks for Job Management
 * 
 * This module provides hooks for submitting jobs, fetching job status,
 * and subscribing to real-time job updates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { submitJob, getJob, getUserJobs, subscribeToJob, getTotalCompletedJobsCount, getPublicShowcaseJobs } from '../api/jobs'
import type { CreateJobInput, Job } from '../../types/jobs'
import { useIsAuthenticated } from './use-supabase'
import { supabase } from '../supabase'

const STORAGE_BUCKET = 'audio-files'

/**
 * Query keys for consistent cache management
 */
export const jobQueryKeys = {
  all: ['jobs'] as const,
  list: () => [...jobQueryKeys.all, 'list'] as const,
  completed: () => [...jobQueryKeys.all, 'completed'] as const,
  totalCompletedCount: () => [...jobQueryKeys.all, 'totalCompletedCount'] as const,
  detail: (id: string) => [...jobQueryKeys.all, 'detail', id] as const,
  latestJob: () => [...jobQueryKeys.all, 'latestJob'] as const,
  publicShowcase: () => [...jobQueryKeys.all, 'publicShowcase'] as const,
}

/**
 * Hook to submit a new audio generation job
 * 
 * @returns Mutation for submitting jobs
 */
export function useSubmitJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateJobInput) => submitJob(input),
    onSuccess: (data) => {
      // Add the new job to the cache
      queryClient.setQueryData(jobQueryKeys.detail(data.job_id), data.job)

      // Invalidate the list to refresh it
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() })

      // Invalidate token balance since tokens were charged
      queryClient.invalidateQueries({ queryKey: ['userTokens'] })
      queryClient.invalidateQueries({ queryKey: ['hasTokens'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })

      console.log(`[useSubmitJob] Tokens charged: ${data.tokens_charged}`)
    },
    onError: (error) => {
      console.error('Job submission failed:', error)
    },
  })
}

/**
 * Hook to fetch a specific job by ID
 * 
 * @param jobId - The job ID to fetch
 * @param options - Query options
 * @returns Query result with job data
 */
export function useJob(
  jobId: string | null,
  options?: {
    enabled?: boolean
    refetchInterval?: number | false
  }
) {
  return useQuery({
    queryKey: jobQueryKeys.detail(jobId || ''),
    queryFn: () => getJob(jobId!),
    enabled: !!jobId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval,
    retry: 1,
  })
}

/**
 * Hook to fetch all jobs for the current user
 * Only fetches when user is authenticated
 * 
 * @param limit - Maximum number of jobs to fetch
 * @returns Query result with jobs array
 */
export function useUserJobs(limit = 50) {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: jobQueryKeys.list(),
    queryFn: () => getUserJobs(limit),
    staleTime: 1000 * 60, // 1 minute - data considered fresh
    gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
    retry: 1,
    enabled: isAuthenticated, // Only fetch when authenticated
  })
}

/**
 * Completed job with signed URL for audio playback
 */
export type CompletedJobWithUrl = Job & { 
  preview_path: string
  audioUrl: string | null 
}

/**
 * Hook to get only completed jobs with audio and signed URLs
 * 
 * NOTE: Due to storage limits, only the 7 most recent audio files are kept.
 * Jobs older than the 7th most recent will have their audio paths cleared.
 * 
 * @param limit - Maximum number of jobs to fetch
 * @returns Query result with completed jobs that have audio and signed URLs
 */
export function useCompletedJobs(limit = 50) {
  const isAuthenticated = useIsAuthenticated()

  const query = useQuery({
    queryKey: [...jobQueryKeys.completed(), 'withUrls'],
    queryFn: async (): Promise<CompletedJobWithUrl[]> => {
      const jobs = await getUserJobs(limit)
      
      // Filter to only completed jobs with preview paths
      const completedJobs = jobs.filter(
        (job): job is Job & { preview_path: string } =>
          job.status === 'completed' && job.preview_path !== null
      )

      // Generate signed URLs for each job
      const jobsWithUrls = await Promise.all(
        completedJobs.map(async (job) => {
          const { data } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(job.preview_path, 3600) // 1 hour expiry
          
          return {
            ...job,
            audioUrl: data?.signedUrl || null,
          }
        })
      )

      return jobsWithUrls
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: isAuthenticated,
  })

  return {
    ...query,
    completedCount: query.data?.length ?? 0,
  }
}

/**
 * Hook to get the total historical count of completed jobs
 * This includes all completed jobs, even those whose audio has been removed from storage
 * 
 * @returns Query result with total completed jobs count
 */
export function useTotalCompletedJobsCount() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: jobQueryKeys.totalCompletedCount(),
    queryFn: () => getTotalCompletedJobsCount(),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: isAuthenticated,
  })
}

/**
 * Hook to subscribe to real-time job updates
 * 
 * @param jobId - The job ID to subscribe to
 * @param enabled - Whether the subscription is enabled
 */
export function useJobSubscription(jobId: string | null, enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!jobId || !enabled) return

    const { unsubscribe } = subscribeToJob(jobId, (updatedJob: Job) => {
      // Update the cache with the new job data
      queryClient.setQueryData(jobQueryKeys.detail(jobId), updatedJob)

      // Also invalidate the list to keep it in sync
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() })
    })

    return () => {
      unsubscribe()
    }
  }, [jobId, enabled, queryClient])
}

/**
 * Hook to poll a job status until completion
 * 
 * This hook automatically polls the job status every 2 seconds
 * until the job is completed or failed.
 * 
 * @param jobId - The job ID to poll
 * @param enabled - Whether polling is enabled
 * @returns Query result with job data
 */
export function useJobPolling(jobId: string | null, enabled = true) {
  // First, fetch the job to check its status
  const jobQuery = useJob(jobId, { enabled })

  // Determine if we should continue polling based on job status
  const shouldPoll = enabled &&
    jobQuery.data?.status !== 'completed' &&
    jobQuery.data?.status !== 'failed'

  // Use a separate query with polling enabled only when needed
  const pollingQuery = useJob(jobId, {
    enabled: shouldPoll,
    refetchInterval: 2000,
  })

  // Also subscribe to real-time updates for instant feedback
  useJobSubscription(jobId, enabled)

  // Return the polling query if active, otherwise the regular query
  return shouldPoll ? pollingQuery : jobQuery
}

/**
 * Hook to get a signed URL for a job's audio file (private bucket)
 * Only fetches when job is completed and has a preview path
 * 
 * @param job - The job to get the audio URL for
 * @returns Signed URL for the audio file or null
 */
export function useJobAudioUrl(job: Job | null | undefined) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    // Reset URL when job changes or is not ready
    if (!job?.preview_path || job.status !== 'completed') {
      setAudioUrl(null)
      return
    }

    // Fetch signed URL
    let cancelled = false
    
    supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(job.preview_path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('[useJobAudioUrl] Error:', error.message)
          setAudioUrl(null)
        } else {
          setAudioUrl(data?.signedUrl || null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [job?.id, job?.preview_path, job?.status])

  return audioUrl
}


/**
 * Latest job with audio - the most recent completed job that has audio
 */
export interface LatestJob {
  id: string
  prompt: string
  previewPath: string
  storageUrl: string
  createdAt: string
}

/**
 * Hook to get the latest completed job with audio
 * Used to optionally link a job to a feedback report
 * 
 * @returns Query result with the latest job or null
 */
export function useLatestJob() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: jobQueryKeys.latestJob(),
    queryFn: async (): Promise<LatestJob | null> => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, prompt, preview_path, created_at')
        .eq('status', 'completed')
        .not('preview_path', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data || !data.preview_path) {
        return null
      }

      // Get signed URL for the audio file
      const { data: signedUrl } = await supabase
        .storage
        .from('audio-files')
        .createSignedUrl(data.preview_path, 3600) // 1 hour expiry

      return {
        id: data.id,
        prompt: data.prompt,
        previewPath: data.preview_path,
        storageUrl: signedUrl?.signedUrl || data.preview_path,
        createdAt: data.created_at,
      }
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: isAuthenticated,
  })
}

/**
 * Hook to fetch public showcase jobs for the landing page
 * These are community-donated audio generations that are publicly available
 * Does not require authentication
 * 
 * @param limit - Maximum number of jobs to fetch (default: 12)
 * @returns Query result with public showcase jobs
 */
export function usePublicShowcaseJobs(limit = 12) {
  return useQuery({
    queryKey: jobQueryKeys.publicShowcase(),
    queryFn: () => getPublicShowcaseJobs(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes - public data changes less frequently
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache longer
    retry: 2,
  })
}
