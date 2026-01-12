/**
 * Prompt Builders Index
 * 
 * Naming-only builders for classification/naming metadata generation.
 * Prompt enhancement is now handled by Edge Function (enhance-prompt).
 */

// Artist prefix utility (used by Creator mode)
export { getArtistPrefix } from './creator.js';

// Naming-only builders (classification, no prompt modification)
export {
    buildDesignerNamingPrompt,
    buildProducerNamingPrompt,
    buildCreatorNamingPrompt,
} from './naming-only.js';
