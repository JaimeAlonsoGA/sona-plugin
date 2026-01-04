/**
 * Naming Convention Types
 * 
 * System for configurable audio file naming conventions.
 * Supports both Designer (game/film audio) and Producer (music) modes.
 */

/**
 * Available parameter types for naming conventions
 */
export type NamingParameterType =
  // Auto-detected from prompt/AI
  | 'category'      // UCS category (AMB, SYN, IMP, etc.)
  | 'subcategory'   // More specific category
  | 'fxName'        // AI-generated descriptive name
  | 'object'        // Object/source of sound
  | 'action'        // Action/verb descriptor
  | 'variation'     // Variation number/letter
  // Musical parameters (Producer mode)
  | 'instrument'    // Instrument type (Synth, Piano, Guitar)
  | 'type'          // Sound type (Lead, Pad, Bass, Stab)
  | 'bpm'           // Tempo in BPM
  | 'key'           // Musical key (C, C#, D, etc.)
  | 'scale'         // Scale type (Major, Minor)
  // Meta parameters
  | 'creator'       // Creator ID (SonaIA)
  | 'source'        // Source ID (StableAudio)
  | 'date'          // Date in various formats
  | 'timestamp'     // Unix timestamp
  | 'uuid'          // Unique identifier
  // Custom
  | 'custom'        // User-defined static text

/**
 * A single parameter in a naming convention
 */
export interface NamingParameter {
  id: string
  type: NamingParameterType
  label: string
  /** For custom parameters, the static value */
  value?: string
  /** Format string for date/timestamp */
  format?: string
  /** Whether this parameter is enabled */
  enabled: boolean
}

/**
 * A complete naming convention preset
 */
export interface NamingConvention {
  id: string
  name: string
  description: string
  /** The ordered list of parameters */
  parameters: NamingParameter[]
  /** Separator between parameters (default: '_') */
  separator: string
  /** Whether this is a built-in preset (cannot be deleted) */
  isBuiltin: boolean
  /** The mode this convention is designed for */
  mode: 'designer' | 'producer' | 'universal'
}

/**
 * User's naming convention settings
 */
export interface NamingSettings {
  /** Selected convention ID for Designer mode */
  designerConventionId: string
  /** Selected convention ID for Producer mode */
  producerConventionId: string
  /** User's custom conventions */
  customConventions: NamingConvention[]
}

/**
 * Default parameters for creating new parameters
 */
export const DEFAULT_PARAMETERS: Record<NamingParameterType, Omit<NamingParameter, 'id' | 'enabled'>> = {
  category: { type: 'category', label: 'Category' },
  subcategory: { type: 'subcategory', label: 'Subcategory' },
  fxName: { type: 'fxName', label: 'FX Name' },
  object: { type: 'object', label: 'Object' },
  action: { type: 'action', label: 'Action' },
  variation: { type: 'variation', label: 'Variation' },
  instrument: { type: 'instrument', label: 'Instrument' },
  type: { type: 'type', label: 'Type' },
  bpm: { type: 'bpm', label: 'BPM' },
  key: { type: 'key', label: 'Key' },
  scale: { type: 'scale', label: 'Scale' },
  creator: { type: 'creator', label: 'Creator' },
  source: { type: 'source', label: 'Source' },
  date: { type: 'date', label: 'Date', format: 'YYYYMMDD' },
  timestamp: { type: 'timestamp', label: 'Timestamp' },
  uuid: { type: 'uuid', label: 'UUID' },
  custom: { type: 'custom', label: 'Custom', value: '' },
}

/**
 * Built-in naming convention presets
 */
export const BUILTIN_CONVENTIONS: NamingConvention[] = [
  // Designer Mode Presets
  {
    id: 'ucs',
    name: 'UCS Standard',
    description: 'CatID_FXName_Creator_Source',
    separator: '_',
    isBuiltin: true,
    mode: 'designer',
    parameters: [
      { id: 'ucs-1', type: 'category', label: 'Category', enabled: true },
      { id: 'ucs-2', type: 'fxName', label: 'FX Name', enabled: true },
      { id: 'ucs-3', type: 'creator', label: 'Creator', enabled: true },
      { id: 'ucs-4', type: 'source', label: 'Source', enabled: true },
    ],
  },
  {
    id: 'hierarchy',
    name: 'Common Hierarchy',
    description: 'Category_Object_Action_Variation',
    separator: '_',
    isBuiltin: true,
    mode: 'designer',
    parameters: [
      { id: 'hier-1', type: 'category', label: 'Category', enabled: true },
      { id: 'hier-2', type: 'object', label: 'Object', enabled: true },
      { id: 'hier-3', type: 'action', label: 'Action', enabled: true },
      { id: 'hier-4', type: 'variation', label: 'Variation', enabled: true },
    ],
  },
  {
    id: 'game-audio',
    name: 'Game Audio',
    description: 'Category_Subcategory_FXName_Variation',
    separator: '_',
    isBuiltin: true,
    mode: 'designer',
    parameters: [
      { id: 'game-1', type: 'category', label: 'Category', enabled: true },
      { id: 'game-2', type: 'subcategory', label: 'Subcategory', enabled: true },
      { id: 'game-3', type: 'fxName', label: 'FX Name', enabled: true },
      { id: 'game-4', type: 'variation', label: 'Variation', enabled: true },
    ],
  },
  // Producer Mode Presets
  {
    id: 'musical-full',
    name: 'Musical Full',
    description: 'Instrument_Type_FXName_BPM_Key',
    separator: '_',
    isBuiltin: true,
    mode: 'producer',
    parameters: [
      { id: 'mus-1', type: 'instrument', label: 'Instrument', enabled: true },
      { id: 'mus-2', type: 'type', label: 'Type', enabled: true },
      { id: 'mus-3', type: 'fxName', label: 'Name', enabled: true },
      { id: 'mus-4', type: 'bpm', label: 'BPM', enabled: true },
      { id: 'mus-5', type: 'key', label: 'Key', enabled: true },
    ],
  },
  {
    id: 'musical-simple',
    name: 'Musical Simple',
    description: 'Instrument_Type_BPM_Key',
    separator: '_',
    isBuiltin: true,
    mode: 'producer',
    parameters: [
      { id: 'muss-1', type: 'instrument', label: 'Instrument', enabled: true },
      { id: 'muss-2', type: 'type', label: 'Type', enabled: true },
      { id: 'muss-3', type: 'bpm', label: 'BPM', enabled: true },
      { id: 'muss-4', type: 'key', label: 'Key', enabled: true },
    ],
  },
  {
    id: 'loop-naming',
    name: 'Loop Naming',
    description: 'Type_FXName_BPM_Key_Scale',
    separator: '_',
    isBuiltin: true,
    mode: 'producer',
    parameters: [
      { id: 'loop-1', type: 'type', label: 'Type', enabled: true },
      { id: 'loop-2', type: 'fxName', label: 'Name', enabled: true },
      { id: 'loop-3', type: 'bpm', label: 'BPM', enabled: true },
      { id: 'loop-4', type: 'key', label: 'Key', enabled: true },
      { id: 'loop-5', type: 'scale', label: 'Scale', enabled: true },
    ],
  },
]

/**
 * Default naming settings
 */
export const DEFAULT_NAMING_SETTINGS: NamingSettings = {
  designerConventionId: 'ucs',
  producerConventionId: 'musical-full',
  customConventions: [],
}

/**
 * Get all available conventions (builtin + custom)
 */
export function getAllConventions(settings: NamingSettings): NamingConvention[] {
  return [...BUILTIN_CONVENTIONS, ...settings.customConventions]
}

/**
 * Get conventions filtered by mode
 */
export function getConventionsByMode(
  settings: NamingSettings,
  mode: 'designer' | 'producer'
): NamingConvention[] {
  return getAllConventions(settings).filter(
    c => c.mode === mode || c.mode === 'universal'
  )
}

/**
 * Get a convention by ID
 */
export function getConventionById(
  settings: NamingSettings,
  id: string
): NamingConvention | undefined {
  return getAllConventions(settings).find(c => c.id === id)
}

/**
 * Generate a unique ID for new conventions/parameters
 */
export function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new empty custom convention
 */
export function createEmptyConvention(mode: 'designer' | 'producer'): NamingConvention {
  return {
    id: generateId(),
    name: 'New Convention',
    description: 'Custom naming convention',
    separator: '_',
    isBuiltin: false,
    mode,
    parameters: [],
  }
}

/**
 * Clone a convention for customization
 */
export function cloneConvention(convention: NamingConvention): NamingConvention {
  return {
    ...convention,
    id: generateId(),
    name: `${convention.name} (Copy)`,
    isBuiltin: false,
    parameters: convention.parameters.map(p => ({
      ...p,
      id: generateId(),
    })),
  }
}

/**
 * Create a new parameter
 */
export function createParameter(type: NamingParameterType): NamingParameter {
  const defaults = DEFAULT_PARAMETERS[type]
  return {
    ...defaults,
    id: generateId(),
    enabled: true,
  }
}

/**
 * Serialize naming settings for storage
 */
export function serializeNamingSettings(settings: NamingSettings): string {
  return JSON.stringify(settings)
}

/**
 * Deserialize naming settings from storage
 */
export function deserializeNamingSettings(json: string): NamingSettings {
  try {
    const parsed = JSON.parse(json)
    return {
      designerConventionId: parsed.designerConventionId || DEFAULT_NAMING_SETTINGS.designerConventionId,
      producerConventionId: parsed.producerConventionId || DEFAULT_NAMING_SETTINGS.producerConventionId,
      customConventions: parsed.customConventions || [],
    }
  } catch {
    return DEFAULT_NAMING_SETTINGS
  }
}
