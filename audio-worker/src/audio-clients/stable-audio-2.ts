/**
 * Stable Audio 2.5 Client (Producer Mode)
 * 
 * Migrated to use the Replicate API
 * Model: stability-ai/stable-audio-2.5
 * Documentation: https://replicate.com/stability-ai/stable-audio-2.5
 */

import Replicate from 'replicate';
import { BaseAudioClient, AudioClientRequest, AudioClientResponse } from './base.js';
import { WorkerConfig, API_MAX_DURATION } from '../types.js';
import { logger } from '../logger.js';

const REPLICATE_MODEL = 'stability-ai/stable-audio-2.5:1234567890abcdef'; // Replace with actual model ID
const DEFAULT_CFG_SCALE = 7.0; // Default guidance scale for Stable Audio 2.5
const STABLE_AUDIO_QUALITY_STEPS: Record<string, number> = {
    low: 50,
    medium: 100,
    high: 150,
};

export class StableAudio2Client extends BaseAudioClient {
    readonly name = 'stable-audio-2.5';
    private replicate: Replicate;

    constructor(config: WorkerConfig) {
        super(config);
        this.replicate = new Replicate({
            auth: config.replicateApiToken,
        });
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
                const steps = request.steps ?? STABLE_AUDIO_QUALITY_STEPS[request.quality ?? 'medium'];
                const guidanceScale = request.cfg_scale ?? DEFAULT_CFG_SCALE;
                
                // Clamp duration to API limits
                const duration = Math.min(
                    Math.max(1, request.duration),
                    API_MAX_DURATION.stableAudio2
                );

                logger.info(`[${this.name}] Calling Replicate API:`, {
                    model: REPLICATE_MODEL,
                    duration,
                    steps,
                    guidanceScale,
                    quality: request.quality,
                    promptLength: request.prompt.length,
                });

                const response = await this.callReplicateAPI(
                    request.prompt,
                    duration,
                    steps,
                    guidanceScale
                );

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
     * Call the Replicate API for Stable Audio 2.5
     * 
     * @param prompt - Text prompt for generation
     * @param duration - Duration in seconds (1-180)
     * @param steps - Number of inference steps
     * @param guidanceScale - Guidance scale (cfg_scale)
     */
    private async callReplicateAPI(
        prompt: string,
        duration: number,
        steps: number,
        guidanceScale: number
    ): Promise<AudioClientResponse | null> {
        try {
            const input = {
                prompt,
                duration,
                steps,
                guidance_scale: guidanceScale,
            };

            logger.debug(`[${this.name}] Replicate input:`, input);

            const output = await this.replicate.run(REPLICATE_MODEL, { input });

            logger.debug(`[${this.name}] Replicate response received:`, {
                hasOutput: !!output,
                outputType: typeof output,
                output,
            });

            if (!output) {
                throw new Error('No output received from Replicate');
            }

            let audioUrl: string;

            if (typeof output === 'string') {
                audioUrl = output;
            } else if (typeof output === 'object' && output !== null) {
                const outputObj = output as { url?: string | (() => string) };
                if (typeof outputObj.url === 'function') {
                    audioUrl = outputObj.url();
                } else if (typeof outputObj.url === 'string') {
                    audioUrl = outputObj.url;
                } else {
                    throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
                }
            } else {
                throw new Error(`Unexpected output type: ${typeof output}`);
            }

            logger.debug(`[${this.name}] Audio URL: ${audioUrl}`);

            const audioBuffer = await this.fetchAudioFromUrl(audioUrl);

            if (audioBuffer.byteLength === 0) {
                throw new Error('Received empty audio buffer from Replicate');
            }

            logger.debug(`[${this.name}] Received audio: ${audioBuffer.byteLength} bytes`);

            return {
                audio: audioBuffer,
                format: 'wav',
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Unknown error: ${String(error)}`);
        }
    }

    private async fetchAudioFromUrl(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio from ${url}: ${response.status}`);
        }
        return response.arrayBuffer();
    }
}
