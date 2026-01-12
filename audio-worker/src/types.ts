/**
 * Type definitions for the audio worker service
 */

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type QualityLevel = 'low' | 'medium' | 'high';

/**
 * Quality to Steps mapping for API calls
 * - draft: Fast generation, lower quality
 * - standard: Balanced quality/speed
 * - high: Best quality, slower generation
 */
export type QualitySteps = 'draft' | 'standard' | 'high';

/**
 * Duration presets for Designer mode (Stable Audio Open)
 * - short: 1-10 seconds
 * - medium: 11-30 seconds  
 * - long: 31-47 seconds (max for Stable Audio Open)
 */
export type DurationPreset = 'short' | 'medium' | 'long';

/**
 * Map quality level to API steps
 */
export const QUALITY_TO_STEPS: Record<QualityLevel, number> = {
  low: 4,      // draft - fast
  medium: 6,  // standard
  high: 8,    // high quality
};

/**
 * Duration presets in seconds for Designer mode
 */
export const DURATION_PRESETS: Record<DurationPreset, number> = {
  short: 10,   // Up to 10s
  medium: 22,  // Medium length
  long: 45,    // Near max (47s for Stable Audio Open)
};

/**
 * Max duration for each API
 */
export const API_MAX_DURATION = {
  stableAudio2: 180,    // Stable Audio 2.5 max
  stableAudioOpen: 30,  // TangoFlux max (was 47 for Stable Audio Open)
} as const;

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
  /** User's naming convention configuration */
  naming_convention?: NamingConventionConfig | null;
  /** Musical key configuration (JSON string: { key: string, scale: string }) */
  musical_key?: string | null;
  /** Producer mode configuration (JSON string: { bpm, timeSignature, bars }) */
  producer_config?: string | null;
  /** User email for Creator mode naming convention */
  user_email?: string | null;
  /** Skip GPT naming convention generation for faster processing */
  skip_naming?: boolean | null;
}

/**
 * Parsed musical key from job
 */
export interface MusicalKey {
  key: string;  // e.g., 'C', 'C#', 'D', etc.
  scale: 'major' | 'minor';
}

/**
 * Parsed producer config from job
 */
export type ProducerType = 'song' | 'loop';

export interface ProducerConfig {
  type: ProducerType;
  bpm: number;
  timeSignature: string;  // e.g., '4/4'
  bars: number;
  duration?: number;
}

/**
 * Naming convention configuration from user settings
 */
export interface NamingConventionConfig {
  parameters: Array<{
    type: string;
    value?: string;
    format?: string;
  }>;
  separator: string;
}

export interface WorkerConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  stableAudioApiKey: string;
  stableAudioApiUrl: string;
  /** Replicate API token for Stable Audio Open model */
  replicateApiToken: string;
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
