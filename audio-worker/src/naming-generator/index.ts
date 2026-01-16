/**
 * Naming Generator Service
 * 
 * Generates naming convention metadata for audio files.
 * Creates UCS-compliant filenames based on prompt classification.
 * 
 * Architecture:
 * 
 * 1. Prompt Enhancement → Edge Function `enhance-prompt`
 *    - User-initiated, optional, costs 1 token
 *    - Done BEFORE job submission
 *    - Returns only enhanced text, shown in user's input
 * 
 * 2. Naming/Filename Generation → This service
 *    - Called by worker during job processing
 *    - Classifies prompt and generates UCS-compliant filenames
 *    - Can be skipped if user disables naming (createSimpleResult)
 * 
 * Files:
 * - types.ts: Shared types and schemas
 * - builders/classification-prompts.ts: Mode-specific classification prompts
 * - filename-builder.ts: Filename generation from metadata
 */

import OpenAI from 'openai';
import { WorkerConfig, NamingConventionConfig } from '../types.js';
import { logger } from '../logger.js';
import { getUCSRagService, UCSRagService, RetrievedUCSContext } from '../ucs-rag.js';

// Types
import {
    NamingMetadata,
    NamingMetadataSchema,
    NamingResult,
    NamingGeneratorConfig,
    DEFAULT_NAMING,
} from './types.js';

// Classification prompt builders
import {
    getArtistPrefix,
    buildDesignerClassificationPrompt,
    buildProducerClassificationPrompt,
    buildCreatorClassificationPrompt,
} from './builders/index.js';

// Filename builder
import { buildFilename } from './filename-builder.js';

// Re-export types for external use
export type {
    NamingMetadata,
    NamingResult,
    NamingGeneratorConfig,
} from './types.js';

// Legacy type aliases for backward compatibility
export type { PromptMetadata, EnhancedPromptData, PromptEnhancerConfig } from './types.js';

/**
 * Naming Generator Service
 * 
 * Generates naming convention metadata for audio files.
 * Classifies prompts and builds UCS-compliant filenames.
 */
export class NamingGeneratorService {
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
     * Build classification prompt based on mode
     * Used to generate metadata for filename (no prompt modification)
     */
    private buildClassificationPrompt(
        userPrompt: string,
        config: NamingGeneratorConfig,
        mode: string,
        ucsContext: RetrievedUCSContext | null
    ): string {
        switch (mode) {
            case 'creator':
                return buildCreatorClassificationPrompt(userPrompt, config);
            case 'producer':
                return buildProducerClassificationPrompt(userPrompt, config);
            case 'designer':
            default:
                return buildDesignerClassificationPrompt(userPrompt, config, ucsContext);
        }
    }

    /**
     * Generate naming convention metadata
     * 
     * Called during job processing to generate UCS-compliant filenames.
     * Classifies the prompt to extract metadata for filename generation.
     * The prompt text is NOT modified - only metadata is extracted.
     * 
     * @param userPrompt - The prompt to classify (may already be enhanced via Edge Function)
     * @param config - Configuration including naming convention settings
     */
    async generateNaming(
        userPrompt: string,
        config: NamingGeneratorConfig
    ): Promise<NamingResult> {
        const startTime = Date.now();
        const mode = config.mode || 'designer';

        // Check if we need UCS retrieval based on naming convention
        const needsUCS = this.needsUCSRetrieval(config.namingConvention);

        try {
            logger.info('Generating naming metadata...', {
                promptLength: userPrompt.length,
                mode,
                hasNamingConvention: !!config.namingConvention,
                needsUCS,
            });

            // Retrieve UCS context via RAG if needed (only for designer mode)
            let ucsContext: RetrievedUCSContext | null = null;
            if (needsUCS && mode === 'designer' && this.ucsRag.ready) {
                ucsContext = await this.ucsRag.retrieve(userPrompt, 5);
                logger.debug('UCS RAG context retrieved for naming', {
                    entriesCount: ucsContext.entries.length,
                    topCatIds: ucsContext.entries.map(e => e.catId),
                });
            }

            // Build classification prompt (focused on metadata extraction)
            const prompt = this.buildClassificationPrompt(userPrompt, config, mode, ucsContext);

            // Call OpenAI Responses API
            const response = await this.client.responses.create({
                model: this.model,
                input: prompt,
                reasoning: { effort: 'minimal' },
                text: { verbosity: 'low' },
                max_output_tokens: 300,
            });

            const content = response.output_text;
            if (!content) {
                throw new Error('Empty response from OpenAI Responses API');
            }

            // Clean and parse JSON response
            let jsonContent = content.trim();
            if (jsonContent.startsWith('```')) {
                jsonContent = jsonContent.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
            }

            const parsed = JSON.parse(jsonContent);
            const namingResponse = NamingMetadataSchema.parse(parsed);

            // Resolve UCS category/subcategory from catId
            const ucsEntry = this.ucsRag.lookupByCatId(namingResponse.catId);

            // Generate artist prefix for Creator mode
            const artistPrefix = mode === 'creator' 
                ? getArtistPrefix(config.userEmail) 
                : undefined;

            // Build full metadata
            const metadata: NamingMetadata = {
                ...namingResponse,
                prompt: userPrompt, // Pass through original/enhanced prompt
                category: ucsEntry?.category || namingResponse.catId.substring(0, 4).toUpperCase(),
                subcategory: ucsEntry?.subCategory || '',
                ...(artistPrefix && { artistPrefix }),
            };

            // Build filename using naming convention
            const namingConfig = config.namingConvention || DEFAULT_NAMING;
            const filename = buildFilename(metadata, namingConfig);

            const result: NamingResult = {
                originalPrompt: userPrompt,
                processedPrompt: userPrompt, // Prompt unchanged by this service
                filename,
                metadata,
            };

            const elapsed = Date.now() - startTime;
            logger.info(`Naming generated successfully in ${elapsed}ms`, {
                filename: result.filename,
                mode,
            });

            return result;
        } catch (error) {
            logger.error('Failed to generate naming:', error);
            return this.createFallbackResult(userPrompt, config);
        }
    }

    /**
     * Create fallback result when OpenAI fails
     */
    private createFallbackResult(
        userPrompt: string,
        config: NamingGeneratorConfig
    ): NamingResult {
        const words = userPrompt
            .replace(/[^a-zA-Z\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
            .slice(0, 3);

        const fxName = words.length > 0
            ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
            : 'GeneratedSound';

        const mode = config.mode || 'designer';
        const artistPrefix = mode === 'creator' 
            ? getArtistPrefix(config.userEmail) 
            : undefined;

        const fallbackMetadata: NamingMetadata = {
            prompt: userPrompt,
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
            ...(artistPrefix && { artistPrefix }),
        };

        // Ensure namingConfig has valid parameters array
        let namingConfig = config.namingConvention;
        if (!namingConfig || !Array.isArray(namingConfig.parameters)) {
            namingConfig = DEFAULT_NAMING;
        }
        const filename = buildFilename(fallbackMetadata, namingConfig);

        logger.warn('Using fallback naming', { filename, mode });

        return {
            originalPrompt: userPrompt,
            processedPrompt: userPrompt,
            filename,
            metadata: fallbackMetadata,
        };
    }

    /**
     * Create simple result when naming convention is skipped
     * Uses raw prompt with a basic generated filename (no GPT call)
     */
    createSimpleResult(
        userPrompt: string,
        config: NamingGeneratorConfig
    ): NamingResult {
        const mode = config.mode || 'designer';
        const timestamp = Date.now();
        
        // Generate a simple filename from prompt words + timestamp
        const words = userPrompt
            .replace(/[^a-zA-Z\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
            .slice(0, 3);

        const baseName = words.length > 0
            ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
            : 'Sound';

        // Simple filename: Mode_Name_Timestamp
        const filename = `${mode.charAt(0).toUpperCase() + mode.slice(1)}_${baseName}_${timestamp.toString(36)}`;

        const artistPrefix = mode === 'creator' 
            ? getArtistPrefix(config.userEmail) 
            : undefined;

        const simpleMetadata: NamingMetadata = {
            prompt: userPrompt,
            catId: 'GEN',
            category: 'GEN',
            subcategory: '',
            fx_name: baseName,
            object: '',
            action: '',
            instrument: '',
            type: '',
            bpm: '',
            key: '',
            scale: '',
            ...(artistPrefix && { artistPrefix }),
        };

        logger.info('Skipping naming convention, using simple filename', { 
            filename, 
            mode,
        });

        return {
            originalPrompt: userPrompt,
            processedPrompt: userPrompt,
            filename,
            metadata: simpleMetadata,
        };
    }
}

// Legacy alias for backward compatibility
/** @deprecated Use NamingGeneratorService instead */
export const PromptEnhancerService = NamingGeneratorService;
