/**
 * Type definitions for the audio worker service
 */

export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export type QualityLevel = 'low' | 'medium' | 'high';

export interface Job {
  id: string;
  user_id: string;
  prompt: string;
  duration: number;
  quality: QualityLevel;
  mode: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  result_url?: string | null;
  wav_url?: string | null;
  mp3_url?: string | null;
}

export interface WorkerConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  stableAudioApiKey: string;
  stableAudioApiUrl: string;
  maxConcurrentJobs: number;
  pollIntervalMs: number;
  jobTimeoutMs: number;
  storageBucket: string;
  storagePathPrefix: string;
  maxRetries: number;
  retryDelayMs: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface StableAudioRequest {
  prompt: string;
  duration: number;
  quality?: QualityLevel;
}

export interface StableAudioResponse {
  audio: ArrayBuffer;
  format: string;
}

export interface ProcessingResult {
  success: boolean;
  wavUrl?: string;
  mp3Url?: string;
  error?: string;
}
