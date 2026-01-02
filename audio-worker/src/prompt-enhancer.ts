/**
 * Prompt Enhancer Service
 * 
 * Uses OpenAI to:
 * 1. Refine and enhance user prompts for better audio generation
 * 2. Generate metadata for filename based on user's naming convention
 * 
 * When UCS category/subcategory is needed in the naming convention,
 * uses RAG to retrieve relevant UCS entries instead of sending the full JSON.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { WorkerConfig, QualityLevel, NamingConventionConfig } from './types.js';
import { logger } from './logger.js';
import { getUCSRagService, UCSRagService, RetrievedUCSContext } from './ucs-rag.js';

// Fallback UCS categories (used when RAG is not available or not needed)
const FALLBACK_UCS_CATEGORIES = {
  AMB: 'Ambience', ATM: 'Atmosphere', DRN: 'Drone', FLY: 'Foley',
  IMP: 'Impact', MUS: 'Music Element', NAT: 'Nature', SCI: 'Sci-Fi',
  SYN: 'Synthesizer', TXT: 'Texture', TRN: 'Transition', WHO: 'Whoosh',
  MCH: 'Mechanical', ELC: 'Electronic', VOC: 'Vocal', WPN: 'Weapon',
  WTR: 'Water', FIR: 'Fire', HOR: 'Horror', MAG: 'Magic', UI: 'UI', GEN: 'General',
} as const;

// Zod schema for OpenAI response - comprehensive metadata extraction
const PromptMetadataSchema = z.object({
  enhanced_prompt: z.string().describe('Refined prompt with technical audio vocabulary'),
  // Sound design metadata
  category: z.string().describe('UCS category ID (e.g., SYN, AMB, IMP)'),
  subcategory: z.string().describe('More specific subcategory'),
  fx_name: z.string().describe('Descriptive name in PascalCase'),
  object: z.string().describe('Sound source/object'),
  action: z.string().describe('Action/verb descriptor'),
  // Musical metadata
  instrument: z.string().describe('Instrument type if musical'),
  type: z.string().describe('Sound type (Lead, Pad, Bass, Stab, etc.)'),
  bpm: z.string().describe('Suggested BPM if rhythmic, empty if not'),
  key: z.string().describe('Musical key if tonal (C, Csharp, D, etc.), empty if not'),
  scale: z.string().describe('Scale type if applicable (Major, Minor)'),
});

export type PromptMetadata = z.infer<typeof PromptMetadataSchema>;

export interface EnhancedPromptData {
  originalPrompt: string;
  enhancedPrompt: string;
  filename: string;
  metadata: PromptMetadata;
}

export interface PromptEnhancerConfig {
  duration: number;
  quality: QualityLevel;
  mode?: string;
  namingConvention?: NamingConventionConfig | null;
}

// Default UCS naming convention
const DEFAULT_NAMING: NamingConventionConfig = {
  parameters: [
    { type: 'category' },
    { type: 'fxName' },
    { type: 'creator' },
    { type: 'source' },
  ],
  separator: '_',
};

export class PromptEnhancerService {
  private client: OpenAI;
  private model: string = 'gpt-5-nano-2025-08-07';
  private ucsRag: UCSRagService;

  constructor(config: WorkerConfig) {
    this.client = new OpenAI({
      apiKey: config.openAiApiKey,
    });
    this.ucsRag = getUCSRagService(config.openAiApiKey);
  }

  /**
   * Check if naming convention requires UCS category or subcategory
   */
  private needsUCSRetrieval(namingConvention: NamingConventionConfig | null | undefined): boolean {
    if (!namingConvention?.parameters) return false;
    
    const ucsParams = ['category', 'subcategory'];
    return namingConvention.parameters.some(p => ucsParams.includes(p.type));
  }

  /**
   * Enhance prompt and generate filename based on naming convention
   * Uses OpenAI Responses API with gpt-5-nano for fast classification
   * When UCS is needed, retrieves relevant categories via RAG
   */
  async enhancePrompt(
    userPrompt: string,
    config: PromptEnhancerConfig
  ): Promise<EnhancedPromptData> {
    const startTime = Date.now();
    const mode = config.mode || 'designer';
    
    // Check if we need UCS retrieval based on naming convention
    const needsUCS = this.needsUCSRetrieval(config.namingConvention);
    
    try {
      logger.info('Enhancing prompt with OpenAI Responses API...', { 
        promptLength: userPrompt.length,
        duration: config.duration,
        quality: config.quality,
        mode,
        hasNamingConvention: !!config.namingConvention,
        needsUCS,
      });

      // Retrieve UCS context via RAG if needed
      let ucsContext: RetrievedUCSContext | null = null;
      if (needsUCS && this.ucsRag.ready) {
        ucsContext = await this.ucsRag.retrieve(userPrompt, 5);
        logger.debug('UCS RAG context retrieved', {
          entriesCount: ucsContext.entries.length,
          topCatIds: ucsContext.entries.map(e => e.catId),
        });
      }

      // Build prompt with or without UCS context
      const prompt = this.buildPrompt(userPrompt, config, mode, ucsContext);

      // Use Responses API for GPT-5 family models
      // gpt-5-nano is optimized for high-throughput simple tasks
      const response = await this.client.responses.create({
        model: this.model,
        input: prompt,
        // Minimal reasoning for simple classification/enhancement
        // gpt-5-nano supports: 'minimal', 'low', 'medium', 'high'
        reasoning: { effort: 'minimal' },
        // Low verbosity for concise JSON output
        text: { verbosity: 'low' },
        max_output_tokens: 500,
      });

      // Debug log the response structure
      logger.debug('OpenAI Responses API response received', {
        id: response.id,
        model: response.model,
        status: response.status,
        hasOutput: !!response.output_text,
        outputLength: response.output_text?.length || 0,
      });

      const content = response.output_text;
      
      if (!content) {
        throw new Error('Empty response from OpenAI Responses API');
      }

      // Clean content - remove markdown code blocks if present
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }

      // Parse and validate with Zod
      const parsed = JSON.parse(jsonContent);
      const metadata = PromptMetadataSchema.parse(parsed);

      // Build filename using user's naming convention or default
      const namingConfig = config.namingConvention || DEFAULT_NAMING;
      const filename = this.buildFilename(metadata, namingConfig);

      const result: EnhancedPromptData = {
        originalPrompt: userPrompt,
        enhancedPrompt: metadata.enhanced_prompt,
        filename,
        metadata,
      };

      const elapsed = Date.now() - startTime;
      logger.info(`Prompt enhanced successfully in ${elapsed}ms`, {
        filename: result.filename,
        enhancedPromptLength: result.enhancedPrompt.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to enhance prompt:', error);
      return this.createFallbackResult(userPrompt, config);
    }
  }

  /**
   * Build the combined prompt for Responses API
   * Uses RAG-retrieved UCS context when available, otherwise falls back to basic categories
   */
  private buildPrompt(
    userPrompt: string, 
    config: PromptEnhancerConfig, 
    mode: string,
    ucsContext: RetrievedUCSContext | null
  ): string {
    const modeContext = mode === 'producer' 
      ? 'Focus on musical elements: instrument, type, BPM, key.'
      : 'Focus on sound design: category, object, action.';

    // Build UCS context section
    let ucsSection: string;
    if (ucsContext && ucsContext.entries.length > 0) {
      // Use RAG-retrieved entries - LLM must choose from these
      ucsSection = `${ucsContext.formatted}

IMPORTANT: You MUST select category from the above list. Use the CatID value (e.g., "AIRBlow", "AMBQuiet").`;
    } else {
      // Fallback to basic categories when RAG not available
      const categories = Object.entries(FALLBACK_UCS_CATEGORIES)
        .map(([id, name]) => `${id}: ${name}`)
        .join(', ');
      ucsSection = `UCS Categories: ${categories}`;
    }

    return `You are a sound designer. Analyze this audio prompt and return JSON only.

${modeContext}

${ucsSection}

PROMPT: "${userPrompt}"
Duration: ${config.duration}s

Return this exact JSON structure (no markdown, no explanation):
{"enhanced_prompt":"<improved prompt for AI audio generation>","category":"<UCS CatID from above>","subcategory":"<specific type>","fx_name":"<PascalCase name>","object":"<sound source>","action":"<action verb>","instrument":"<if musical>","type":"<Lead/Pad/Bass/etc>","bpm":"<if rhythmic>","key":"<if tonal>","scale":"<Major/Minor>"}

Use empty strings for non-applicable fields.`;
  }

  /**
   * Build filename from metadata using the naming convention
   */
  private buildFilename(
    metadata: PromptMetadata,
    convention: NamingConventionConfig
  ): string {
    const parts: string[] = [];
    
    // Validate convention has parameters array
    const parameters = Array.isArray(convention?.parameters) ? convention.parameters : [];
    
    logger.debug('Building filename with convention', {
      parametersCount: parameters.length,
      parameters: parameters.map(p => p.type),
      separator: convention?.separator,
    });
    
    for (const param of parameters) {
      const value = this.getParameterValue(param.type, metadata, param.value, param.format);
      logger.debug(`Parameter ${param.type} = "${value}"`);
      if (value) {
        parts.push(this.sanitizeFilenamePart(value));
      }
    }

    // Ensure we have at least something
    if (parts.length === 0) {
      parts.push(metadata.category || 'GEN');
      parts.push(metadata.fx_name || 'Sound');
    }
    
    const filename = parts.join(convention?.separator || '_');
    logger.debug('Final filename parts', { parts, filename });

    return filename;
  }

  /**
   * Get the value for a parameter type
   */
  private getParameterValue(
    type: string,
    metadata: PromptMetadata,
    customValue?: string,
    format?: string
  ): string {
    switch (type) {
      case 'category':
        return metadata.category || 'GEN';
      case 'subcategory':
        return metadata.subcategory || '';
      case 'fxName':
        return metadata.fx_name || 'Sound';
      case 'object':
        return metadata.object || '';
      case 'action':
        return metadata.action || '';
      case 'variation':
        return '01';
      case 'instrument':
        return metadata.instrument || '';
      case 'type':
        return metadata.type || '';
      case 'bpm':
        return metadata.bpm || '';
      case 'key':
        return metadata.key || '';
      case 'scale':
        return metadata.scale || '';
      case 'creator':
        return 'SonaIA';
      case 'source':
        return 'StableAudio';
      case 'date':
        return this.formatDate(format);
      case 'timestamp':
        return Date.now().toString();
      case 'uuid':
        return this.generateShortId();
      case 'custom':
        return customValue || '';
      default:
        return '';
    }
  }

  /**
   * Format date according to format string
   */
  private formatDate(format?: string): string {
    const d = new Date();
    const fmt = format || 'YYYYMMDD';
    return fmt
      .replace('YYYY', d.getFullYear().toString())
      .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', d.getDate().toString().padStart(2, '0'));
  }

  /**
   * Generate a short unique ID
   */
  private generateShortId(): string {
    return Math.random().toString(36).substr(2, 6);
  }

  /**
   * Sanitize a filename part
   */
  private sanitizeFilenamePart(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Create fallback result when OpenAI fails
   */
  private createFallbackResult(
    userPrompt: string,
    config: PromptEnhancerConfig
  ): EnhancedPromptData {
    const words = userPrompt
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3);
    
    const fxName = words.length > 0 
      ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
      : 'GeneratedSound';

    const fallbackMetadata: PromptMetadata = {
      enhanced_prompt: userPrompt,
      category: 'GEN',
      subcategory: '',
      fx_name: fxName,
      object: '',
      action: '',
      instrument: '',
      type: '',
      bpm: '',
      key: '',
      scale: '',
    };

    // Ensure namingConfig has valid parameters array
    let namingConfig = config.namingConvention;
    if (!namingConfig || !Array.isArray(namingConfig.parameters)) {
      namingConfig = DEFAULT_NAMING;
    }
    const filename = this.buildFilename(fallbackMetadata, namingConfig);

    logger.warn('Using fallback prompt enhancement', { filename });

    return {
      originalPrompt: userPrompt,
      enhancedPrompt: userPrompt,
      filename,
      metadata: fallbackMetadata,
    };
  }
}
