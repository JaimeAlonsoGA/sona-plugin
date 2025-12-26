/**
 * TypeScript Type Definitions for Audio Generation Jobs
 * 
 * These types match the database schema and Edge Functions API contracts
 */

export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed'
export type QualityLevel = 'low' | 'medium' | 'high'

/**
 * Job record from database
 */
export interface Job {
  id: string
  user_id: string
  prompt: string
  duration: number
  quality: QualityLevel
  mode: string
  status: JobStatus
  created_at: string
  updated_at: string
  completed_at?: string | null
  error_message?: string | null
  result_url?: string | null
  wav_url?: string | null
  mp3_url?: string | null
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
