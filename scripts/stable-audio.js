#!/usr/bin/env node

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_KEY = process.env.STABLE_AUDIO_API_KEY;
const TEXT_TO_AUDIO_ENDPOINT = 'https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio';
const AUDIO_TO_AUDIO_ENDPOINT = 'https://api.stability.ai/v2beta/audio/stable-audio-2/audio-to-audio';
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const DEFAULT_PROMPT = "punchy tech house kick drum";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generates a timestamp string for filenames
 * @returns {string} Timestamp in format YYYY-MM-DDTHH-MM-SS
 */
function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Validates API key exists
 */
function validateApiKey() {
  if (!API_KEY) {
    console.error('❌ Error: STABLE_AUDIO_API_KEY environment variable is not set');
    console.error('Please set it with: export STABLE_AUDIO_API_KEY=your-api-key');
    process.exit(1);
  }
}

/**
 * Generates audio from text using Stable Audio API
 * @param {string} prompt - The text prompt describing the audio to generate
 * @param {Object} options - Generation options
 */
async function textToAudio(prompt = DEFAULT_PROMPT, options = {}) {
  console.log('\n🎵 Starting Text-to-Audio generation...');
  console.log(`📝 Prompt: "${prompt}"`);
  
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', options.output_format || 'wav');
    formData.append('duration', options.duration || 20);
    formData.append('model', options.model || 'stable-audio-2.5');
    
    if (options.seed !== undefined) {
      formData.append('seed', options.seed);
    }
    
    console.log('⏳ Sending request to Stable Audio API...');
    
    const response = await axios.post(TEXT_TO_AUDIO_ENDPOINT, formData, {
      headers: {
        'authorization': `Bearer ${API_KEY}`,
        'accept': 'audio/*',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 120000 // 2 minutes timeout
    });
    
    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    const timestamp = generateTimestamp();
    const filename = `text-${timestamp}.${options.output_format || 'wav'}`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, response.data);
    
    console.log('✅ Audio generated successfully!');
    console.log(`📁 Saved to: ${filepath}`);
    console.log(`⏱️  Generation time: ${generationTime}s`);
    console.log(`📊 File size: ${(response.data.length / 1024).toFixed(2)} KB`);
    
    return filepath;
  } catch (error) {
    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error(`❌ Error after ${generationTime}s:`, error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data?.toString() || 'No response data');
    }
    
    throw error;
  }
}

/**
 * Transforms existing audio using Stable Audio API
 * @param {string} audioPath - Path to the input audio file
 * @param {string} prompt - The text prompt describing the desired transformation
 * @param {Object} options - Generation options
 */
async function audioToAudio(audioPath, prompt, options = {}) {
  console.log('\n🎵 Starting Audio-to-Audio generation...');
  console.log(`📁 Input audio: ${audioPath}`);
  console.log(`📝 Prompt: "${prompt}"`);
  
  const startTime = Date.now();
  
  try {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Input audio file not found: ${audioPath}`);
    }
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('output_format', options.output_format || 'wav');
    formData.append('duration', options.duration || 20);
    formData.append('model', options.model || 'stable-audio-2.5');
    formData.append('strength', options.strength !== undefined ? options.strength : 0.7);
    
    if (options.seed !== undefined) {
      formData.append('seed', options.seed);
    }
    
    console.log('⏳ Sending request to Stable Audio API...');
    
    const response = await axios.post(AUDIO_TO_AUDIO_ENDPOINT, formData, {
      headers: {
        'authorization': `Bearer ${API_KEY}`,
        'accept': 'audio/*',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer',
      timeout: 120000 // 2 minutes timeout
    });
    
    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    const timestamp = generateTimestamp();
    const filename = `audio-${timestamp}.${options.output_format || 'wav'}`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, response.data);
    
    console.log('✅ Audio transformed successfully!');
    console.log(`📁 Saved to: ${filepath}`);
    console.log(`⏱️  Generation time: ${generationTime}s`);
    console.log(`📊 File size: ${(response.data.length / 1024).toFixed(2)} KB`);
    
    return filepath;
  } catch (error) {
    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error(`❌ Error after ${generationTime}s:`, error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data?.toString() || 'No response data');
    }
    
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  validateApiKey();
  
  const args = process.argv.slice(2);
  const mode = args[0] || 'text-to-audio';
  
  console.log('🎼 Stable Audio API Test Script');
  console.log('================================');
  
  try {
    if (mode === 'text-to-audio') {
      const prompt = args[1] || DEFAULT_PROMPT;
      await textToAudio(prompt, {
        output_format: 'wav',
        duration: 20,
        model: 'stable-audio-2.5'
      });
    } else if (mode === 'audio-to-audio') {
      const audioPath = args[1];
      const prompt = args[2];
      
      if (!audioPath || !prompt) {
        console.error('❌ Error: audio-to-audio mode requires <audio-path> <prompt>');
        console.error('Usage: node stable-audio.js audio-to-audio <path-to-audio> "transformation prompt"');
        process.exit(1);
      }
      
      await audioToAudio(audioPath, prompt, {
        output_format: 'wav',
        duration: 20,
        model: 'stable-audio-2.5',
        strength: 0.7
      });
    } else {
      console.error(`❌ Error: Unknown mode "${mode}"`);
      console.error('Available modes: text-to-audio, audio-to-audio');
      process.exit(1);
    }
    
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n💥 Generation failed');
    process.exit(1);
  }
}

// Run if called directly
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { textToAudio, audioToAudio };
