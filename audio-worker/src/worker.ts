/**
 * Audio Worker - Main orchestration logic
 */

import pLimit from 'p-limit';
import { WorkerConfig, Job, ProcessingResult, DurationPreset, DURATION_PRESETS, API_MAX_DURATION } from './types.js';
import { logger } from './logger.js';
import { SupabaseService } from './supabase.js';
import { createAudioClient } from './audio-clients/index.js';
import { TestAudioClient } from './test-audio.js';
import { AudioProcessor } from './audio-processor.js';
import { PromptEnhancerService } from './prompt-enhancer.js';
import { initializeUCSRag } from './ucs-rag.js';

export class AudioWorker {
  private config: WorkerConfig;
  private supabase: SupabaseService;
  private testAudio: TestAudioClient;
  private audioProcessor: AudioProcessor;
  private promptEnhancer: PromptEnhancerService;
  private isRunning: boolean = false;
  private limit: ReturnType<typeof pLimit>;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.supabase = new SupabaseService(config);
    this.testAudio = new TestAudioClient();
    this.audioProcessor = new AudioProcessor();
    this.promptEnhancer = new PromptEnhancerService(config);
    this.limit = pLimit(config.maxConcurrentJobs);

    logger.setLevel(config.logLevel);

    if (config.useTestAudio) {
      logger.info('🧪 TEST MODE ENABLED: Using local test audio file instead of Stable Audio API');
    }
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    logger.info('Starting Audio Worker...', {
      maxConcurrentJobs: this.config.maxConcurrentJobs,
      pollIntervalMs: this.config.pollIntervalMs,
    });

    // Initialize UCS RAG service (loads cached embeddings)
    try {
      const ucsRag = await initializeUCSRag(this.config.openAiApiKey);
      const stats = ucsRag.getStats();
      if (stats.ready) {
        logger.info(`UCS RAG initialized: ${stats.entryCount} entries, ${stats.dimensions} dimensions`);
      } else {
        logger.warn('UCS RAG not ready - run "npm run generate-ucs-embeddings" to generate cache');
      }
    } catch (error) {
      logger.warn('UCS RAG initialization failed, will use fallback categories:', error);
    }

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
      mode: job.mode,
      hasNamingConvention: !!job.naming_convention,
      hasMusicalKey: !!job.musical_key,
      hasProducerConfig: !!job.producer_config,
      testMode: this.config.useTestAudio,
    });

    try {
      // Parse naming_convention if it's a string (from JSONB it should be object)
      let namingConvention = job.naming_convention;
      if (typeof namingConvention === 'string') {
        try {
          namingConvention = JSON.parse(namingConvention);
          logger.debug('Parsed naming_convention from string');
        } catch (e) {
          logger.warn('Failed to parse naming_convention string', { error: e });
          namingConvention = null;
        }
      }

      // Parse musical_key if provided
      let musicalKey = null;
      if (job.musical_key) {
        try {
          musicalKey = typeof job.musical_key === 'string'
            ? JSON.parse(job.musical_key)
            : job.musical_key;
          logger.debug('Parsed musical_key', { musicalKey });
        } catch (e) {
          logger.warn('Failed to parse musical_key', { error: e });
        }
      }

      // Parse producer_config if provided
      let producerConfig = null;
      if (job.producer_config) {
        try {
          producerConfig = typeof job.producer_config === 'string'
            ? JSON.parse(job.producer_config)
            : job.producer_config;
          logger.info('Parsed producer_config from job', {
            raw: job.producer_config,
            parsed: producerConfig,
            bpm: producerConfig?.bpm,
            timeSignature: producerConfig?.timeSignature,
            bars: producerConfig?.bars,
          });
        } catch (e) {
          logger.warn('Failed to parse producer_config', { error: e });
        }
      } else {
        logger.debug('No producer_config in job', { mode: job.mode });
      }

      // Determine duration preset from actual duration
      const durationPreset = this.getDurationPreset(job.duration);

      // Calculate effective duration based on mode and API limits
      const isDesigner = job.mode === 'designer';
      const maxDuration = isDesigner ? API_MAX_DURATION.stableAudioOpen : API_MAX_DURATION.stableAudio2;
      const effectiveDuration = Math.min(job.duration, maxDuration);

      logger.info(`Duration calculation for job ${job.id}`, {
        requestedDuration: job.duration,
        effectiveDuration,
        maxDuration,
        durationPreset,
        mode: job.mode,
        isDesigner,
      });

      // Step 1: Generate prompt data (with or without naming convention)
      // The prompt enhancement (if any) was already done in the Edge Function.
      // Here we only generate naming metadata or skip it entirely.
      const skipNaming = job.skip_naming === true;
      
      const enhancedData = skipNaming
        ? this.promptEnhancer.createSimpleResult(job.prompt, {
            duration: effectiveDuration,
            quality: job.quality,
            mode: job.mode,
            userEmail: job.user_email,
          })
        : await this.promptEnhancer.generateNaming(job.prompt, {
            duration: effectiveDuration,
            quality: job.quality,
            mode: job.mode,
            namingConvention: namingConvention,
            musicalKey: musicalKey,
            producerConfig: producerConfig,
            durationPreset: durationPreset,
            userEmail: job.user_email,
          });

      logger.info(`Prompt processed for job ${job.id}`, {
        filename: enhancedData.filename,
        category: enhancedData.metadata.category,
        musicalKey: musicalKey ? `${musicalKey.key} ${musicalKey.scale}` : 'none',
        enhancedPromptPreview: enhancedData.enhancedPrompt.substring(0, 100) + '...',
        skipNaming,
      });

      // Step 2: Generate audio using the enhanced prompt
      // Use factory pattern to select the appropriate audio client based on mode
      const audioClient = this.config.useTestAudio
        ? this.testAudio
        : createAudioClient(job.mode, this.config);

      const audioResponse = await audioClient.generateAudio({
        prompt: enhancedData.enhancedPrompt, // Use enhanced prompt!
        duration: effectiveDuration,          // Use clamped duration for API
        quality: job.quality,
      });

      if (!audioResponse) {
        throw new Error(
          this.config.useTestAudio
            ? 'Failed to load test audio file'
            : `Failed to generate audio from ${audioClient.name}`
        );
      }

      // Process audio (WAV only)
      const audioFiles = await this.audioProcessor.processAudio(
        audioResponse.audio,
        audioResponse.format
      );

      if (!audioFiles) {
        throw new Error('Failed to process audio files');
      }

      // Validate WAV audio
      if (!this.audioProcessor.isValidAudio(audioFiles.wav)) {
        throw new Error('Invalid WAV audio file');
      }

      // Upload WAV to storage using UCS filename
      const result = await this.uploadAudioFile(audioFiles.wav, enhancedData.filename);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload audio files');
      }

      // Update job with results (paths, enhanced prompt, and filename)
      const updated = await this.supabase.updateJobResult(
        job.id,
        result.masterPath!,
        result.previewPath!,
        enhancedData.enhancedPrompt,
        enhancedData.filename
      );

      if (!updated) {
        throw new Error('Failed to update job with result paths');
      }

      const duration = Date.now() - startTime;
      logger.info(`Job ${job.id} completed successfully in ${duration}ms`, {
        masterPath: result.masterPath,
        previewPath: result.previewPath,
        filename: enhancedData.filename,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Job ${job.id} failed:`, errorMessage);

      // Update job status to failed
      await this.supabase.updateJobStatus(job.id, 'failed', errorMessage);
    }
  }

  /**
   * Upload WAV file to storage using UCS filename
   * Both master_path and preview_path will point to the same WAV file
   * until MP3 conversion is implemented
   */
  private async uploadAudioFile(
    wavBuffer: Buffer,
    filename: string
  ): Promise<ProcessingResult> {
    try {
      const timestamp = Date.now();
      // Sanitize filename for storage (remove special chars, keep alphanumeric, dash, underscore)
      const sanitizedFilename = filename
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_') // collapse multiple underscores
        .substring(0, 100); // limit length

      const wavPath = `${this.config.storagePathPrefix}/${sanitizedFilename}_${timestamp}.wav`;

      // Upload WAV file
      logger.info('Uploading WAV file...', { filename: sanitizedFilename });
      const storagePath = await this.supabase.uploadAudio(wavPath, wavBuffer, 'audio/wav');

      if (!storagePath) {
        return {
          success: false,
          error: 'Failed to upload WAV file',
        };
      }

      // Use same path for both master and preview until MP3 is implemented
      return {
        success: true,
        masterPath: storagePath,
        previewPath: storagePath,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error uploading audio file:', errorMessage);
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

  /**
   * Convert duration in seconds to preset category
   */
  private getDurationPreset(duration: number): DurationPreset {
    if (duration <= DURATION_PRESETS.short) return 'short';
    if (duration <= DURATION_PRESETS.medium) return 'medium';
    return 'long';
  }
}
