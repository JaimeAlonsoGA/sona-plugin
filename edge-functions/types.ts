/**
 * TypeScript Type Definitions for Edge Functions
 * 
 * These types define the database schema and API contracts
 * for the Supabase Edge Functions.
 */

/**
 * Database Types
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type QualityLevel = 'low' | 'medium' | 'high'

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
}

export interface CreateJobInput {
  prompt: string
  duration?: number
  quality?: QualityLevel
  mode?: string
}

/**
 * API Response Types
 */

export interface GenerateSuccessResponse {
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

export interface ErrorResponse {
  error: string
  message: string
  details?: string | string[]
}

/**
 * Database Schema for reference
 */
export const JobsTableSchema = `
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 10,
  quality TEXT NOT NULL DEFAULT 'medium',
  mode TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result_url TEXT,
  
  CONSTRAINT valid_duration CHECK (duration >= 1 AND duration <= 60),
  CONSTRAINT valid_quality CHECK (quality IN ('low', 'medium', 'high')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);
`
