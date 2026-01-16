/**
 * Creator Mode Utilities
 * 
 * Helper functions for Creator mode.
 * Main prompt building is in classification-prompts.ts
 */

/**
 * Generate artist prefix from user email
 * Uses first 2 letters of email username, uppercase
 * 
 * @example
 * getArtistPrefix('john.doe@example.com') // 'JO'
 * getArtistPrefix('sarah@test.com') // 'SA'
 */
export function getArtistPrefix(userEmail: string | null | undefined): string | undefined {
    if (!userEmail) return undefined;
    
    const emailPart = userEmail.split('@')[0];
    if (!emailPart || emailPart.length < 2) return undefined;
    
    return emailPart.substring(0, 2).toUpperCase();
}
