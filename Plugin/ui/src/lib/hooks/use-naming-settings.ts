/**
 * Naming Settings Hook
 * 
 * Local-first editing with Supabase sync on save.
 * All operations happen locally first, then sync to server when user clicks "Done".
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  NamingSettings,
  NamingConvention,
  NamingParameter,
  NamingParameterType,
  DEFAULT_NAMING_SETTINGS,
  BUILTIN_CONVENTIONS,
  serializeNamingSettings,
  deserializeNamingSettings,
  getConventionById,
  getConventionsByMode,
  createEmptyConvention,
  cloneConvention,
  createParameter,
} from '../../types/naming'

/**
 * Generate description from parameters and separator
 */
function generateDescription(parameters: NamingParameter[], separator: string): string {
  const enabledParams = parameters.filter(p => p.enabled)
  if (enabledParams.length === 0) return 'No parameters'
  return enabledParams.map(p => p.label).join(separator)
}
import {
  useNamingData,
  useCreateNamingConvention,
  useUpdateNamingConvention,
  useDeleteNamingConvention,
  useUpdateNamingSettings,
} from './use-naming-conventions'
import { useIsAuthenticated } from './use-supabase'

const STORAGE_KEY = 'sona-naming-settings'

/**
 * Track changes for a convention being edited
 */
interface PendingChanges {
  conventionId: string
  isNew: boolean // true if this is a newly created convention
  originalConvention?: NamingConvention // original state before editing
  currentConvention: NamingConvention // current local state
}

/**
 * Hook for managing naming convention settings
 * Local-first: all edits happen locally, sync to Supabase on "Done"
 */
export function useNamingSettings() {
  const isAuthenticated = useIsAuthenticated()
  
  // Supabase data query
  const { data: namingData, isLoading: isLoadingSupabase, error: supabaseError, refetch } = useNamingData()
  
  // Mutations for syncing to Supabase
  const createMutation = useCreateNamingConvention()
  const updateMutation = useUpdateNamingConvention()
  const deleteMutation = useDeleteNamingConvention()
  const settingsMutation = useUpdateNamingSettings()
  
  // Local state - this is the source of truth while editing
  const [localSettings, setLocalSettings] = useState<NamingSettings>(DEFAULT_NAMING_SETTINGS)
  const [isLoadedLocal, setIsLoadedLocal] = useState(false)
  
  // Track pending changes for the convention being edited
  const [pendingChanges, setPendingChanges] = useState<PendingChanges | null>(null)
  
  // Track conventions marked for deletion
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set())
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)

  // Initialize local state from Supabase data
  useEffect(() => {
    if (isAuthenticated && namingData && !isLoadingSupabase) {
      setLocalSettings({
        designerConventionId: namingData.settings?.designerConventionId ?? DEFAULT_NAMING_SETTINGS.designerConventionId,
        producerConventionId: namingData.settings?.producerConventionId ?? DEFAULT_NAMING_SETTINGS.producerConventionId,
        creatorConventionId: namingData.settings?.creatorConventionId ?? DEFAULT_NAMING_SETTINGS.creatorConventionId,
        namingEnabled: namingData.settings?.namingEnabled ?? DEFAULT_NAMING_SETTINGS.namingEnabled,
        customConventions: namingData.conventions || [],
      })
      setIsLoadedLocal(true)
    }
  }, [isAuthenticated, namingData, isLoadingSupabase])

  // Load from localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setLocalSettings(deserializeNamingSettings(stored))
        }
      } catch (error) {
        console.error('Failed to load naming settings from localStorage:', error)
      }
      setIsLoadedLocal(true)
    }
  }, [isAuthenticated])

  // Persist to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated && isLoadedLocal) {
      try {
        localStorage.setItem(STORAGE_KEY, serializeNamingSettings(localSettings))
      } catch (error) {
        console.error('Failed to save naming settings to localStorage:', error)
      }
    }
  }, [localSettings, isLoadedLocal, isAuthenticated])

  // Current settings with pending changes applied
  const settings: NamingSettings = useMemo(() => {
    let result = { ...localSettings }
    
    // Apply pending convention changes
    if (pendingChanges) {
      if (pendingChanges.isNew) {
        // Add new convention to the list
        const exists = result.customConventions.some(c => c.id === pendingChanges.conventionId)
        if (!exists) {
          result = {
            ...result,
            customConventions: [...result.customConventions, pendingChanges.currentConvention],
          }
        } else {
          result = {
            ...result,
            customConventions: result.customConventions.map(c =>
              c.id === pendingChanges.conventionId ? pendingChanges.currentConvention : c
            ),
          }
        }
      } else {
        // Update existing convention
        result = {
          ...result,
          customConventions: result.customConventions.map(c =>
            c.id === pendingChanges.conventionId ? pendingChanges.currentConvention : c
          ),
        }
      }
    }
    
    // Remove pending deletions from view
    if (pendingDeletions.size > 0) {
      result = {
        ...result,
        customConventions: result.customConventions.filter(c => !pendingDeletions.has(c.id)),
      }
    }
    
    return result
  }, [localSettings, pendingChanges, pendingDeletions])

  const isLoaded = isAuthenticated ? (!isLoadingSupabase && isLoadedLocal) : isLoadedLocal
  const isSaving = isSyncing || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || settingsMutation.isPending
  const error = syncError || supabaseError

  // Ensure there's always a valid convention selected
  const ensureValidSelection = useCallback((currentSettings: NamingSettings, mode: 'designer' | 'producer' | 'creator'): string => {
    const currentId = mode === 'designer' 
      ? currentSettings.designerConventionId 
      : mode === 'producer'
        ? currentSettings.producerConventionId
        : currentSettings.creatorConventionId
    const allConventions = [...BUILTIN_CONVENTIONS, ...currentSettings.customConventions]
    const modeConventions = allConventions.filter(c => c.mode === mode || c.mode === 'universal')
    
    // Check if current selection is valid
    const isValid = modeConventions.some(c => c.id === currentId)
    if (isValid) return currentId
    
    // Fall back to default
    const defaultId = mode === 'designer' 
      ? DEFAULT_NAMING_SETTINGS.designerConventionId 
      : mode === 'producer'
        ? DEFAULT_NAMING_SETTINGS.producerConventionId
        : DEFAULT_NAMING_SETTINGS.creatorConventionId
    if (modeConventions.some(c => c.id === defaultId)) return defaultId
    
    // Fall back to first available
    return modeConventions[0]?.id ?? defaultId
  }, [])

  // Get the active convention for a mode
  const getActiveConvention = useCallback(
    (mode: 'designer' | 'producer' | 'creator'): NamingConvention => {
      const id = ensureValidSelection(settings, mode)
      const convention = getConventionById(settings, id)
      // Should always find one due to ensureValidSelection, but fallback just in case
      return convention ?? BUILTIN_CONVENTIONS.find(c => c.mode === mode || c.mode === 'universal')!
    },
    [settings, ensureValidSelection]
  )

  // Get all conventions for a mode
  const getConventionsForMode = useCallback(
    (mode: 'designer' | 'producer' | 'creator'): NamingConvention[] => {
      return getConventionsByMode(settings, mode)
    },
    [settings]
  )

  // Set the active convention for a mode (local only, syncs on save)
  const setActiveConvention = useCallback(
    (mode: 'designer' | 'producer' | 'creator', conventionId: string) => {
      const settingsKey = mode === 'designer' 
        ? 'designerConventionId' 
        : mode === 'producer'
          ? 'producerConventionId'
          : 'creatorConventionId'
      
      setLocalSettings(prev => ({
        ...prev,
        [settingsKey]: conventionId,
      }))
      
      // Sync settings immediately for convention selection (it's a quick operation)
      if (isAuthenticated) {
        settingsMutation.mutate({
          [settingsKey]: conventionId,
        })
      }
    },
    [isAuthenticated, settingsMutation]
  )

  // Toggle naming convention on/off (syncs immediately)
  const setNamingEnabled = useCallback(
    (enabled: boolean) => {
      setLocalSettings(prev => ({
        ...prev,
        namingEnabled: enabled,
      }))
      
      // Sync settings immediately
      if (isAuthenticated) {
        settingsMutation.mutate({
          namingEnabled: enabled,
        })
      }
    },
    [isAuthenticated, settingsMutation]
  )

  // Start editing a new convention (local only until saved)
  const addConvention = useCallback(
    (mode: 'designer' | 'producer' | 'creator'): NamingConvention => {
      const newConvention = createEmptyConvention(mode)
      
      setPendingChanges({
        conventionId: newConvention.id,
        isNew: true,
        currentConvention: newConvention,
      })
      
      return newConvention
    },
    []
  )

  // Clone an existing convention (local only until saved)
  const duplicateConvention = useCallback(
    (convention: NamingConvention): NamingConvention => {
      const cloned = cloneConvention(convention)
      
      setPendingChanges({
        conventionId: cloned.id,
        isNew: true,
        currentConvention: cloned,
      })
      
      return cloned
    },
    []
  )

  // Start editing an existing convention
  const startEditing = useCallback(
    (convention: NamingConvention) => {
      if (convention.isBuiltin) {
        // Can't edit builtin, must clone
        return duplicateConvention(convention)
      }
      
      setPendingChanges({
        conventionId: convention.id,
        isNew: false,
        originalConvention: { ...convention, parameters: [...convention.parameters] },
        currentConvention: { ...convention, parameters: [...convention.parameters] },
      })
      
      return convention
    },
    [duplicateConvention]
  )

  // Update the convention being edited (local only)
  const updateConvention = useCallback(
    (conventionId: string, updates: Partial<Omit<NamingConvention, 'id' | 'isBuiltin'>>) => {
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        const updatedConvention = { ...prev.currentConvention, ...updates }
        // Regenerate description if separator changed
        if (updates.separator !== undefined) {
          updatedConvention.description = generateDescription(
            updatedConvention.parameters,
            updatedConvention.separator
          )
        }
        return {
          ...prev,
          currentConvention: updatedConvention,
        }
      })
    },
    []
  )

  // Delete a custom convention
  const deleteConvention = useCallback(
    (conventionId: string) => {
      // Mark for deletion
      setPendingDeletions(prev => new Set([...prev, conventionId]))
      
      // Update local settings to remove it
      setLocalSettings(prev => {
        const newSettings = {
          ...prev,
          customConventions: prev.customConventions.filter(c => c.id !== conventionId),
        }
        
        // Reset to default if deleting the active convention
        if (prev.designerConventionId === conventionId) {
          newSettings.designerConventionId = ensureValidSelection(newSettings, 'designer')
        }
        if (prev.producerConventionId === conventionId) {
          newSettings.producerConventionId = ensureValidSelection(newSettings, 'producer')
        }
        
        return newSettings
      })
      
      // Sync deletion immediately
      if (isAuthenticated) {
        deleteMutation.mutate(conventionId, {
          onSuccess: () => {
            setPendingDeletions(prev => {
              const next = new Set(prev)
              next.delete(conventionId)
              return next
            })
          },
          onError: () => {
            // Rollback on error
            setPendingDeletions(prev => {
              const next = new Set(prev)
              next.delete(conventionId)
              return next
            })
            refetch()
          },
        })
      } else {
        // For guests, just clear the pending deletion flag
        setPendingDeletions(prev => {
          const next = new Set(prev)
          next.delete(conventionId)
          return next
        })
      }
    },
    [isAuthenticated, deleteMutation, ensureValidSelection, refetch]
  )

  // Add a parameter to the convention being edited (local only)
  const addParameter = useCallback(
    (conventionId: string, type: NamingParameterType) => {
      const newParam = createParameter(type)
      
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        const newParams = [...prev.currentConvention.parameters, newParam]
        return {
          ...prev,
          currentConvention: {
            ...prev.currentConvention,
            parameters: newParams,
            description: generateDescription(newParams, prev.currentConvention.separator),
          },
        }
      })
      
      return newParam
    },
    []
  )

  // Update a parameter (local only)
  const updateParameter = useCallback(
    (conventionId: string, parameterId: string, updates: Partial<Omit<NamingParameter, 'id'>>) => {
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        const newParams = prev.currentConvention.parameters.map(p =>
          p.id === parameterId ? { ...p, ...updates } : p
        )
        return {
          ...prev,
          currentConvention: {
            ...prev.currentConvention,
            parameters: newParams,
            description: generateDescription(newParams, prev.currentConvention.separator),
          },
        }
      })
    },
    []
  )

  // Remove a parameter (local only)
  const removeParameter = useCallback(
    (conventionId: string, parameterId: string) => {
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        const newParams = prev.currentConvention.parameters.filter(p => p.id !== parameterId)
        return {
          ...prev,
          currentConvention: {
            ...prev.currentConvention,
            parameters: newParams,
            description: generateDescription(newParams, prev.currentConvention.separator),
          },
        }
      })
    },
    []
  )

  // Reorder parameters (local only)
  const reorderParameters = useCallback(
    (conventionId: string, fromIndex: number, toIndex: number) => {
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        const newParams = [...prev.currentConvention.parameters]
        const [moved] = newParams.splice(fromIndex, 1)
        newParams.splice(toIndex, 0, moved)
        return {
          ...prev,
          currentConvention: {
            ...prev.currentConvention,
            parameters: newParams,
            description: generateDescription(newParams, prev.currentConvention.separator),
          },
        }
      })
    },
    []
  )

  // Set parameters directly (for drag-drop)
  const setParameters = useCallback(
    (conventionId: string, parameters: NamingParameter[]) => {
      setPendingChanges(prev => {
        if (!prev || prev.conventionId !== conventionId) return prev
        return {
          ...prev,
          currentConvention: {
            ...prev.currentConvention,
            parameters,
            description: generateDescription(parameters, prev.currentConvention.separator),
          },
        }
      })
    },
    []
  )

  // Save pending changes to Supabase (called when user clicks "Done")
  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!pendingChanges) return true
    
    setSyncError(null)
    setIsSyncing(true)
    
    try {
      if (isAuthenticated) {
        if (pendingChanges.isNew) {
          // Create new convention in Supabase
          await createMutation.mutateAsync({
            name: pendingChanges.currentConvention.name,
            description: pendingChanges.currentConvention.description,
            mode: pendingChanges.currentConvention.mode,
            parameters: pendingChanges.currentConvention.parameters,
            separator: pendingChanges.currentConvention.separator,
          })
        } else {
          // Update existing convention in Supabase
          await updateMutation.mutateAsync({
            id: pendingChanges.conventionId,
            updates: {
              name: pendingChanges.currentConvention.name,
              description: pendingChanges.currentConvention.description,
              parameters: pendingChanges.currentConvention.parameters,
              separator: pendingChanges.currentConvention.separator,
            },
          })
        }
        
        // Refetch to get server state
        await refetch()
      } else {
        // For guests, commit to local state
        setLocalSettings(prev => {
          if (pendingChanges.isNew) {
            return {
              ...prev,
              customConventions: [...prev.customConventions, pendingChanges.currentConvention],
            }
          } else {
            return {
              ...prev,
              customConventions: prev.customConventions.map(c =>
                c.id === pendingChanges.conventionId ? pendingChanges.currentConvention : c
              ),
            }
          }
        })
      }
      
      setPendingChanges(null)
      setIsSyncing(false)
      return true
    } catch (err) {
      console.error('Failed to save convention:', err)
      setSyncError(err instanceof Error ? err : new Error('Failed to save'))
      setIsSyncing(false)
      return false
    }
  }, [pendingChanges, isAuthenticated, createMutation, updateMutation, refetch])

  // Cancel pending changes
  const cancelChanges = useCallback(() => {
    setPendingChanges(null)
    setSyncError(null)
  }, [])

  // Get the convention currently being edited (with local changes)
  const getEditingConvention = useCallback((): NamingConvention | null => {
    if (!pendingChanges) return null
    return pendingChanges.currentConvention
  }, [pendingChanges])

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback((): boolean => {
    return pendingChanges !== null
  }, [pendingChanges])

  // Generate preview of a filename
  const generatePreview = useCallback(
    (convention: NamingConvention): string => {
      const parts = convention.parameters
        .filter(p => p.enabled)
        .map(p => {
          switch (p.type) {
            case 'category': return 'SYN'
            case 'subcategory': return 'Pad'
            case 'fxName': return 'WarmGlow'
            case 'object': return 'Synth'
            case 'action': return 'Sustain'
            case 'variation': return '01'
            case 'instrument': return 'Synth'
            case 'type': return 'Lead'
            case 'bpm': return '120'
            case 'key': return 'Csharp'
            case 'scale': return 'Minor'
            case 'creator': return 'SonaIA'
            case 'source': return 'StableAudio'
            case 'date': return '20260102'
            case 'timestamp': return '1735830000'
            case 'uuid': return 'a1b2c3'
            case 'custom': return p.value || 'Custom'
            default: return p.type
          }
        })
      return parts.join(convention.separator)
    },
    []
  )

  return {
    settings,
    isLoaded,
    isSaving,
    error,
    getActiveConvention,
    getConventionsForMode,
    setActiveConvention,
    setNamingEnabled,
    addConvention,
    duplicateConvention,
    startEditing,
    updateConvention,
    deleteConvention,
    addParameter,
    updateParameter,
    removeParameter,
    reorderParameters,
    setParameters,
    generatePreview,
    // New methods for local-first workflow
    saveChanges,
    cancelChanges,
    getEditingConvention,
    hasUnsavedChanges,
  }
}

/**
 * Export settings for use in job creation
 * Returns the convention config to send with job
 */
export function exportNamingConventionForJob(
  convention: NamingConvention
): NamingConventionExport {
  return {
    id: convention.id,
    parameters: convention.parameters
      .filter(p => p.enabled)
      .map(p => ({
        type: p.type,
        value: p.value,
        format: p.format,
      })),
    separator: convention.separator,
  }
}

/**
 * Simplified export format for sending to audio-worker
 */
export interface NamingConventionExport {
  id: string
  parameters: Array<{
    type: NamingParameterType
    value?: string
    format?: string
  }>
  separator: string
}
