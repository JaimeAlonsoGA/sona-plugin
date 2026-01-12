/**
 * Base interface for audio generation clients
 * All audio APIs must implement this interface
 */

import { WorkerConfig, QualityLevel } from '../types.js';

export interface AudioClientRequest {
    prompt: string;
    /** Duration in seconds */
    duration: number;
    /** Quality level (maps to steps internally) */
    quality?: QualityLevel;
    /** Direct steps override (if not using quality mapping) */
    steps?: number;
    /** CFG scale for generation control */
    cfg_scale?: number;
    /** Random seed for reproducible generation (-1 for random) */
    seed?: number;
    /** Negative prompt to guide what to avoid in generation */
    negativePrompt?: string;
    /** 
     * Future feature: Audio input for audio-to-audio generation
     * When provided, the model will use this as a starting point
     */
    audioInput?: ArrayBuffer | null;
    /**
     * Future feature: Strength of audio input influence (0.0 to 1.0)
     * Higher values = more influence from input audio
     */
    audioInputStrength?: number;
}

export interface AudioClientResponse {
    audio: ArrayBuffer;
    format: string; // 'wav' | 'mp3'
}

export interface AudioClient {
    /** Human-readable name of the client */
    readonly name: string;

    /** Generate audio from the given request */
    generateAudio(request: AudioClientRequest): Promise<AudioClientResponse | null>;
}

/**
 * Base class with common functionality for audio clients
 */
export abstract class BaseAudioClient implements AudioClient {
    protected config: WorkerConfig;
    abstract readonly name: string;

    constructor(config: WorkerConfig) {
        this.config = config;
    }

    abstract generateAudio(request: AudioClientRequest): Promise<AudioClientResponse | null>;

    /**
     * Sleep utility for retry delays
     */
    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
