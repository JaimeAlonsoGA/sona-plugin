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
import { WorkerConfig, QualityLevel, NamingConventionConfig, MusicalKey, ProducerConfig } from './types.js';
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
// Note: LLM returns catId, we then resolve category/subcategory from UCS data
// Fields are optional with defaults since designer/producer modes return different structures
const PromptMetadataSchema = z.object({
    enhanced_prompt: z.string().describe('Refined prompt with technical audio vocabulary'),
    // Sound design metadata - catId contains both category and subcategory info
    catId: z.string().describe('UCS CatID (e.g., WATRFlow, AIRBlow, AMBQuiet)'),
    fx_name: z.string().describe('Descriptive name in PascalCase'),
    // Designer mode fields (optional for producer mode)
    object: z.string().optional().default('').describe('Sound source/object'),
    action: z.string().optional().default('').describe('Action/verb descriptor'),
    // Musical metadata (optional for designer mode)
    instrument: z.string().optional().default('').describe('Instrument type if musical'),
    type: z.string().optional().default('').describe('Sound type (Lead, Pad, Bass, Stab, etc.)'),
    bpm: z.string().optional().default('').describe('Suggested BPM if rhythmic, empty if not'),
    key: z.string().optional().default('').describe('Musical key if tonal (C, Csharp, D, etc.), empty if not'),
    scale: z.string().optional().default('').describe('Scale type if applicable (Major, Minor)'),
});

// Raw response from LLM
type LLMResponse = z.infer<typeof PromptMetadataSchema>;

// Extended metadata with resolved UCS category/subcategory
export interface PromptMetadata extends LLMResponse {
    category: string;      // Resolved from catId (e.g., "WATER")
    subcategory: string;   // Resolved from catId (e.g., "FLOW")
}

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
    /** Musical key for the generation (if user specified) */
    musicalKey?: MusicalKey | null;
    /** Producer mode configuration */
    producerConfig?: ProducerConfig | null;
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
            const llmResponse = PromptMetadataSchema.parse(parsed);

            // Resolve category/subcategory from catId using UCS lookup
            const ucsEntry = this.ucsRag.lookupByCatId(llmResponse.catId);

            // Build full metadata with resolved category/subcategory
            const metadata: PromptMetadata = {
                ...llmResponse,
                category: ucsEntry?.category || llmResponse.catId.substring(0, 4).toUpperCase(),
                subcategory: ucsEntry?.subCategory || '',
            };

            logger.debug('UCS category resolved', {
                catId: llmResponse.catId,
                category: metadata.category,
                subcategory: metadata.subcategory,
                foundInUCS: !!ucsEntry,
            });

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
     * Optimized prompts based on mode (designer vs producer)
     * Note: Duration and quality are NOT included - they go as API parameters to Stable Audio
     */
    private buildPrompt(
        userPrompt: string,
        config: PromptEnhancerConfig,
        mode: string,
        ucsContext: RetrievedUCSContext | null
    ): string {
        const isProducer = mode === 'producer';

        // Build UCS context section (only for designer mode)
        let ucsSection = '';
        if (!isProducer) {
            if (ucsContext && ucsContext.entries.length > 0) {
                ucsSection = `${ucsContext.formatted}\nUse CatID exactly.`;
            } else {
                const categories = Object.entries(FALLBACK_UCS_CATEGORIES)
                    .map(([id, name]) => `${id}: ${name}`)
                    .join(', ');
                ucsSection = `UCS: ${categories}`;
            }
        }

        // Mode-specific prompts (minimal tokens)
        if (isProducer) {
            // Producer mode: musical elements, BPM, time signature, key
            const bpm = config.producerConfig?.bpm?.toString() || '';
            const timeSig = config.producerConfig?.timeSignature || '4/4';
            
            // Debug logging to track producer config values
            logger.debug('Building producer prompt', {
                rawProducerConfig: config.producerConfig,
                bpm,
                timeSig,
                musicalKey: config.musicalKey,
            });
            
            // Build context line with musical parameters (these are FIXED by user)
            const fixedParams: string[] = [];
            if (bpm) fixedParams.push(`BPM=${bpm}`);
            if (timeSig) fixedParams.push(`TimeSignature=${timeSig}`);
            
            // Key is optional - only include if user specified
            const keyVal = config.musicalKey?.key?.replace('#', 'sharp') || '';
            const scaleVal = config.musicalKey?.scale || '';
            if (keyVal) fixedParams.push(`Key=${keyVal} ${scaleVal}`);

            const fixedSection = fixedParams.length > 0 
                ? `\nFIXED (do not change): ${fixedParams.join(', ')}` 
                : '';

            return `Enhance prompt for music production. Return JSON only.

PROMPT: "${userPrompt}"${fixedSection}

JSON (use exact fixed values, do not invent key if not provided):
{"enhanced_prompt":"<enhanced prompt>","catId":"MUSCPerc","fx_name":"<PascalCase>","instrument":"<instrument>","type":"<Lead/Pad/Bass/Perc>","bpm":"${bpm}","key":"${keyVal}","scale":"${scaleVal}"}`;
        }

        // Designer mode: sound design with UCS, optional key
        const keyVal = config.musicalKey?.key?.replace('#', 'sharp') || '';
        const scaleVal = config.musicalKey?.scale || '';
        const keyContext = keyVal ? `\nFIXED Key: ${keyVal} ${scaleVal}` : '';
        
        return `Enhance prompt for sound design. Return JSON only.

${ucsSection}

PROMPT: "${userPrompt}"${keyContext}

JSON${keyVal ? ' (use exact key value)' : ''}:
{"enhanced_prompt":"<improved prompt>","catId":"<CatID>","fx_name":"<PascalCase>","object":"<source>","action":"<verb>","key":"${keyVal}","scale":"${scaleVal}"}`;
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
            catId: 'GEN',
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
