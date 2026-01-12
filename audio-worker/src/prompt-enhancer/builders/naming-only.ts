/**
 * Naming-Only Prompt Builders
 * 
 * Builds prompts for ONLY generating naming metadata (catId, fx_name, etc.)
 * WITHOUT enhancing the user prompt. 
 * 
 * Used when:
 * - User has already enhanced their prompt via the enhance-prompt Edge Function
 * - Or user wants naming convention but chose not to enhance prompt
 * 
 * The key difference from full builders:
 * - No "enhanced_prompt" in output - we preserve the user's original/enhanced prompt
 * - Focus only on classification and naming metadata
 */

import { PromptEnhancerConfig, FALLBACK_UCS_CATEGORIES } from '../types.js';
import { RetrievedUCSContext } from '../../ucs-rag.js';

/**
 * Build UCS context section for designer mode
 */
function buildUCSSection(ucsContext: RetrievedUCSContext | null): string {
    if (ucsContext && ucsContext.entries.length > 0) {
        return `${ucsContext.formatted}\nUse CatID exactly.`;
    }
    
    const categories = Object.entries(FALLBACK_UCS_CATEGORIES)
        .map(([id, name]) => `${id}: ${name}`)
        .join(', ');
    return `UCS: ${categories}`;
}

/**
 * Naming-only prompt for Designer mode (Sound Design / SFX)
 * 
 * Classifies the sound and generates naming metadata without modifying the prompt.
 */
export function buildDesignerNamingPrompt(
    userPrompt: string,
    _config: PromptEnhancerConfig,
    ucsContext: RetrievedUCSContext | null
): string {
    const ucsSection = buildUCSSection(ucsContext);

    return `Classify this sound design prompt for file naming. Return JSON only.

${ucsSection}

SOUND PROMPT: "${userPrompt}"

JSON (classify the sound, generate naming metadata):
{"catId":"<CatID>","fx_name":"<PascalCase>","object":"<source>","action":"<verb>"}`;
}

/**
 * Naming-only prompt for Producer mode (Loops)
 * 
 * Extracts musical metadata for naming without modifying the prompt.
 */
export function buildProducerNamingPrompt(
    userPrompt: string,
    config: PromptEnhancerConfig
): string {
    const bpm = config.producerConfig?.bpm?.toString() || '120';
    const keyVal = config.musicalKey?.key?.replace('#', 'sharp') || '';
    const scaleVal = config.musicalKey?.scale || '';

    return `Classify this music loop prompt for file naming. Return JSON only.

LOOP PROMPT: "${userPrompt}"
BPM: ${bpm}${keyVal ? `, Key: ${keyVal} ${scaleVal}` : ''}

JSON (classify the loop, generate naming metadata):
{"catId":"MUSCPerc","fx_name":"<PascalCase>","instrument":"<instrument>","type":"loop","bpm":"${bpm}","key":"${keyVal}","scale":"${scaleVal}"}`;
}

/**
 * Naming-only prompt for Creator mode (Songs)
 * 
 * Extracts musical metadata for naming without modifying the prompt.
 */
export function buildCreatorNamingPrompt(
    userPrompt: string,
    config: PromptEnhancerConfig
): string {
    const bpm = config.producerConfig?.bpm?.toString() || '120';
    const keyVal = config.musicalKey?.key?.replace('#', 'sharp') || '';
    const scaleVal = config.musicalKey?.scale || '';

    return `Classify this song prompt for file naming. Return JSON only.

SONG PROMPT: "${userPrompt}"
BPM: ${bpm}${keyVal ? `, Key: ${keyVal} ${scaleVal}` : ''}

JSON (classify the song, generate naming metadata):
{"catId":"MUSCSong","fx_name":"<SongNamePascalCase>","instrument":"<primary-instrument>","type":"song","bpm":"${bpm}","key":"${keyVal}","scale":"${scaleVal}"}`;
}
