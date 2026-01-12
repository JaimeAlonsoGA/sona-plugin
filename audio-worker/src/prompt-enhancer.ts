/**
 * Prompt Enhancer Service
 * 
 * Re-exports from modular structure for backward compatibility.
 * 
 * Architecture:
 * - ./prompt-enhancer/types.ts - Shared types, schemas, constants
 * - ./prompt-enhancer/builders/ - Mode-specific prompt builders
 *   - designer.ts - Sound design / SFX (TangoFlux)
 *   - producer.ts - Loops (Stable Audio 2.5)
 *   - creator.ts - Songs (Stable Audio 2.5)
 * - ./prompt-enhancer/filename-builder.ts - Filename generation
 * - ./prompt-enhancer/index.ts - Main PromptEnhancerService
 */

export { PromptEnhancerService } from './prompt-enhancer/index';
export type {
    PromptMetadata,
    EnhancedPromptData,
    PromptEnhancerConfig,
} from './prompt-enhancer/index';
