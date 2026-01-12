/**
 * Supabase client for database and storage operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WorkerConfig, Job, JobStatus } from './types.js';
import { logger } from './logger.js';

export class SupabaseService {
  private client: SupabaseClient;
  private config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.client = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          // Increase timeout for large file uploads (2 minutes)
          fetch: (url, options = {}) => {
            return fetch(url, {
              ...options,
              signal: AbortSignal.timeout(120000), // 2 minute timeout
            });
          },
        },
      }
    );
  }

  /**
   * Poll for the next available job
   * Atomically updates status to 'processing' to lock the job
   */
  async pollNextJob(): Promise<Job | null> {
    try {
      // Fetch the oldest queued or pending job
      const { data: jobs, error: fetchError } = await this.client
        .from('jobs')
        .select('*')
        .in('status', ['queued'])
        .order('created_at', { ascending: true })
        .limit(1);

      if (fetchError) {
        logger.error('Error fetching jobs:', fetchError);
        return null;
      }

      if (!jobs || jobs.length === 0) {
        return null;
      }

      const job = jobs[0] as Job;

      // Attempt to lock the job by updating status to 'processing'
      const { data: updatedJob, error: updateError } = await this.client
        .from('jobs')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id)
        .eq('status', job.status) // Only update if status hasn't changed
        .select()
        .single();

      if (updateError) {
        logger.debug('Job already locked or error:', updateError.message);
        return null;
      }

      if (!updatedJob) {
        // Job was already taken by another worker
        logger.debug('Job already taken:', job.id);
        return null;
      }

      logger.info('Locked job:', job.id);
      return updatedJob as Job;
    } catch (error) {
      logger.error('Error polling for job:', error);
      return null;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const updateData: Partial<Job> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await this.client
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        logger.error('Error updating job status:', error);
        return false;
      }

      logger.info(`Job ${jobId} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error('Error updating job status:', error);
      return false;
    }
  }

  /**
   * Update job with result URLs
   */
  async updateJobResult(
    jobId: string,
    masterPath: string,
    previewPath: string,
    enhancedPrompt?: string,
    filename?: string
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {
        master_path: masterPath,
        preview_path: previewPath,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add enhanced prompt and filename if provided
      if (enhancedPrompt) {
        updateData.enhanced_prompt = enhancedPrompt;
      }
      if (filename) {
        updateData.filename = filename;
      }

      const { error } = await this.client
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        logger.error('Error updating job result:', error);
        return false;
      }

      logger.info(`Job ${jobId} completed with master and preview paths`, {
        filename: filename || 'not provided',
      });
      return true;
    } catch (error) {
      logger.error('Error updating job result:', error);
      return false;
    }
  }

  /**
   * Upload audio file to Supabase Storage with retry logic
   * @returns The storage path of the uploaded file (not the full URL)
   */
  async uploadAudio(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string | null> {
    // TODO: Set maxRetries back to 3 for production
    const maxRetries = 1; // Disabled retries for testing to avoid extra API costs
    const retryDelayMs = 2000;
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

    logger.debug(`Preparing to upload file: ${filePath} (${fileSizeMB} MB)`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Upload attempt ${attempt}/${maxRetries} for ${filePath}`);

        const { data, error } = await this.client.storage
          .from(this.config.storageBucket)
          .upload(filePath, fileBuffer, {
            contentType,
            upsert: true, // Allow overwrite on retry
          });

        if (error) {
          // Log detailed error information
          logger.error(`Upload error (attempt ${attempt}/${maxRetries}):`, {
            message: error.message,
            name: error.name,
            filePath,
            fileSizeMB,
            bucket: this.config.storageBucket,
          });

          // If this is the last attempt, return null
          if (attempt === maxRetries) {
            return null;
          }

          // Wait before retry
          await this.sleep(retryDelayMs * attempt);
          continue;
        }

        // Return the storage path (not the full URL)
        logger.info('File uploaded successfully:', data.path);
        return data.path;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        logger.error(`Upload exception (attempt ${attempt}/${maxRetries}):`, {
          message: errorMessage,
          filePath,
          fileSizeMB,
          bucket: this.config.storageBucket,
        });

        // If this is the last attempt, return null
        if (attempt === maxRetries) {
          return null;
        }

        // Wait before retry
        await this.sleep(retryDelayMs * attempt);
      }
    }

    return null;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if storage bucket exists, create if not
   */
  async ensureStorageBucket(): Promise<boolean> {
    try {
      const { data: buckets, error: listError } = await this.client.storage.listBuckets();

      if (listError) {
        logger.error('Error listing buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some(b => b.name === this.config.storageBucket);

      if (!bucketExists) {
        logger.info(`Creating storage bucket: ${this.config.storageBucket}`);
        const { error: createError } = await this.client.storage.createBucket(
          this.config.storageBucket,
          {
            public: true,
            fileSizeLimit: 52428800, // 50MB
          }
        );

        if (createError) {
          logger.error('Error creating bucket:', createError);
          return false;
        }
      }

      logger.info('Storage bucket ready:', this.config.storageBucket);
      return true;
    } catch (error) {
      logger.error('Error ensuring storage bucket:', error);
      return false;
    }
  }
}
