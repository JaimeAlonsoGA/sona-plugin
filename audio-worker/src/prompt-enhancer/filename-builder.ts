/**
 * Filename Builder
 * 
 * Builds filenames from metadata using naming conventions
 * Supports UCS, musical, and creator mode parameters
 */

import { PromptMetadata } from './types.js';
import { NamingConventionConfig } from '../types.js';
import { logger } from '../logger.js';

/**
 * Format date according to format string
 */
function formatDate(format?: string): string {
    const d = new Date();
    const fmt = format || 'YYYYMMDD';
    return fmt
        .replace('YYYY', d.getFullYear().toString())
        .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', d.getDate().toString().padStart(2, '0'));
}

/**
 * Generate a short unique ID (6 characters)
 */
function generateShortId(): string {
    return Math.random().toString(36).substr(2, 6);
}

/**
 * Sanitize a filename part
 * - Removes non-alphanumeric characters
 * - Capitalizes first letter
 */
function sanitizeFilenamePart(value: string): string {
    return value
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Get the value for a parameter type from metadata
 */
function getParameterValue(
    type: string,
    metadata: PromptMetadata,
    customValue?: string,
    format?: string
): string {
    switch (type) {
        // UCS / Sound Design parameters
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

        // Musical parameters (Producer mode)
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

        // Creator mode parameters (AES naming)
        case 'artistPrefix':
            return metadata.artistPrefix || 'SN';
        case 'songName':
            return metadata.fx_name || 'Song';  // Use fx_name as song name
        case 'master':
            return customValue || 'Master';
        case 'sampleRate':
            return customValue || '44k';
        case 'bitDepth':
            return customValue || '16b';

        // Meta parameters
        case 'creator':
            return 'Sona';
        case 'source':
            return 'TangoFlux';
        case 'date':
            return formatDate(format);
        case 'timestamp':
            return Date.now().toString();
        case 'uuid':
            return generateShortId();
        case 'custom':
            return customValue || '';

        default:
            return '';
    }
}

/**
 * Build filename from metadata using the naming convention
 * 
 * @param metadata - The prompt metadata with extracted values
 * @param convention - The naming convention configuration
 * @returns The formatted filename (without extension)
 */
export function buildFilename(
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
        const value = getParameterValue(param.type, metadata, param.value, param.format);
        logger.debug(`Parameter ${param.type} = "${value}"`);
        if (value) {
            parts.push(sanitizeFilenamePart(value));
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
