/**
 * Stable Audio 2.5 Client (Producer Mode)
 * 
 * Uses the Stable Audio 2.5 API from Stability AI
 * Endpoint: POST /v2beta/audio/stable-audio-2/text-to-audio
 * Documentation: https://platform.stability.ai/docs/api-reference#tag/Stable-Audio-2
 * 
 * Parameters:
 * - duration: Variable, 1-180 seconds
 * - steps: Based on quality (draft=50, standard=100, high=150)
 * - Future: audio input support
 */

import { BaseAudioClient, AudioClientRequest, AudioClientResponse } from './base.js';
import { WorkerConfig, QUALITY_TO_STEPS, API_MAX_DURATION } from '../types.js';
import { logger } from '../logger.js';

export class StableAudio2Client extends BaseAudioClient {
    readonly name = 'stable-audio-2.5';

    constructor(config: WorkerConfig) {
        super(config);
    }

    /**
     * Generate audio using Stable Audio 2.5 API with retry logic
     */
    async generateAudio(request: AudioClientRequest): Promise<AudioClientResponse | null> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            if (attempt > 0) {
                logger.info(`[${this.name}] Retry attempt ${attempt}/${this.config.maxRetries}`);
                await this.sleep(this.config.retryDelayMs * attempt); // Exponential backoff
            }

            try {
                // Map quality to steps
                const steps = request.steps ?? QUALITY_TO_STEPS[request.quality ?? 'medium'];
                
                // Clamp duration to API limits
                const duration = Math.min(
                    Math.max(1, request.duration),
                    API_MAX_DURATION.stableAudio2
                );

                logger.info(`[${this.name}] Calling API:`, {
                    duration,
                    steps,
                    quality: request.quality,
                    promptLength: request.prompt.length,
                    hasAudioInput: !!request.audioInput,
                });

                const response = await this.callAPI(request.prompt, duration, steps, request.audioInput);

                if (response) {
                    logger.info(`[${this.name}] Audio generated successfully`);
                    return response;
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger.warn(`[${this.name}] Attempt ${attempt + 1} failed:`, lastError.message);
            }
        }

        logger.error(`[${this.name}] All retry attempts exhausted`, lastError);
        return null;
    }

    /**
     * Call the Stable Audio 2.5 API
     * 
     * @param prompt - Text prompt for generation
     * @param duration - Duration in seconds (1-180)
     * @param steps - Number of inference steps
     * @param audioInput - Optional audio input for audio-to-audio (future feature)
     */
    private async callAPI(
        prompt: string,
        duration: number,
        steps: number,
        audioInput?: ArrayBuffer | null
    ): Promise<AudioClientResponse | null> {
        try {
            // Build multipart form data
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('duration', String(duration));
            formData.append('steps', String(steps));
            formData.append('output_format', 'wav');
            formData.append('model', 'stable-audio-2.5');
            formData.append('cfg_scale', 2);

            // Future: Add audio input support when API supports it
            if (audioInput) {
                logger.debug(`[${this.name}] Audio input provided but not yet supported by API`);
                // When supported:
                // const audioBlob = new Blob([audioInput], { type: 'audio/wav' });
                // formData.append('audio', audioBlob, 'input.wav');
            }

            // Add empty file field as required by the API
            formData.append('none', '');

            const response = await fetch(this.config.stableAudioApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.stableAudioApiKey}`,
                    'Accept': 'audio/*',
                },
                body: formData,
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

            logger.debug(`[${this.name}] Received audio: ${audioBuffer.byteLength} bytes, format: ${format}`);

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
}
