/**
 * Test Audio Client
 * 
 * Provides test audio from local file instead of calling Stable Audio API.
 * Used for end-to-end testing of the audio generation flow.
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AudioClient, AudioClientRequest, AudioClientResponse } from './audio-clients/base.js';
import { logger } from './logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TestAudioClient implements AudioClient {
  readonly name = 'test-audio';
  private testAudioPath: string;

  constructor() {
    // Path to test audio file relative to src directory
    this.testAudioPath = resolve(__dirname, 'assets', 'test.mp3');
  }

  /**
   * Generate test audio by reading the local test.mp3 file
   * 
   * This simulates the Stable Audio API response but uses a local file instead.
   * The request parameters are logged but not used (since we're using a fixed test file).
   */
  async generateAudio(request: AudioClientRequest): Promise<AudioClientResponse | null> {
    try {
      logger.info('🧪 TEST MODE: Using local test audio file instead of Stable Audio API', {
        prompt: request.prompt.substring(0, 50) + (request.prompt.length > 50 ? '...' : ''),
        duration: request.duration,
        quality: request.quality,
        testFile: this.testAudioPath,
      });

      // Read the test audio file
      const audioBuffer = await readFile(this.testAudioPath);

      if (audioBuffer.length === 0) {
        throw new Error('Test audio file is empty');
      }

      logger.info(`🧪 TEST MODE: Loaded test audio file (${audioBuffer.length} bytes)`);

      // Simulate a small delay to make the flow more realistic
      await this.sleep(500);

      // Return the audio data in the same format as Stable Audio API would
      return {
        audio: audioBuffer.buffer.slice(
          audioBuffer.byteOffset,
          audioBuffer.byteOffset + audioBuffer.byteLength
        ),
        format: 'mp3', // test.mp3 is an MP3 file
      };
    } catch (error) {
      logger.error('🧪 TEST MODE: Failed to load test audio file:', error);
      return null;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
