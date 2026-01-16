/**
 * API Client for Report Submissions
 * 
 * This module provides functions to submit feedback reports to the
 * Supabase Edge Function.
 */

import { supabase } from '../supabase'

/**
 * Feedback types supported by the system
 */
export type FeedbackType = 'bug' | 'feature' | 'general' | 'prompting'

/**
 * Input for submitting a report
 */
export interface SubmitReportInput {
  feedbackType: FeedbackType
  message: string
  email?: string
  jobId?: string
  jobStorageUrl?: string
}

/**
 * Response from report submission
 */
export interface SubmitReportResponse {
  success: boolean
  reportId?: string
  message: string
}

/**
 * Submit a feedback report to the Edge Function
 * 
 * @param input - Report submission parameters
 * @returns Promise with submission response
 * @throws Error if submission fails
 */
export async function submitReport(input: SubmitReportInput): Promise<SubmitReportResponse> {
  // Validate input before submission
  if (!input.message || input.message.trim().length === 0) {
    throw new Error('Message is required and cannot be empty')
  }
  
  if (input.message.length > 5000) {
    throw new Error('Message must be less than 5000 characters')
  }

  try {
    // Use Supabase's built-in functions.invoke()
    const { data, error } = await supabase.functions.invoke('submit-report', {
      body: input,
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(error.message || 'Failed to submit report')
    }

    if (!data || !('success' in data)) {
      throw new Error('Invalid response from server')
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to submit report')
    }

    return data as SubmitReportResponse
    
  } catch (error) {
    // Re-throw with cleaner error message
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to submit report. Please try again.')
  }
}
