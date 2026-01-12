/**
 * Audio Clients Module
 * 
 * Barrel export for all audio client implementations
 */

// Base types and interfaces (use 'export type' for interfaces)
export type { AudioClient, AudioClientRequest, AudioClientResponse } from './base.js';
export { BaseAudioClient } from './base.js';

// Client implementations
export { StableAudio2Client } from './stable-audio-2.js';
export { StableAudioOpenClient } from './stable-audio-open.js';

// Factory
export { createAudioClient } from './factory.js';
