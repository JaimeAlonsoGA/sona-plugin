/**
 * TypeScript Type Definitions for Audio Generation Jobs
 * 
 * These types match the database schema and Edge Functions API contracts
 */

import type { Tables } from './database.types'

export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed'
export type QualityLevel = 'low' | 'medium' | 'high'

/**
 * Job record from database - uses the generated database types
 */
export type Job = Tables<'jobs'>

/**
 * Completed job with required audio paths
 */
export interface CompletedJob extends Job {
  status: 'completed'
  preview_path: string
  completed_at: string
}

/**
 * Helper to check if a job is completed with audio
 */
export function isCompletedJob(job: Job): job is CompletedJob {
  return job.status === 'completed' && job.preview_path !== null
}

/**
 * Input for creating a new job
 */
export interface CreateJobInput {
  prompt: string
  duration?: number
  quality?: QualityLevel
  mode?: string
}

/**
 * Response from Edge Function generate endpoint
 */
export interface GenerateJobResponse {
  success: true
  job_id: string
  status: JobStatus
  message: string
  job: {
    id: string
    prompt: string
    duration: number
    quality: QualityLevel
    mode: string
    status: JobStatus
    created_at: string
  }
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  error: string
  message: string
  details?: string | string[]
}
