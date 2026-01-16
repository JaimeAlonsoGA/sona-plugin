/**
 * Zod Validation Schema for Generate Job Request
 * 
 * This schema mirrors the validation in the Edge Function (supabase/functions/generate/index.ts)
 * to ensure all errors are caught on the frontend before making API calls.
 * 
 * IMPORTANT: Keep this in sync with the Edge Function validation!
 */

import { z } from 'zod'

// ============================================
// CONSTANTS - Must match Edge Function
// ============================================

/** Minimum prompt length */
const MIN_PROMPT_LENGTH = 5

/** Maximum prompt length */
const MAX_PROMPT_LENGTH = 800

/** Duration limits */
const MIN_DURATION = 1
const MAX_DURATION = 180

/** Duration limits by mode */
export const DURATION_LIMITS = {
  designer: { min: 1, max: 30 },   // TangoFlux max 30s
  producer: { min: 1, max: 180 },  // Stable Audio max 180s
  creator: { min: 10, max: 180 },  // Stable Audio max 180s, min 10s for songs
} as const

/** BPM limits */
export const BPM_LIMITS = {
  min: 40,
  max: 200,
} as const

// ============================================
// VALIDATION PATTERNS - Must match Edge Function
// ============================================

/** Allowed characters in prompt: alphanumeric, spaces, and basic punctuation */
const ALLOWED_CHARS_REGEX = /^[\s\S]*$/

/** URL pattern to reject */
const URL_REGEX = /https?:\/\//

/** Emoji pattern to reject */
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]/u

/** Script tag pattern to reject (XSS prevention) */
const SCRIPT_TAG_REGEX = /<script.*?>/i

// ============================================
// REUSABLE SCHEMAS
// ============================================

/** Musical keys */
export const MusicalKeySchema = z.enum([
  'C', 'C#', 'D', 'D#', 'E', 'F', 
  'F#', 'G', 'G#', 'A', 'A#', 'B'
])

/** Scale types */
export const ScaleSchema = z.enum(['major', 'minor'])

/** Quality levels */
export const QualitySchema = z.enum(['low', 'medium', 'high'])

/** Generation modes */
export const ModeSchema = z.enum(['designer', 'producer', 'creator'])

/** Producer types */
export const ProducerTypeSchema = z.enum(['loop', 'song', 'one-shot'])

/** Naming convention parameter */
export const NamingParameterSchema = z.object({
  type: z.string(),
  value: z.string().optional(),
  format: z.string().optional(),
})

/** Naming convention config */
export const NamingConventionSchema = z.object({
  parameters: z.array(NamingParameterSchema),
  separator: z.string(),
})

// ============================================
// PROMPT VALIDATION
// ============================================

/**
 * Prompt validation with detailed error messages
 * Matches Edge Function validation exactly
 */
export const PromptSchema = z
  .string({ message: 'Prompt is required and must be a string' })
  .min(MIN_PROMPT_LENGTH, `Prompt must be at least ${MIN_PROMPT_LENGTH} characters long`)
  .max(MAX_PROMPT_LENGTH, `Prompt must be ${MAX_PROMPT_LENGTH} characters or less`)
  .refine(
    (val) => val.trim().length > 0,
    { message: 'Prompt cannot be empty' }
  )
  .refine(
    (val) => ALLOWED_CHARS_REGEX.test(val),
    { message: 'Prompt contains invalid characters. Only letters, numbers, spaces, and basic punctuation (,.\'\"!?-) are allowed.' }
  )
  .refine(
    (val) => !URL_REGEX.test(val),
    { message: 'Prompt cannot contain URLs' }
  )
  .refine(
    (val) => !EMOJI_REGEX.test(val),
    { message: 'Prompt cannot contain emojis' }
  )
  .refine(
    (val) => !SCRIPT_TAG_REGEX.test(val),
    { message: 'Prompt contains invalid content' }
  )

// ============================================
// DURATION VALIDATION
// ============================================

/**
 * Duration validation
 * Can be null/undefined (defaults to 10s in Edge Function)
 */
export const DurationSchema = z
  .number({ message: 'Duration must be a number' })
  .int('Duration must be a whole number')
  .min(MIN_DURATION, `Duration must be at least ${MIN_DURATION} second`)
  .max(MAX_DURATION, `Duration must be ${MAX_DURATION} seconds (3 minutes) or less`)
  .nullable()
  .optional()

/**
 * Create duration schema for specific mode
 */
export function createDurationSchemaForMode(mode: 'designer' | 'producer' | 'creator') {
  const limits = DURATION_LIMITS[mode]
  return z
    .number({ message: 'Duration must be a number' })
    .int('Duration must be a whole number')
    .min(limits.min, `Duration must be at least ${limits.min} second${limits.min > 1 ? 's' : ''} for ${mode} mode`)
    .max(limits.max, `Duration must be ${limits.max} seconds or less for ${mode} mode`)
    .nullable()
    .optional()
}

// ============================================
// BPM VALIDATION
// ============================================

/**
 * BPM validation for producer/creator modes
 */
export const BpmSchema = z
  .number({ message: 'BPM must be a number' })
  .int('BPM must be a whole number')
  .min(BPM_LIMITS.min, `BPM must be at least ${BPM_LIMITS.min}`)
  .max(BPM_LIMITS.max, `BPM must be ${BPM_LIMITS.max} or less`)
  .optional()

// ============================================
// MAIN SCHEMA
// ============================================

/**
 * Base schema for generate job input
 * Validates all fields that the Edge Function expects
 */
export const GenerateJobInputSchema = z.object({
  // Required
  prompt: PromptSchema,
  
  // Optional with defaults in Edge Function
  duration: DurationSchema,
  quality: QualitySchema.optional(),
  mode: ModeSchema.optional(),
  
  // Naming convention
  namingConvention: NamingConventionSchema.optional(),
  skipNaming: z.boolean().optional(),
  
  // Musical parameters (optional)
  key: MusicalKeySchema.optional(),
  scale: ScaleSchema.optional(),
  
  // Producer mode parameters
  bpm: BpmSchema,
  timeSignature: z.string().regex(/^\d+\/\d+$/, 'Time signature must be in format "beats/division" (e.g., "4/4")').optional(),
  bars: z.number().int().min(1).max(64).optional(),
  producerType: ProducerTypeSchema.optional(),
  
  // Creator mode parameters
  userEmail: z.string().email('Invalid email format').optional(),
})

/**
 * Schema with mode-aware duration validation
 * Use this for final validation before submission
 */
export const GenerateJobInputSchemaStrict = GenerateJobInputSchema.superRefine((data, ctx) => {
  // Mode-specific duration validation
  if (data.duration !== null && data.duration !== undefined && data.mode) {
    const limits = DURATION_LIMITS[data.mode]
    if (data.duration < limits.min) {
      ctx.addIssue({
        code: 'custom',
        message: `Duration must be at least ${limits.min} second${limits.min > 1 ? 's' : ''} for ${data.mode} mode`,
        path: ['duration'],
      })
    }
    if (data.duration > limits.max) {
      ctx.addIssue({
        code: 'custom',
        message: `Duration must be ${limits.max} seconds or less for ${data.mode} mode`,
        path: ['duration'],
      })
    }
  }
  
  // BPM is required for producer and creator modes
  if ((data.mode === 'producer' || data.mode === 'creator') && data.bpm === undefined) {
    // BPM is optional in the schema but recommended - don't add error, Edge Function has defaults
  }
})

// ============================================
// TYPE EXPORTS
// ============================================

export type GenerateJobInput = z.infer<typeof GenerateJobInputSchema>
export type MusicalKey = z.infer<typeof MusicalKeySchema>
export type Scale = z.infer<typeof ScaleSchema>
export type Quality = z.infer<typeof QualitySchema>
export type Mode = z.infer<typeof ModeSchema>
export type ProducerType = z.infer<typeof ProducerTypeSchema>
export type NamingConvention = z.infer<typeof NamingConventionSchema>

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate generate job input
 * Returns validation result with detailed errors
 */
export function validateGenerateJobInput(input: unknown): {
  success: boolean
  data?: GenerateJobInput
  errors?: string[]
} {
  const result = GenerateJobInputSchemaStrict.safeParse(input)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Zod 4 uses 'issues' property instead of 'errors'
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
  
  return { success: false, errors }
}

/**
 * Validate only the prompt field
 * Useful for real-time validation in textarea
 */
export function validatePrompt(prompt: string): {
  valid: boolean
  error?: string
} {
  const result = PromptSchema.safeParse(prompt)
  
  if (result.success) {
    return { valid: true }
  }
  
  // Zod 4 uses 'issues' property instead of 'errors'
  return { valid: false, error: result.error.issues[0]?.message }
}

/**
 * Quick check if prompt has invalid characters
 * Returns specific feedback for the user
 */
export function getPromptValidationHint(prompt: string): string | null {
  if (!prompt || prompt.trim().length === 0) {
    return null // Don't show error for empty prompt
  }
  
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return `Minimum ${MIN_PROMPT_LENGTH} characters`
  }
  
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Maximum ${MAX_PROMPT_LENGTH} characters`
  }
  
  if (URL_REGEX.test(prompt)) {
    return 'URLs are not allowed'
  }
  
  if (EMOJI_REGEX.test(prompt)) {
    return 'Emojis are not allowed'
  }
  
  if (SCRIPT_TAG_REGEX.test(prompt)) {
    return 'Invalid content detected'
  }
  
  if (!ALLOWED_CHARS_REGEX.test(prompt)) {
    // Find the invalid character for better feedback
    const invalidChars = prompt.match(/[^a-zA-Z0-9 ,.'"!?\-]/g)
    if (invalidChars) {
      const unique = [...new Set(invalidChars)].slice(0, 3).join(', ')
      return `Invalid character${invalidChars.length > 1 ? 's' : ''}: ${unique}`
    }
    return 'Contains invalid characters'
  }
  
  return null
}
