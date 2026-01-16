/**
 * Classification Prompt Builders
 * 
 * Builds prompts for generating naming metadata (catId, fx_name, etc.)
 * These prompts are sent to GPT to classify the audio and extract
 * metadata used for filename generation.
 * 
 * Note: These do NOT modify the user's prompt - they only classify it.
 * Prompt enhancement is handled separately by the Edge Function.
 */

import { NamingGeneratorConfig, FALLBACK_UCS_CATEGORIES } from '../types.js';
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
 * Classification prompt for Designer mode (Sound Design / SFX)
 * 
 * Classifies the sound and generates naming metadata without modifying the prompt.
 */
export function buildDesignerClassificationPrompt(
    userPrompt: string,
    _config: NamingGeneratorConfig,
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
 * Classification prompt for Producer mode (Loops)
 * 
 * Extracts musical metadata for naming without modifying the prompt.
 */
export function buildProducerClassificationPrompt(
    userPrompt: string,
    config: NamingGeneratorConfig
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
 * Classification prompt for Creator mode (Songs)
 * 
 * Extracts musical metadata for naming without modifying the prompt.
 */
export function buildCreatorClassificationPrompt(
    userPrompt: string,
    config: NamingGeneratorConfig
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
