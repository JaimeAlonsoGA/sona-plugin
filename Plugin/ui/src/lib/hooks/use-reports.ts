/**
 * React Query Hook for Report Submission
 * 
 * This module provides hooks for submitting feedback reports
 * and getting the latest completed job for reference.
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { submitReport, type SubmitReportInput } from '../api/reports'
import { useIsAuthenticated } from './use-supabase'
import { supabase } from '../supabase'

/**
 * Query keys for report-related queries
 */
export const reportQueryKeys = {
  all: ['reports'] as const,
  latestJob: () => [...reportQueryKeys.all, 'latestJob'] as const,
}

/**
 * Hook to submit a feedback report
 * 
 * @returns Mutation for submitting reports
 */
export function useSubmitReport() {
  return useMutation({
    mutationFn: (input: SubmitReportInput) => submitReport(input),
    onSuccess: (data) => {
      console.log(`[useSubmitReport] Report submitted: ${data.reportId}`)
    },
    onError: (error) => {
      console.error('Report submission failed:', error)
    },
  })
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
    queryKey: reportQueryKeys.latestJob(),
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
        .from('audio')
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
