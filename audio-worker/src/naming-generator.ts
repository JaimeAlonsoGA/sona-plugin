/**
 * Naming Generator Service
 * 
 * Re-exports from modular structure for backward compatibility.
 * 
 * Architecture:
 * - ./naming-generator/types.ts - Shared types, schemas, constants
 * - ./naming-generator/builders/ - Mode-specific classification prompt builders
 *   - classification-prompts.ts - Designer, Producer, Creator classification
 *   - creator.ts - Creator mode utilities (artist prefix)
 * - ./naming-generator/filename-builder.ts - Filename generation from metadata
 * - ./naming-generator/index.ts - Main NamingGeneratorService
 */

export { NamingGeneratorService } from './naming-generator/index.js';
export type {
    NamingMetadata,
    NamingResult,
    NamingGeneratorConfig,
} from './naming-generator/index.js';

// Legacy aliases for backward compatibility
export { PromptEnhancerService } from './naming-generator/index.js';
export type {
    PromptMetadata,
    EnhancedPromptData,
    PromptEnhancerConfig,
} from './naming-generator/index.js';
