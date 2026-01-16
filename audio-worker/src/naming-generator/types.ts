/**
 * Naming Generator Types
 * 
 * Shared types and schemas for filename/naming generation.
 * Note: Prompt enhancement is handled by Edge Function, 
 * this service only generates naming metadata for filenames.
 */

import { z } from 'zod';
import { QualityLevel, NamingConventionConfig, MusicalKey, ProducerConfig, DurationPreset } from '../types.js';

// Zod schema for naming responses from GPT
// Only classification metadata for filename generation
export const NamingMetadataSchema = z.object({
    catId: z.string().describe('UCS CatID (e.g., WATRFlow, AIRBlow, AMBQuiet)'),
    fx_name: z.string().describe('Descriptive name in PascalCase'),
    // Designer mode fields
    object: z.string().optional().default('').describe('Sound source/object'),
    action: z.string().optional().default('').describe('Action/verb descriptor'),
    // Musical metadata
    instrument: z.string().optional().default('').describe('Instrument type if musical'),
    type: z.string().optional().default('').describe('Sound type (Lead, Pad, Bass, Stab, etc.)'),
    bpm: z.string().optional().default('').describe('Suggested BPM if rhythmic'),
    key: z.string().optional().default('').describe('Musical key if tonal'),
    scale: z.string().optional().default('').describe('Scale type if applicable'),
});

// Raw response for naming metadata
export type NamingMetadataResponse = z.infer<typeof NamingMetadataSchema>;

// Full metadata with resolved UCS category/subcategory
export interface NamingMetadata extends NamingMetadataResponse {
    prompt: string;          // The prompt (original or enhanced via Edge Function)
    category: string;        // Resolved from catId (e.g., "WATER")
    subcategory: string;     // Resolved from catId (e.g., "FLOW")
    artistPrefix?: string;   // First 2 letters of user email (for Creator mode)
}

export interface NamingResult {
    originalPrompt: string;
    processedPrompt: string;
    filename: string;
    metadata: NamingMetadata;
}

export interface NamingGeneratorConfig {
    duration: number;
    quality: QualityLevel;
    mode?: string;
    namingConvention?: NamingConventionConfig | null;
    /** Musical key for the generation (if user specified) */
    musicalKey?: MusicalKey | null;
    /** Producer mode configuration */
    producerConfig?: ProducerConfig | null;
    /** Duration preset for Designer mode (short/medium/long) */
    durationPreset?: DurationPreset | null;
    /** User email for Creator mode (used for artist prefix) */
    userEmail?: string | null;
}

// Default UCS naming convention
export const DEFAULT_NAMING: NamingConventionConfig = {
    parameters: [
        { type: 'category' },
        { type: 'fxName' },
        { type: 'creator' },
        { type: 'source' },
    ],
    separator: '_',
};

// Fallback UCS categories (used when RAG is not available or not needed)
export const FALLBACK_UCS_CATEGORIES = {
    AMB: 'Ambience', ATM: 'Atmosphere', DRN: 'Drone', FLY: 'Foley',
    IMP: 'Impact', MUS: 'Music Element', NAT: 'Nature', SCI: 'Sci-Fi',
    SYN: 'Synthesizer', TXT: 'Texture', TRN: 'Transition', WHO: 'Whoosh',
    MCH: 'Mechanical', ELC: 'Electronic', VOC: 'Vocal', WPN: 'Weapon',
    WTR: 'Water', FIR: 'Fire', HOR: 'Horror', MAG: 'Magic', UI: 'UI', GEN: 'General',
} as const;

// Legacy type aliases for backward compatibility
/** @deprecated Use NamingMetadata instead */
export type PromptMetadata = NamingMetadata;
/** @deprecated Use NamingResult instead */
export type EnhancedPromptData = NamingResult;
/** @deprecated Use NamingGeneratorConfig instead */
export type PromptEnhancerConfig = NamingGeneratorConfig;
