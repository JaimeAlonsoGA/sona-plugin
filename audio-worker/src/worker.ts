/**
 * Audio Worker - Main orchestration logic
 */

import pLimit from 'p-limit';
import { WorkerConfig, Job, ProcessingResult } from './types.js';
import { logger } from './logger.js';
import { SupabaseService } from './supabase.js';
import { StableAudioClient } from './stable-audio.js';
import { AudioProcessor } from './audio-processor.js';

export class AudioWorker {
  private config: WorkerConfig;
  private supabase: SupabaseService;
  private stableAudio: StableAudioClient;
  private audioProcessor: AudioProcessor;
  private isRunning: boolean = false;
  private limit: ReturnType<typeof pLimit>;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.supabase = new SupabaseService(config);
    this.stableAudio = new StableAudioClient(config);
    this.audioProcessor = new AudioProcessor();
    this.limit = pLimit(config.maxConcurrentJobs);
    
    logger.setLevel(config.logLevel);
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    logger.info('Starting Audio Worker...', {
      maxConcurrentJobs: this.config.maxConcurrentJobs,
      pollIntervalMs: this.config.pollIntervalMs,
    });

    // Ensure storage bucket exists
    const bucketReady = await this.supabase.ensureStorageBucket();
    if (!bucketReady) {
      throw new Error('Failed to ensure storage bucket exists');
    }

    this.isRunning = true;

    // Start polling loop
    this.pollLoop();

    logger.info('Worker started successfully');
  }

  /**
   * Stop the worker
   */
  stop(): void {
    logger.info('Stopping worker...');
    this.isRunning = false;
  }

  /**
   * Main polling loop
   */
  private async pollLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.pollAndProcessJobs();
      } catch (error) {
        logger.error('Error in poll loop:', error);
      }

      // Wait before next poll
      await this.sleep(this.config.pollIntervalMs);
    }

    logger.info('Worker stopped');
  }

  /**
   * Poll for jobs and process them
   */
  private async pollAndProcessJobs(): Promise<void> {
    try {
      // Poll for next available job
      const job = await this.supabase.pollNextJob();

      if (!job) {
        // No jobs available
        return;
      }

      // Process job with concurrency limit
      this.limit(() => this.processJob(job)).catch(error => {
        logger.error('Unhandled error processing job:', error);
      });
    } catch (error) {
      logger.error('Error polling for jobs:', error);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    const startTime = Date.now();
    logger.info(`Processing job ${job.id}`, {
      prompt: job.prompt.substring(0, 50) + (job.prompt.length > 50 ? '...' : ''),
      duration: job.duration,
      quality: job.quality,
    });

    try {
      // Generate audio using Stable Audio API
      const audioResponse = await this.stableAudio.generateAudio({
        prompt: job.prompt,
        duration: job.duration,
        quality: job.quality,
      });

      if (!audioResponse) {
        throw new Error('Failed to generate audio from Stable Audio API');
      }

      // Process audio (ensure WAV and create MP3)
      const audioFiles = await this.audioProcessor.processAudio(
        audioResponse.audio,
        audioResponse.format
      );

      if (!audioFiles) {
        throw new Error('Failed to process audio files');
      }

      // Validate audio
      if (!this.audioProcessor.isValidAudio(audioFiles.wav)) {
        throw new Error('Invalid WAV audio file');
      }

      if (!this.audioProcessor.isValidAudio(audioFiles.mp3)) {
        throw new Error('Invalid MP3 audio file');
      }

      // Upload both WAV and MP3 to storage
      const result = await this.uploadAudioFiles(job.id, audioFiles.wav, audioFiles.mp3);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload audio files');
      }

      // Update job with results
      const updated = await this.supabase.updateJobResult(
        job.id,
        result.wavUrl!,
        result.mp3Url!
      );

      if (!updated) {
        throw new Error('Failed to update job with result URLs');
      }

      const duration = Date.now() - startTime;
      logger.info(`Job ${job.id} completed successfully in ${duration}ms`, {
        wavUrl: result.wavUrl,
        mp3Url: result.mp3Url,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Job ${job.id} failed:`, errorMessage);

      // Update job status to failed
      await this.supabase.updateJobStatus(job.id, 'failed', errorMessage);
    }
  }

  /**
   * Upload WAV and MP3 files to storage
   */
  private async uploadAudioFiles(
    jobId: string,
    wavBuffer: Buffer,
    mp3Buffer: Buffer
  ): Promise<ProcessingResult> {
    try {
      const timestamp = Date.now();
      const wavPath = `${this.config.storagePathPrefix}/${jobId}_${timestamp}.wav`;
      const mp3Path = `${this.config.storagePathPrefix}/${jobId}_${timestamp}.mp3`;

      // Upload WAV (master file)
      logger.info('Uploading WAV file...');
      const wavUrl = await this.supabase.uploadAudio(wavPath, wavBuffer, 'audio/wav');

      if (!wavUrl) {
        return {
          success: false,
          error: 'Failed to upload WAV file',
        };
      }

      // Upload MP3 (preview file)
      logger.info('Uploading MP3 file...');
      const mp3Url = await this.supabase.uploadAudio(mp3Path, mp3Buffer, 'audio/mpeg');

      if (!mp3Url) {
        return {
          success: false,
          error: 'Failed to upload MP3 file',
        };
      }

      return {
        success: true,
        wavUrl,
        mp3Url,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error uploading audio files:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
