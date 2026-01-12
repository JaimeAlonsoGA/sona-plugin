/**
 * API Client for Naming Conventions
 * 
 * This module provides functions to interact with Supabase for
 * managing user naming conventions and settings.
 */

import { supabase } from '../supabase'
import type { NamingConvention, NamingParameter } from '../../types/naming'
import type { Database } from '../../types/database.types'

type DbNamingConvention = Database['public']['Tables']['naming_conventions']['Row']
type DbNamingConventionInsert = Database['public']['Tables']['naming_conventions']['Insert']
type DbNamingConventionUpdate = Database['public']['Tables']['naming_conventions']['Update']

/**
 * Generate description from parameters and separator
 */
function generateDescription(parameters: NamingParameter[], separator: string): string {
  const enabledParams = parameters.filter(p => p.enabled)
  if (enabledParams.length === 0) return 'No parameters'
  return enabledParams.map(p => p.label).join(separator)
}

/**
 * Convert database row to NamingConvention type
 */
function dbToNamingConvention(row: DbNamingConvention): NamingConvention {
  const parameters = (row.parameters as unknown as NamingParameter[]) || []
  return {
    id: row.id,
    name: row.name,
    description: generateDescription(parameters, row.separator),
    mode: row.mode as 'designer' | 'producer' | 'universal',
    parameters,
    separator: row.separator,
    isBuiltin: false, // Database conventions are never builtin
  }
}

/**
 * Convert NamingConvention to database insert format
 */
function namingConventionToDbInsert(
  convention: Omit<NamingConvention, 'id' | 'isBuiltin'>,
  userId: string
): DbNamingConventionInsert {
  return {
    user_id: userId,
    name: convention.name,
    mode: convention.mode,
    parameters: convention.parameters as unknown as Database['public']['Tables']['naming_conventions']['Insert']['parameters'],
    separator: convention.separator,
  }
}

/**
 * Get current authenticated user ID
 * @throws Error if not authenticated
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw new Error('Authentication error. Please sign in again.')
  }
  
  if (!session?.user) {
    throw new Error('Not authenticated. Please sign in.')
  }
  
  return session.user.id
}

/**
 * Fetch all custom naming conventions for the current user
 * 
 * @returns Promise with array of naming conventions
 */
export async function getUserNamingConventions(): Promise<NamingConvention[]> {
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('naming_conventions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Failed to fetch naming conventions:', error)
    throw new Error('Failed to load naming conventions')
  }
  
  return (data || []).map(dbToNamingConvention)
}

/**
 * Fetch user's naming settings (active convention selections)
 * 
 * @returns Promise with user naming settings or null if not set
 */
export async function getUserNamingSettings(): Promise<{
  designerConventionId: string
  producerConventionId: string
  creatorConventionId: string
  namingEnabled: boolean
} | null> {
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('user_naming_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    // No settings found is OK - return null
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to fetch naming settings:', error)
    throw new Error('Failed to load naming settings')
  }
  
  return {
    designerConventionId: data.designer_convention_id,
    producerConventionId: data.producer_convention_id,
    creatorConventionId: data.creator_convention_id || data.producer_convention_id, // Fallback to producer
    namingEnabled: data.naming_enabled ?? true,
  }
}

/**
 * Create a new naming convention
 * 
 * @param convention - Convention data to create
 * @returns Promise with created convention
 */
export async function createNamingConvention(
  convention: Omit<NamingConvention, 'id' | 'isBuiltin'>
): Promise<NamingConvention> {
  const userId = await getCurrentUserId()
  
  const insertData = namingConventionToDbInsert(convention, userId)
  
  const { data, error } = await supabase
    .from('naming_conventions')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create naming convention:', error)
    throw new Error('Failed to create naming convention')
  }
  
  return dbToNamingConvention(data)
}

/**
 * Update an existing naming convention
 * 
 * @param id - Convention ID to update
 * @param updates - Partial convention data to update
 * @returns Promise with updated convention
 */
export async function updateNamingConvention(
  id: string,
  updates: Partial<Omit<NamingConvention, 'id' | 'isBuiltin'>>
): Promise<NamingConvention> {
  const userId = await getCurrentUserId()
  
  const updateData: DbNamingConventionUpdate = {}
  
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.mode !== undefined) updateData.mode = updates.mode
  if (updates.parameters !== undefined) {
    updateData.parameters = updates.parameters as unknown as Database['public']['Tables']['naming_conventions']['Update']['parameters']
  }
  if (updates.separator !== undefined) updateData.separator = updates.separator
  
  const { data, error } = await supabase
    .from('naming_conventions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns this convention
    .select()
    .single()
  
  if (error) {
    console.error('Failed to update naming convention:', error)
    throw new Error('Failed to update naming convention')
  }
  
  return dbToNamingConvention(data)
}

/**
 * Delete a naming convention
 * 
 * @param id - Convention ID to delete
 */
export async function deleteNamingConvention(id: string): Promise<void> {
  const userId = await getCurrentUserId()
  
  const { error } = await supabase
    .from('naming_conventions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns this convention
  
  if (error) {
    console.error('Failed to delete naming convention:', error)
    throw new Error('Failed to delete naming convention')
  }
}

/**
 * Update user's naming settings (active convention selections)
 * Uses upsert to create if not exists
 * 
 * @param settings - Settings to update
 * @returns Promise with updated settings
 */
export async function updateUserNamingSettings(settings: {
  designerConventionId?: string
  producerConventionId?: string
  creatorConventionId?: string
  namingEnabled?: boolean
}): Promise<{
  designerConventionId: string
  producerConventionId: string
  creatorConventionId: string
  namingEnabled: boolean
}> {
  const userId = await getCurrentUserId()
  
  // First try to get existing settings
  const { data: existing } = await supabase
    .from('user_naming_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const upsertData = {
    user_id: userId,
    designer_convention_id: settings.designerConventionId ?? existing?.designer_convention_id ?? 'ucs',
    producer_convention_id: settings.producerConventionId ?? existing?.producer_convention_id ?? 'musical-full',
    creator_convention_id: settings.creatorConventionId ?? existing?.creator_convention_id ?? 'musical-full',
    naming_enabled: settings.namingEnabled ?? existing?.naming_enabled ?? true,
  }
  
  const { data, error } = await supabase
    .from('user_naming_settings')
    .upsert(upsertData, { onConflict: 'user_id' })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to update naming settings:', error)
    throw new Error('Failed to update naming settings')
  }
  
  return {
    designerConventionId: data.designer_convention_id,
    producerConventionId: data.producer_convention_id,
    creatorConventionId: data.creator_convention_id ?? 'musical-full',
    namingEnabled: data.naming_enabled ?? true,
  }
}

/**
 * Batch fetch: Get both conventions and settings in parallel
 * More efficient for initial load
 * 
 * @returns Promise with conventions and settings
 */
export async function fetchNamingData(): Promise<{
  conventions: NamingConvention[]
  settings: { 
    designerConventionId: string
    producerConventionId: string
    creatorConventionId: string
    namingEnabled: boolean 
  } | null
}> {
  const [conventions, settings] = await Promise.all([
    getUserNamingConventions(),
    getUserNamingSettings(),
  ])
  
  return { conventions, settings }
}
