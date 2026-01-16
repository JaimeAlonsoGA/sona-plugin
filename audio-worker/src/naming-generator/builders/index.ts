/**
 * Naming Generator Builders Index
 * 
 * Classification prompt builders for generating naming metadata.
 * Note: These classify prompts for filename generation,
 * actual prompt enhancement is handled by Edge Function.
 */

// Artist prefix utility (used by Creator mode)
export { getArtistPrefix } from './creator.js';

// Classification prompt builders (for filename metadata extraction)
export {
    buildDesignerClassificationPrompt,
    buildProducerClassificationPrompt,
    buildCreatorClassificationPrompt,
} from './classification-prompts.js';
