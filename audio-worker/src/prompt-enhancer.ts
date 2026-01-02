/**
 * Prompt Enhancer Service
 * 
 * Uses OpenAI to:
 * 1. Refine and enhance user prompts for better audio generation
 * 2. Generate UCS-compliant filenames for the output audio
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { WorkerConfig, QualityLevel } from './types.js';
import { logger } from './logger.js';

// UCS (Universal Category System) sound categories for naming
const UCS_CATEGORIES = {
  // Ambiences
  AMB: 'Ambience',
  // Atmospheres
  ATM: 'Atmosphere',
  // Drones
  DRN: 'Drone',
  // Foley
  FLY: 'Foley',
  // Impacts
  IMP: 'Impact',
  // Music elements
  MUS: 'Music Element',
  // Nature
  NAT: 'Nature',
  // Science Fiction
  SCI: 'Sci-Fi',
  // Synthesizers
  SYN: 'Synthesizer',
  // Textures
  TXT: 'Texture',
  // Transitions
  TRN: 'Transition',
  // Whooshes
  WHO: 'Whoosh',
  // Mechanical
  MCH: 'Mechanical',
  // Electronic
  ELC: 'Electronic',
  // Vocal
  VOC: 'Vocal',
  // Weapons
  WPN: 'Weapon',
  // Water
  WTR: 'Water',
  // Fire
  FIR: 'Fire',
  // Horror
  HOR: 'Horror',
  // Magical
  MAG: 'Magic',
  // User Interface
  UI: 'UI',
  // Other/General
  GEN: 'General',
} as const;

// Zod schema for the OpenAI structured response
const PromptEnhancementSchema = z.object({
  enhanced_prompt: z.string().describe('The refined, standardized prompt in English with improved technical vocabulary for audio generation'),
  ucs_category: z.enum(Object.keys(UCS_CATEGORIES) as [string, ...string[]]).describe('The UCS category ID that best matches the sound'),
  fx_name: z.string().describe('A concise, descriptive name for the sound effect (2-4 words, PascalCase, no spaces)'),
  reasoning: z.string().describe('Brief explanation of why this categorization and naming was chosen'),
});

export type PromptEnhancementResult = z.infer<typeof PromptEnhancementSchema>;

export interface EnhancedPromptData {
  originalPrompt: string;
  enhancedPrompt: string;
  filename: string;
  ucsCategory: string;
  fxName: string;
}

export interface PromptEnhancerConfig {
  duration: number;
  quality: QualityLevel;
}

export class PromptEnhancerService {
  private client: OpenAI;
  private model: string = 'gpt-4o-mini'; // Using gpt-4o-mini as gpt-5-nano equivalent

  constructor(config: WorkerConfig) {
    this.client = new OpenAI({
      apiKey: config.openAiApiKey,
    });
  }

  /**
   * Enhance a user prompt and generate UCS-compliant filename
   */
  async enhancePrompt(
    userPrompt: string,
    config: PromptEnhancerConfig
  ): Promise<EnhancedPromptData> {
    const startTime = Date.now();
    
    try {
      logger.info('Enhancing prompt with OpenAI...', { 
        promptLength: userPrompt.length,
        duration: config.duration,
        quality: config.quality,
      });

      const systemPrompt = this.buildSystemPrompt();
      const userMessage = this.buildUserMessage(userPrompt, config);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse and validate with Zod
      const parsed = JSON.parse(content);
      const validated = PromptEnhancementSchema.parse(parsed);

      // Build UCS-compliant filename
      // Format: CatID_FXName_CreatorID_SourceID
      const filename = this.buildFilename(validated.ucs_category, validated.fx_name);

      const result: EnhancedPromptData = {
        originalPrompt: userPrompt,
        enhancedPrompt: validated.enhanced_prompt,
        filename,
        ucsCategory: validated.ucs_category,
        fxName: validated.fx_name,
      };

      const elapsed = Date.now() - startTime;
      logger.info(`Prompt enhanced successfully in ${elapsed}ms`, {
        filename: result.filename,
        enhancedPromptLength: result.enhancedPrompt.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to enhance prompt:', error);
      
      // Fallback: return original prompt with generic filename
      return this.createFallbackResult(userPrompt);
    }
  }

  /**
   * Build the system prompt for OpenAI
   */
  private buildSystemPrompt(): string {
    const categories = Object.entries(UCS_CATEGORIES)
      .map(([id, name]) => `${id}: ${name}`)
      .join(', ');

    return `You are an expert sound designer assistant specializing in audio generation prompts. Your job is to:

1. ENHANCE USER PROMPTS: Transform user prompts into professional, technical descriptions optimized for AI audio generation. Always output in English, regardless of input language. Use precise audio terminology (e.g., "warm analog saturation", "spectral shimmer", "granular texture", "formant shifting", "bitcrushed artifacts", "reverberant tail", "transient punch", "harmonic overtones").

2. CATEGORIZE SOUNDS: Assign the most appropriate UCS (Universal Category System) category:
${categories}

3. NAME THE SOUND: Create a concise, professional sound effect name in PascalCase (2-4 words, no spaces).

RULES:
- Enhanced prompts should be 1-3 sentences, technically precise, and avoid ambiguous terms
- Focus on sonic characteristics: timbre, texture, envelope, frequency content, spatial qualities
- Include descriptors for: attack, sustain, decay, modulation, filtering, effects
- FX names should be evocative and industry-standard (e.g., "DeepBass", "ShimmerPad", "GrittyImpact")

Respond ONLY with valid JSON matching this schema:
{
  "enhanced_prompt": "string",
  "ucs_category": "string (one of the category IDs)",
  "fx_name": "string (PascalCase, 2-4 words)",
  "reasoning": "string (brief explanation)"
}`;
  }

  /**
   * Build the user message with context
   */
  private buildUserMessage(prompt: string, config: PromptEnhancerConfig): string {
    return `Please enhance this audio generation prompt and provide naming metadata.

USER PROMPT: "${prompt}"

CONTEXT:
- Target duration: ${config.duration} seconds
- Quality setting: ${config.quality}
- Output format: Professional audio sample

Enhance the prompt for optimal AI audio generation and provide the UCS category and filename.`;
  }

  /**
   * Build UCS-compliant filename
   * Format: CatID_FXName_CreatorID_SourceID
   */
  private buildFilename(category: string, fxName: string): string {
    const creatorId = 'SonaIA';
    const sourceId = 'StableAudio';
    
    // Ensure FX name is clean (PascalCase, no spaces or special chars)
    const cleanFxName = fxName
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\w/, c => c.toUpperCase());

    return `${category}_${cleanFxName}_${creatorId}_${sourceId}`;
  }

  /**
   * Create a fallback result when OpenAI fails
   */
  private createFallbackResult(userPrompt: string): EnhancedPromptData {
    // Extract a simple name from the prompt
    const words = userPrompt
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3);
    
    const fxName = words.length > 0 
      ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
      : 'GeneratedSound';

    const filename = `GEN_${fxName}_SonaIA_StableAudio`;

    logger.warn('Using fallback prompt enhancement', { filename });

    return {
      originalPrompt: userPrompt,
      enhancedPrompt: userPrompt, // Use original as fallback
      filename,
      ucsCategory: 'GEN',
      fxName,
    };
  }
}
