/**
 * One-time script to generate UCS embeddings
 * 
 * Run with: npx tsx scripts/generate-ucs-embeddings.ts
 * 
 * This script:
 * 1. Loads the full UCS.json file
 * 2. Generates embeddings for each entry using OpenAI
 * 3. Saves the embeddings to a cache file
 * 
 * The cache file should be committed to the repository.
 * Only re-run this script if UCS.json changes.
 */

import { config } from 'dotenv';
config();

import { UCSRagService } from '../src/ucs-rag.js';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment');
    console.error('   Set it in .env file or environment variables');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         UCS Embeddings Generation Script                   ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  This is a ONE-TIME operation.                             ║');
  console.log('║  The generated cache will be saved locally.                ║');
  console.log('║  Commit the cache file to avoid regenerating.              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();

  try {
    const service = new UCSRagService(apiKey);
    await service.generateEmbeddings();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const stats = service.getStats();

    console.log('');
    console.log('✅ Embeddings generated successfully!');
    console.log(`   Entries: ${stats.entryCount}`);
    console.log(`   Dimensions: ${stats.dimensions}`);
    console.log(`   Time: ${elapsed}s`);
    console.log('');
    console.log('📁 Cache saved to: src/assets/ucs-embeddings.cache.json');
    console.log('   Remember to commit this file!');
  } catch (error) {
    console.error('');
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
