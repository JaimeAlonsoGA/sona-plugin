/**
 * Type definitions for the audio worker service
 */

export type JobStatus =  'queued' | 'processing' | 'completed' | 'failed';
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
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  /** Path to master WAV file in storage */
  master_path?: string | null;
  /** Path to preview MP3 file in storage */
  preview_path?: string | null;
  /** Enhanced/refined prompt used for generation */
  enhanced_prompt?: string | null;
  /** UCS-compliant filename for the generated audio */
  filename?: string | null;
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
  openAiApiKey: string;
  /** When true, uses test.mp3 instead of calling Stable Audio API */
  useTestAudio: boolean;
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
  /** Path to master WAV file in storage */
  masterPath?: string;
  /** Path to preview MP3 file in storage */
  previewPath?: string;
  /** Enhanced prompt used for generation */
  enhancedPrompt?: string;
  /** UCS-compliant filename */
  filename?: string;
  error?: string;
}
