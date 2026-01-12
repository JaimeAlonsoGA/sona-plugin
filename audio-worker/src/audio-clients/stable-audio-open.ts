/**
 * TangoFlux Audio Client (Designer Mode)
 * 
 * Uses the TangoFlux model via Replicate API
 * Model: declare-lab/tangoflux
 * Documentation: https://replicate.com/declare-lab/tangoflux
 * 
 * TangoFlux is optimized for generating sound effects with:
 * - Fast generation (25 steps default)
 * - Reliable duration control (up to 30 seconds)
 * - High quality sound effects output
 * 
 * Parameters:
 * - duration: 1-30 seconds
 * - steps: Based on quality (low=15, medium=25, high=50)
 * - guidance_scale: Default 4.5
 */

import Replicate from 'replicate';
import { BaseAudioClient, AudioClientRequest, AudioClientResponse } from './base.js';
import { WorkerConfig, API_MAX_DURATION } from '../types.js';
import { logger } from '../logger.js';

// Replicate model identifier for TangoFlux
const REPLICATE_MODEL = 'declare-lab/tangoflux:fcdc421786888a045329d7c4e1874764433a2516b21f4c34bd3da4e054d04cf9';

// Default parameters for TangoFlux
const DEFAULT_GUIDANCE_SCALE = 4.5;

// Quality to steps mapping for TangoFlux (faster model, fewer steps needed)
const TANGOFLUX_QUALITY_STEPS: Record<string, number> = {
    low: 25,     // Fast generation
    medium: 100,  // Balanced (default)
    high: 200,    // Higher quality
};

export class StableAudioOpenClient extends BaseAudioClient {
    readonly name = 'stable-audio-open'; // Keep name for compatibility
    private replicate: Replicate;

    constructor(config: WorkerConfig) {
        super(config);
        // Initialize Replicate with API token from config
        this.replicate = new Replicate({
            auth: config.replicateApiToken,
        });
    }

    /**
     * Generate audio using TangoFlux via Replicate API with retry logic
     */
    async generateAudio(request: AudioClientRequest): Promise<AudioClientResponse | null> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            if (attempt > 0) {
                logger.info(`[${this.name}] Retry attempt ${attempt}/${this.config.maxRetries}`);
                await this.sleep(this.config.retryDelayMs * attempt); // Exponential backoff
            }

            try {
                // Map quality to steps for TangoFlux
                const steps = request.steps ?? TANGOFLUX_QUALITY_STEPS[request.quality ?? 'medium'];
                const guidanceScale = request.cfg_scale ?? DEFAULT_GUIDANCE_SCALE;

                // Clamp duration to API limits (max 30s for TangoFlux)
                const duration = Math.min(
                    Math.max(1, request.duration),
                    API_MAX_DURATION.stableAudioOpen // Will be updated to 30 in types.ts
                );

                logger.info(`[${this.name}] Calling TangoFlux API:`, {
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
     * Call the Replicate API for TangoFlux
     * 
     * @param prompt - Text prompt for generation
     * @param duration - Duration in seconds (1-30)
     * @param steps - Number of inference steps (1-200)
     * @param guidanceScale - Scale for classifier-free guidance (1-20)
     */
    private async callReplicateAPI(
        prompt: string,
        duration: number,
        steps: number,
        guidanceScale: number
    ): Promise<AudioClientResponse | null> {
        try {
            const input = {
                prompt: prompt,
                duration: duration,
                steps: steps,
                guidance_scale: guidanceScale,
            };

            logger.debug(`[${this.name}] Replicate input:`, input);

            // Run the model - output is a URI string according to the schema
            const output = await this.replicate.run(REPLICATE_MODEL, { input });

            logger.debug(`[${this.name}] Replicate response received:`, {
                hasOutput: !!output,
                outputType: typeof output,
                output: output,
            });

            if (!output) {
                throw new Error('No output received from Replicate');
            }

            // Handle different response formats:
            // - String URI directly
            // - FileOutput object with url() method
            // - Object with url property
            let audioUrl: string;

            if (typeof output === 'string') {
                // Direct URI string
                audioUrl = output;
            } else if (typeof output === 'object' && output !== null) {
                const outputObj = output as { url?: string | (() => string) };
                if (typeof outputObj.url === 'function') {
                    // FileOutput object with url() method
                    audioUrl = outputObj.url();
                } else if (typeof outputObj.url === 'string') {
                    // Object with url property
                    audioUrl = outputObj.url;
                } else {
                    throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
                }
            } else {
                throw new Error(`Unexpected output type: ${typeof output}`);
            }

            logger.debug(`[${this.name}] Audio URL: ${audioUrl}`);

            // Fetch the audio file
            const audioBuffer = await this.fetchAudioFromUrl(audioUrl);

            if (audioBuffer.byteLength === 0) {
                throw new Error('Received empty audio buffer from Replicate');
            }

            logger.debug(`[${this.name}] Received audio: ${audioBuffer.byteLength} bytes`);

            return {
                audio: audioBuffer,
                format: 'wav', // TangoFlux outputs WAV
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Unknown error: ${String(error)}`);
        }
    }

    /**
     * Fetch audio from URL
     */
    private async fetchAudioFromUrl(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio from ${url}: ${response.status}`);
        }
        return response.arrayBuffer();
    }
}
