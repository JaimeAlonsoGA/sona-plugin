/**
 * Configuration loader for the audio worker service
 */

import dotenv from 'dotenv';
import { WorkerConfig } from './types.js';

// Load environment variables
dotenv.config();

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): WorkerConfig {
  const config: WorkerConfig = {
    supabaseUrl: getEnv('SUPABASE_URL'),
    supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    stableAudioApiKey: getEnv('STABLE_AUDIO_API_KEY'),
    stableAudioApiUrl: getEnv('STABLE_AUDIO_API_URL', 'https://api.stability.ai/v2beta/stable-audio'),
    maxConcurrentJobs: parseInt(getEnv('MAX_CONCURRENT_JOBS', '2'), 10),
    pollIntervalMs: parseInt(getEnv('POLL_INTERVAL_MS', '5000'), 10),
    jobTimeoutMs: parseInt(getEnv('JOB_TIMEOUT_MS', '300000'), 10),
    storageBucket: getEnv('SUPABASE_STORAGE_BUCKET', 'audio-files'),
    storagePathPrefix: getEnv('STORAGE_PATH_PREFIX', 'generated'),
    maxRetries: parseInt(getEnv('MAX_RETRIES', '3'), 10),
    retryDelayMs: parseInt(getEnv('RETRY_DELAY_MS', '2000'), 10),
    logLevel: (getEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
  };

  // Validate configuration
  validateConfig(config);

  return config;
}

/**
 * Get environment variable with optional default value
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Validate configuration values
 */
function validateConfig(config: WorkerConfig): void {
  const errors: string[] = [];

  // Validate URLs
  if (!isValidUrl(config.supabaseUrl)) {
    errors.push('Invalid SUPABASE_URL');
  }

  if (!isValidUrl(config.stableAudioApiUrl)) {
    errors.push('Invalid STABLE_AUDIO_API_URL');
  }

  // Validate API keys
  if (config.supabaseServiceRoleKey.length < 20) {
    errors.push('Invalid SUPABASE_SERVICE_ROLE_KEY');
  }

  if (config.stableAudioApiKey.length < 20) {
    errors.push('Invalid STABLE_AUDIO_API_KEY');
  }

  // Validate numeric values
  if (config.maxConcurrentJobs < 1 || config.maxConcurrentJobs > 10) {
    errors.push('MAX_CONCURRENT_JOBS must be between 1 and 10');
  }

  if (config.pollIntervalMs < 1000) {
    errors.push('POLL_INTERVAL_MS must be at least 1000ms');
  }

  if (config.jobTimeoutMs < 10000) {
    errors.push('JOB_TIMEOUT_MS must be at least 10000ms');
  }

  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push('MAX_RETRIES must be between 0 and 10');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
