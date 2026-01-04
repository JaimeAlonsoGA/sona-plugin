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
 * Naming convention config sent with job
 */
export interface NamingConventionConfig {
  parameters: Array<{
    type: string
    value?: string
    format?: string
  }>
  separator: string
}

/**
 * Musical key type
 */
export type MusicalKey = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' 
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

/**
 * Scale type
 */
export type Scale = 'major' | 'minor'

/**
 * Input for creating a new job
 */
export interface CreateJobInput {
  prompt: string
  duration?: number
  quality?: QualityLevel
  mode?: 'designer' | 'producer'
  /** Naming convention configuration */
  namingConvention?: NamingConventionConfig
  /** Musical key (optional) */
  key?: MusicalKey
  /** Scale type (optional, used with key) */
  scale?: Scale
  /** BPM for producer mode */
  bpm?: number
  /** Time signature as string (e.g., "4/4") */
  timeSignature?: string
  /** Number of bars for producer mode */
  bars?: number
}

/**
 * Response from Edge Function generate endpoint
 */
export interface GenerateJobResponse {
  success: true
  job_id: string
  status: JobStatus
  message: string
  /** Number of tokens charged for this generation */
  tokens_charged: number
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
 * Error response from API - includes token-specific errors
 */
export interface ApiErrorResponse {
  error: string
  message: string
  details?: string | string[]
  /** Error code for specific handling */
  code?: 'INSUFFICIENT_TOKENS' | string
  /** Tokens required (for INSUFFICIENT_TOKENS error) */
  required?: number
}
