/**
 * React Query Hook for Report Submission
 * 
 * This module provides hooks for submitting feedback reports
 * and getting the latest completed job for reference.
 */

import { useMutation } from '@tanstack/react-query'
import { submitReport, type SubmitReportInput } from '../api/reports'
/**
 * Query keys for report-related queries
 */
export const reportQueryKeys = {
  all: ['reports'] as const,
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