/**
 * Stable Audio API client with retry logic
 */

import { WorkerConfig, StableAudioRequest, StableAudioResponse } from './types.js';
import { logger } from './logger.js';

export class StableAudioClient {
  private config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;
  }

  /**
   * Generate audio using Stable Audio API with retry logic
   */
  async generateAudio(request: StableAudioRequest): Promise<StableAudioResponse | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (attempt > 0) {
        logger.info(`Retry attempt ${attempt}/${this.config.maxRetries}`);
        await this.sleep(this.config.retryDelayMs * attempt); // Exponential backoff
      }

      try {
        logger.info('Calling Stable Audio API:', {
          duration: request.duration,
          quality: request.quality,
          promptLength: request.prompt.length,
        });

        const response = await this.callStableAudioAPI(request);
        
        if (response) {
          logger.info('Audio generated successfully');
          return response;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    logger.error('All retry attempts exhausted', lastError);
    return null;
  }

  /**
   * Call the Stable Audio API
   * 
   * This implementation follows the Stable Audio API specification.
   * Update the endpoint URL and request format based on your specific
   * API version and requirements from the Stable Audio documentation.
   */
  private async callStableAudioAPI(request: StableAudioRequest): Promise<StableAudioResponse | null> {
    try {
      // Build the request payload based on Stable Audio API specs
      const payload = {
        prompt: request.prompt,
        duration: request.duration,
        ...(request.quality && { quality: request.quality }),
      };

      const response = await fetch(this.config.stableAudioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.stableAudioApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/wav',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      // Check content type to determine audio format
      const contentType = response.headers.get('content-type') || '';
      let format = 'wav';
      
      if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) {
        format = 'mp3';
      } else if (contentType.includes('audio/wav') || contentType.includes('audio/wave')) {
        format = 'wav';
      }

      const audioBuffer = await response.arrayBuffer();

      if (audioBuffer.byteLength === 0) {
        throw new Error('Received empty audio buffer from API');
      }

      logger.debug(`Received audio: ${audioBuffer.byteLength} bytes, format: ${format}`);

      return {
        audio: audioBuffer,
        format,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unknown error: ${String(error)}`);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
