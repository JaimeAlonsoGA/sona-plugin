/**
 * Audio Client Factory
 * 
 * Creates the appropriate audio client based on the job mode
 */

import { WorkerConfig } from '../types.js';
import { AudioClient } from './base.js';
import { StableAudio2Client } from './stable-audio-2.js';
import { StableAudioOpenClient } from './stable-audio-open.js';
import { logger } from '../logger.js';

/**
 * Create an audio client based on the mode
 * 
 * @param mode - The generation mode ('designer' | 'producer' | 'creator')
 * @param config - Worker configuration
 * @returns The appropriate AudioClient implementation
 */
export function createAudioClient(mode: string, config: WorkerConfig): AudioClient {
    logger.debug(`Creating audio client for mode: ${mode}`);

    switch (mode) {
        case 'designer':
            // Designer mode uses TangoFlux via Replicate (sound effects)
            logger.info('Using Stable Audio Open (TangoFlux) client for designer mode');
            return new StableAudioOpenClient(config);

        case 'creator':
            // Creator mode uses Stable Audio 2.5 (songs)
            logger.info('Using Stable Audio 2.5 client for creator mode');
            return new StableAudio2Client(config);

        case 'producer':
        default:
            // Producer mode uses Stable Audio 2.5 (loops)
            logger.info('Using Stable Audio 2.5 client for producer mode');
            return new StableAudio2Client(config);
    }
}
