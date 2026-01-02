/**
 * UCS RAG (Retrieval-Augmented Generation) Service
 * 
 * Implements semantic search over UCS categories using pre-computed embeddings.
 * The full UCS JSON is embedded ONCE and cached locally.
 * At runtime, only relevant entries are retrieved via vector similarity.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Types
// ============================================================================

/** Raw UCS entry from the JSON file */
interface RawUCSEntry {
  Category: string;
  SubCategory: string;
  CatID: string;
  CatShort: string;
  Explanations: string;
  'Synonyms - Comma Separated': string;
}

/** Processed UCS entry for embedding */
export interface UCSEntry {
  catId: string;           // e.g., "AIRBlow"
  catShort: string;        // e.g., "AIR"
  category: string;        // e.g., "AIR"
  subCategory: string;     // e.g., "BLOW"
  explanation: string;     // Description of what this category covers
}

/** UCS entry with pre-computed embedding */
interface EmbeddedUCSEntry extends UCSEntry {
  embedding: number[];
}

/** Cache file structure */
interface EmbeddingsCache {
  version: string;
  model: string;
  dimensions: number;
  generatedAt: string;
  entryCount: number;
  entries: EmbeddedUCSEntry[];
}

/** Retrieved UCS context for LLM */
export interface RetrievedUCSContext {
  entries: UCSEntry[];
  formatted: string;
}

// ============================================================================
// Constants
// ============================================================================

const UCS_JSON_PATH = join(__dirname, 'assets', 'UCS.json');
const EMBEDDINGS_CACHE_PATH = join(__dirname, 'assets', 'ucs-embeddings.cache.json');

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 512; // Reduced dimensions for efficiency
const CACHE_VERSION = '1.0.0';

// ============================================================================
// UCS RAG Service
// ============================================================================

export class UCSRagService {
  private entries: EmbeddedUCSEntry[] = [];
  private isReady = false;
  private openai: OpenAI | null = null;

  constructor(openaiApiKey?: string) {
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    }
  }

  /**
   * Initialize the service by loading cached embeddings
   * Call this at worker startup
   */
  async initialize(): Promise<void> {
    if (this.isReady) return;

    try {
      if (!existsSync(EMBEDDINGS_CACHE_PATH)) {
        logger.warn('UCS embeddings cache not found. Run: npm run generate-ucs-embeddings');
        return;
      }

      const cacheData = readFileSync(EMBEDDINGS_CACHE_PATH, 'utf-8');
      const cache: EmbeddingsCache = JSON.parse(cacheData);

      // Validate cache version
      if (cache.version !== CACHE_VERSION) {
        logger.warn(`UCS embeddings cache version mismatch. Expected ${CACHE_VERSION}, got ${cache.version}`);
        return;
      }

      this.entries = cache.entries;
      this.isReady = true;

      logger.info(`UCS RAG initialized: ${this.entries.length} entries loaded from cache`);
    } catch (error) {
      logger.error('Failed to initialize UCS RAG service:', error);
    }
  }

  /**
   * Check if the service is ready for queries
   */
  get ready(): boolean {
    return this.isReady && this.entries.length > 0;
  }

  /**
   * Retrieve top-k most relevant UCS entries for a given prompt
   * Uses embedding similarity search
   */
  async retrieve(prompt: string, topK: number = 5): Promise<RetrievedUCSContext> {
    if (!this.ready) {
      logger.warn('UCS RAG not ready, returning empty context');
      return { entries: [], formatted: '' };
    }

    if (!this.openai) {
      logger.error('OpenAI client not configured for UCS RAG');
      return { entries: [], formatted: '' };
    }

    try {
      // Generate embedding for user prompt
      const promptEmbedding = await this.embedText(prompt);

      // Calculate similarity scores
      const scored = this.entries.map(entry => ({
        entry,
        score: this.cosineSimilarity(promptEmbedding, entry.embedding),
      }));

      // Sort by similarity (descending) and take top-k
      scored.sort((a, b) => b.score - a.score);
      const topEntries = scored.slice(0, topK);

      // Log retrieval results for debugging
      logger.debug('UCS RAG retrieval results', {
        prompt: prompt.substring(0, 50),
        topMatches: topEntries.map(({ entry, score }) => ({
          catId: entry.catId,
          score: score.toFixed(4),
        })),
      });

      // Format for LLM consumption
      const entries = topEntries.map(({ entry }) => ({
        catId: entry.catId,
        catShort: entry.catShort,
        category: entry.category,
        subCategory: entry.subCategory,
        explanation: entry.explanation,
      }));

      const formatted = this.formatForLLM(entries);

      return { entries, formatted };
    } catch (error) {
      logger.error('UCS RAG retrieval failed:', error);
      return { entries: [], formatted: '' };
    }
  }

  /**
   * Format retrieved UCS entries for LLM prompt
   */
  private formatForLLM(entries: UCSEntry[]): string {
    if (entries.length === 0) return '';

    const lines = entries.map(e => 
      `- ${e.catId} (${e.category}/${e.subCategory}): ${e.explanation}`
    );

    return `UCS Categories (choose ONE):\n${lines.join('\n')}`;
  }

  /**
   * Generate embedding for a single text
   */
  private async embedText(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const response = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  // ==========================================================================
  // Embedding Generation (One-Time)
  // ==========================================================================

  /**
   * Generate embeddings for all UCS entries
   * This should be run ONCE and the results cached
   */
  async generateEmbeddings(): Promise<void> {
    if (!this.openai) {
      throw new Error('OpenAI client required to generate embeddings');
    }

    logger.info('Starting UCS embeddings generation...');
    logger.info(`Reading UCS data from: ${UCS_JSON_PATH}`);

    // Load raw UCS data
    const rawData: RawUCSEntry[] = JSON.parse(readFileSync(UCS_JSON_PATH, 'utf-8'));
    logger.info(`Loaded ${rawData.length} UCS entries`);

    // Process entries
    const processedEntries: Array<{ entry: UCSEntry; textForEmbedding: string }> = [];

    for (const raw of rawData) {
      const entry: UCSEntry = {
        catId: raw.CatID,
        catShort: raw.CatShort,
        category: raw.Category,
        subCategory: raw.SubCategory,
        explanation: raw.Explanations || '',
      };

      // Build text for embedding: combine category info + explanation + key synonyms
      // This gives the embedding semantic richness
      const synonyms = (raw['Synonyms - Comma Separated'] || '')
        .split(',')
        .slice(0, 10) // Take first 10 synonyms to keep text manageable
        .map(s => s.trim())
        .filter(Boolean)
        .join(', ');

      const textForEmbedding = [
        `${entry.category} ${entry.subCategory}`,
        entry.explanation,
        synonyms,
      ].filter(Boolean).join('. ');

      processedEntries.push({ entry, textForEmbedding });
    }

    // Generate embeddings in batches
    const BATCH_SIZE = 100;
    const embeddedEntries: EmbeddedUCSEntry[] = [];

    for (let i = 0; i < processedEntries.length; i += BATCH_SIZE) {
      const batch = processedEntries.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(processedEntries.length / BATCH_SIZE);

      logger.info(`Processing batch ${batchNum}/${totalBatches}...`);

      const texts = batch.map(b => b.textForEmbedding);

      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      for (let j = 0; j < batch.length; j++) {
        embeddedEntries.push({
          ...batch[j].entry,
          embedding: response.data[j].embedding,
        });
      }

      // Small delay to avoid rate limits
      if (i + BATCH_SIZE < processedEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Save cache
    const cache: EmbeddingsCache = {
      version: CACHE_VERSION,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      generatedAt: new Date().toISOString(),
      entryCount: embeddedEntries.length,
      entries: embeddedEntries,
    };

    writeFileSync(EMBEDDINGS_CACHE_PATH, JSON.stringify(cache));
    
    logger.info(`UCS embeddings generated and cached: ${embeddedEntries.length} entries`);
    logger.info(`Cache saved to: ${EMBEDDINGS_CACHE_PATH}`);

    // Update local state
    this.entries = embeddedEntries;
    this.isReady = true;
  }

  /**
   * Get statistics about the loaded embeddings
   */
  getStats(): { ready: boolean; entryCount: number; dimensions: number } {
    return {
      ready: this.isReady,
      entryCount: this.entries.length,
      dimensions: this.entries[0]?.embedding.length || 0,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let ucsRagInstance: UCSRagService | null = null;

/**
 * Get or create the UCS RAG service instance
 */
export function getUCSRagService(openaiApiKey?: string): UCSRagService {
  if (!ucsRagInstance) {
    ucsRagInstance = new UCSRagService(openaiApiKey);
  }
  return ucsRagInstance;
}

/**
 * Initialize the UCS RAG service (call at worker startup)
 */
export async function initializeUCSRag(openaiApiKey: string): Promise<UCSRagService> {
  const service = getUCSRagService(openaiApiKey);
  await service.initialize();
  return service;
}
