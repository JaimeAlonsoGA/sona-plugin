/**
 * Audio processing utilities
 * Handles WAV storage with optional MP3 conversion for future use
 */

import { logger } from './logger.js';

export interface ProcessAudioOptions {
  /** Include MP3 conversion (not yet implemented, for future use) */
  includeMp3?: boolean;
}

export interface AudioFiles {
  wav: Buffer;
  mp3?: Buffer; // Optional, for future MP3 support
}

export class AudioProcessor {
  /**
   * Process audio buffer - ensure WAV format
   * 
   * Currently only returns WAV. MP3 conversion can be enabled in the future
   * by passing { includeMp3: true } in options.
   * 
   * @param audioBuffer - Raw audio data from API
   * @param format - Format of the input audio ('wav', 'mp3', etc.)
   * @param options - Processing options
   */
  async processAudio(
    audioBuffer: ArrayBuffer,
    format: string,
    options: ProcessAudioOptions = {}
  ): Promise<AudioFiles | null> {
    try {
      const buffer = Buffer.from(audioBuffer);

      let wavBuffer: Buffer;

      // If the audio is already in WAV format, use it directly
      if (format === 'wav') {
        wavBuffer = buffer;
        logger.debug('Audio is already in WAV format');
      } else {
        // For other formats, we'll store as-is
        // In production, you might want to convert to WAV here using ffmpeg
        logger.warn(`Audio format is ${format}, storing without conversion`);
        wavBuffer = buffer;
      }

      const result: AudioFiles = { wav: wavBuffer };

      // Optional MP3 conversion for future use
      if (options.includeMp3) {
        const mp3Buffer = await this.convertToMP3(wavBuffer);
        if (mp3Buffer) {
          result.mp3 = mp3Buffer;
        } else {
          logger.warn('MP3 conversion failed, continuing with WAV only');
        }
      }

      return result;
    } catch (error) {
      logger.error('Error processing audio:', error);
      return null;
    }
  }

  /**
   * Convert WAV to MP3
   * 
   * Note: This is a simplified implementation.
   * For production use, integrate a proper audio encoder like:
   * - @ffmpeg/ffmpeg (WebAssembly-based)
   * - fluent-ffmpeg (requires ffmpeg binary)
   * - lame (MP3 encoder)
   * 
   * For now, we'll create a copy with MP3 extension.
   * The worker can be enhanced later with proper encoding.
   */
  private async convertToMP3(wavBuffer: Buffer): Promise<Buffer | null> {
    try {
      // TODO: Implement proper WAV to MP3 conversion
      // For MVP, we return the same buffer
      // This should be replaced with actual MP3 encoding

      logger.warn('MP3 conversion not yet implemented, using WAV data as placeholder');

      // In a real implementation, you would:
      // 1. Install a library like 'lamejs' or use ffmpeg
      // 2. Decode the WAV data
      // 3. Encode to MP3 format
      // 4. Return the MP3 buffer

      // For now, return the WAV buffer as a placeholder
      // This ensures the system works end-to-end while proper encoding is implemented
      return wavBuffer;
    } catch (error) {
      logger.error('Error converting to MP3:', error);
      return null;
    }
  }

  /**
   * Validate audio buffer
   */
  isValidAudio(buffer: Buffer): boolean {
    // Basic validation - check if buffer is not empty
    if (buffer.length === 0) {
      return false;
    }

    // Check for WAV header (RIFF)
    const header = buffer.toString('ascii', 0, 4);
    if (header === 'RIFF') {
      logger.debug('Valid WAV file detected');
      return true;
    }

    // Check for MP3 header (ID3 or sync bytes)
    const id3 = buffer.toString('ascii', 0, 3);
    if (id3 === 'ID3') {
      logger.debug('Valid MP3 file detected (ID3)');
      return true;
    }

    // Check for MP3 sync bytes (0xFF 0xFB or 0xFF 0xFA)
    if (buffer.length >= 2 && buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
      logger.debug('Valid MP3 file detected (sync bytes)');
      return true;
    }

    logger.warn('Unknown audio format, proceeding anyway');
    return true; // Be permissive for now
  }
}
