/**
 * Audio processing utilities
 * Handles WAV storage and MP3 conversion
 */

import { logger } from './logger.js';

export interface AudioFiles {
  wav: Buffer;
  mp3: Buffer;
}

export class AudioProcessor {
  /**
   * Process audio buffer - ensure WAV format and create MP3
   * 
   * Note: For production, you may want to use a proper audio processing library
   * like ffmpeg-static or fluent-ffmpeg for better MP3 conversion.
   * This implementation assumes the API returns WAV and creates a basic conversion.
   */
  async processAudio(audioBuffer: ArrayBuffer, format: string): Promise<AudioFiles | null> {
    try {
      const buffer = Buffer.from(audioBuffer);
      
      let wavBuffer: Buffer;
      
      // If the audio is already in WAV format, use it directly
      if (format === 'wav') {
        wavBuffer = buffer;
        logger.debug('Audio is already in WAV format');
      } else {
        // For other formats, we'll store as-is for WAV
        // In production, you might want to convert to WAV here
        logger.warn(`Audio format is ${format}, storing as WAV without conversion`);
        wavBuffer = buffer;
      }

      // For MP3 generation, we'll use a placeholder approach
      // In production, use a proper audio encoding library
      const mp3Buffer = await this.convertToMP3(wavBuffer);

      if (!mp3Buffer) {
        logger.error('Failed to create MP3 version');
        return null;
      }

      return {
        wav: wavBuffer,
        mp3: mp3Buffer,
      };
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
