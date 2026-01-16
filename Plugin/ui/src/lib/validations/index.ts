/**
 * Validation exports
 * 
 * Centralized exports for all Zod validation schemas and utilities
 */

export {
  // Main schemas
  GenerateJobInputSchema,
  GenerateJobInputSchemaStrict,
  PromptSchema,
  DurationSchema,
  BpmSchema,
  
  // Reusable schemas
  MusicalKeySchema,
  ScaleSchema,
  QualitySchema,
  ModeSchema,
  ProducerTypeSchema,
  NamingConventionSchema,
  NamingParameterSchema,
  
  // Constants
  DURATION_LIMITS,
  BPM_LIMITS,
  
  // Utility functions
  createDurationSchemaForMode,
  validateGenerateJobInput,
  validatePrompt,
  getPromptValidationHint,
  
  // Types
  type GenerateJobInput,
  type MusicalKey,
  type Scale,
  type Quality,
  type Mode,
  type ProducerType,
  type NamingConvention,
} from './generate-job'
