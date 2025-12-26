/**
 * React Query Hooks for Job Management
 * 
 * This module provides hooks for submitting jobs, fetching job status,
 * and subscribing to real-time job updates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { submitJob, getJob, getUserJobs, subscribeToJob } from '../api/jobs'
import type { CreateJobInput, Job } from '../../types/jobs'

/**
 * Query keys for consistent cache management
 */
export const jobQueryKeys = {
  all: ['jobs'] as const,
  list: () => [...jobQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...jobQueryKeys.all, 'detail', id] as const,
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
 * 
 * @param limit - Maximum number of jobs to fetch
 * @returns Query result with jobs array
 */
export function useUserJobs(limit = 50) {
  return useQuery({
    queryKey: jobQueryKeys.list(),
    queryFn: () => getUserJobs(limit),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
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
