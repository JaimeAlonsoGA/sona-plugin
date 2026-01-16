/**
 * Prepare Prompt Service
 * 
 * Prepares the final prompt for audio generation by appending
 * fixed parameters based on the selected mode and configuration.
 * 
 * Parameters vary by mode:
 * - Designer: duration only (SFX don't need musical params)
 * - Producer: bpm, time signature, bars, duration (loops need precise timing)
 * - Creator: bpm, key, scale, duration (songs need musical context)
 */

import { MusicalKey, ProducerConfig, DurationPreset } from './types.js';
import { logger } from './logger.js';

export type GenerationMode = 'designer' | 'producer' | 'creator';

export interface PreparePromptConfig {
    mode: GenerationMode;
    /** Duration in seconds */
    duration: number;
    /** Duration preset for Designer mode */
    durationPreset?: DurationPreset | null;
    /** Musical key (for Producer/Creator modes) */
    musicalKey?: MusicalKey | null;
    /** Producer configuration (bpm, time signature, bars) */
    producerConfig?: ProducerConfig | null;
}

export interface PreparedPrompt {
    /** Original user prompt */
    original: string;
    /** Final prompt with appended parameters */
    final: string;
    /** Parameters that were appended */
    appendedParams: string[];
}

/**
 * Format duration for prompt
 * Uses descriptive terms for short durations, seconds for longer
 */
function formatDuration(seconds: number, preset?: DurationPreset | null): string {
    if (preset) {
        switch (preset) {
            case 'short': return 'short duration';
            case 'medium': return 'medium duration';
            case 'long': return 'long duration';
        }
    }
    
    if (seconds <= 5) return 'very short';
    if (seconds <= 15) return `${seconds} seconds`;
    if (seconds <= 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} minutes`;
}

/**
 * Format BPM for prompt
 */
function formatBpm(bpm: number): string {
    return `${bpm} BPM`;
}

/**
 * Format musical key for prompt
 */
function formatKey(musicalKey: MusicalKey): string {
    return `${musicalKey.key} ${musicalKey.scale}`;
}

/**
 * Format time signature for prompt
 */
function formatTimeSignature(timeSignature: string): string {
    return `${timeSignature} time`;
}

/**
 * Format bars for prompt
 */
function formatBars(bars: number): string {
    return `${bars} bar${bars > 1 ? 's' : ''}`;
}

/**
 * Prepare prompt for Designer mode (SFX / Sound Design)
 * 
 * Designer mode uses TangoFlux for short SFX.
 * Only duration is relevant - no musical parameters needed.
 */
function prepareDesignerPrompt(
    userPrompt: string,
    config: PreparePromptConfig
): PreparedPrompt {
    const params: string[] = [];
    
    // Duration is important for SFX length
    params.push(formatDuration(config.duration, config.durationPreset));
    
    const paramString = params.join(', ');
    const final = `${userPrompt}. ${paramString}`;
    
    return {
        original: userPrompt,
        final,
        appendedParams: params,
    };
}

/**
 * Prepare prompt for Producer mode (Loops)
 * 
 * Producer mode uses Stable Audio 2.5 for musical loops.
 * Includes: BPM, time signature, bars, duration.
 */
function prepareProducerPrompt(
    userPrompt: string,
    config: PreparePromptConfig
): PreparedPrompt {
    const params: string[] = [];
    
    // BPM is critical for loops
    if (config.producerConfig?.bpm) {
        params.push(formatBpm(config.producerConfig.bpm));
    }
    
    // Musical key if specified
    if (config.musicalKey?.key) {
        params.push(formatKey(config.musicalKey));
    }
    
    // Time signature for rhythmic accuracy
    if (config.producerConfig?.timeSignature) {
        params.push(formatTimeSignature(config.producerConfig.timeSignature));
    }
    
    // Bars for loop length context
    if (config.producerConfig?.bars) {
        params.push(formatBars(config.producerConfig.bars));
    }
    
    // Duration
    params.push(formatDuration(config.duration));
    
    const paramString = params.join(', ');
    const final = `${userPrompt}. ${paramString}`;
    
    return {
        original: userPrompt,
        final,
        appendedParams: params,
    };
}

/**
 * Prepare prompt for Creator mode (Songs)
 * 
 * Creator mode uses Stable Audio 2.5 for full songs.
 * Includes: BPM, key, scale, duration.
 */
function prepareCreatorPrompt(
    userPrompt: string,
    config: PreparePromptConfig
): PreparedPrompt {
    const params: string[] = [];
    
    // BPM for tempo
    if (config.producerConfig?.bpm) {
        params.push(formatBpm(config.producerConfig.bpm));
    }
    
    // Musical key is important for songs
    if (config.musicalKey?.key) {
        params.push(formatKey(config.musicalKey));
    }
    
    // Duration
    params.push(formatDuration(config.duration));
    
    const paramString = params.join(', ');
    const final = `${userPrompt}. ${paramString}`;
    
    return {
        original: userPrompt,
        final,
        appendedParams: params,
    };
}

/**
 * Prepare the final prompt for audio generation
 * 
 * Appends fixed parameters to the user prompt based on mode:
 * - Designer: duration
 * - Producer: bpm, key, time signature, bars, duration
 * - Creator: bpm, key, duration
 * 
 * @param userPrompt - The user's prompt (may already be enhanced)
 * @param config - Configuration with mode and parameters
 * @returns PreparedPrompt with original and final prompt
 */
export function preparePrompt(
    userPrompt: string,
    config: PreparePromptConfig
): PreparedPrompt {
    const mode = config.mode || 'designer';
    
    logger.debug('Preparing prompt for audio generation', {
        mode,
        duration: config.duration,
        hasBpm: !!config.producerConfig?.bpm,
        hasKey: !!config.musicalKey?.key,
        hasTimeSignature: !!config.producerConfig?.timeSignature,
        hasBars: !!config.producerConfig?.bars,
    });
    
    let result: PreparedPrompt;
    
    switch (mode) {
        case 'producer':
            result = prepareProducerPrompt(userPrompt, config);
            break;
        case 'creator':
            result = prepareCreatorPrompt(userPrompt, config);
            break;
        case 'designer':
        default:
            result = prepareDesignerPrompt(userPrompt, config);
            break;
    }
    
    logger.info('Prompt prepared for generation', {
        mode,
        appendedParams: result.appendedParams,
        finalPromptLength: result.final.length,
    });
    
    return result;
}
