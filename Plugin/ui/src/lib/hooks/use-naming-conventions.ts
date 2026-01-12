/**
 * TanStack Query Hooks for Naming Conventions
 * 
 * This module provides React Query hooks for managing naming conventions
 * with server-side persistence in Supabase.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserNamingConventions,
  getUserNamingSettings,
  createNamingConvention,
  updateNamingConvention,
  deleteNamingConvention,
  updateUserNamingSettings,
  fetchNamingData,
} from '../api/naming-conventions'
import type { NamingConvention } from '../../types/naming'
import { useIsAuthenticated } from './use-supabase'

/**
 * Query key factory for consistent cache keys
 */
export const namingQueryKeys = {
  all: ['naming'] as const,
  conventions: () => [...namingQueryKeys.all, 'conventions'] as const,
  settings: () => [...namingQueryKeys.all, 'settings'] as const,
  combined: () => [...namingQueryKeys.all, 'combined'] as const,
}

/**
 * Hook to fetch all user's custom naming conventions
 * 
 * @returns Query result with naming conventions array
 */
export function useUserNamingConventions() {
  const isAuthenticated = useIsAuthenticated()
  
  return useQuery({
    queryKey: namingQueryKeys.conventions(),
    queryFn: getUserNamingConventions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: isAuthenticated,
  })
}

/**
 * Hook to fetch user's naming settings (active selections)
 * 
 * @returns Query result with naming settings
 */
export function useUserNamingSettingsQuery() {
  const isAuthenticated = useIsAuthenticated()
  
  return useQuery({
    queryKey: namingQueryKeys.settings(),
    queryFn: getUserNamingSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: isAuthenticated,
  })
}

/**
 * Hook to fetch both conventions and settings in parallel
 * More efficient for initial load
 * 
 * @returns Query result with combined naming data
 */
export function useNamingData() {
  const isAuthenticated = useIsAuthenticated()
  
  return useQuery({
    queryKey: namingQueryKeys.combined(),
    queryFn: fetchNamingData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: isAuthenticated,
  })
}

/**
 * Hook to create a new naming convention
 * 
 * @returns Mutation for creating conventions
 */
export function useCreateNamingConvention() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (convention: Omit<NamingConvention, 'id' | 'isBuiltin'>) => 
      createNamingConvention(convention),
    onSuccess: (newConvention) => {
      // Optimistically update the conventions cache
      queryClient.setQueryData<NamingConvention[]>(
        namingQueryKeys.conventions(),
        (old) => old ? [newConvention, ...old] : [newConvention]
      )
      // Invalidate combined query
      queryClient.invalidateQueries({ queryKey: namingQueryKeys.combined() })
    },
    onError: (error) => {
      console.error('Failed to create naming convention:', error)
    },
  })
}

/**
 * Hook to update an existing naming convention
 * 
 * @returns Mutation for updating conventions
 */
export function useUpdateNamingConvention() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string
      updates: Partial<Omit<NamingConvention, 'id' | 'isBuiltin'>>
    }) => updateNamingConvention(id, updates),
    onSuccess: (updatedConvention) => {
      // Update the conventions cache
      queryClient.setQueryData<NamingConvention[]>(
        namingQueryKeys.conventions(),
        (old) => old?.map(c => c.id === updatedConvention.id ? updatedConvention : c) ?? []
      )
      // Invalidate combined query
      queryClient.invalidateQueries({ queryKey: namingQueryKeys.combined() })
    },
    onError: (error) => {
      console.error('Failed to update naming convention:', error)
    },
  })
}

/**
 * Hook to delete a naming convention
 * 
 * @returns Mutation for deleting conventions
 */
export function useDeleteNamingConvention() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteNamingConvention(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: namingQueryKeys.conventions() })
      
      // Snapshot previous value
      const previousConventions = queryClient.getQueryData<NamingConvention[]>(
        namingQueryKeys.conventions()
      )
      
      // Optimistically remove from cache
      queryClient.setQueryData<NamingConvention[]>(
        namingQueryKeys.conventions(),
        (old) => old?.filter(c => c.id !== id) ?? []
      )
      
      return { previousConventions }
    },
    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousConventions) {
        queryClient.setQueryData(
          namingQueryKeys.conventions(),
          context.previousConventions
        )
      }
      console.error('Failed to delete naming convention:', error)
    },
    onSettled: () => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: namingQueryKeys.combined() })
    },
  })
}

/**
 * Hook to update user's active convention selections
 * 
 * @returns Mutation for updating settings
 */
export function useUpdateNamingSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (settings: {
      designerConventionId?: string
      producerConventionId?: string
      creatorConventionId?: string
      namingEnabled?: boolean
    }) => updateUserNamingSettings(settings),
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: namingQueryKeys.settings() })
      
      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<{
        designerConventionId: string
        producerConventionId: string
        creatorConventionId?: string
        namingEnabled?: boolean
      } | null>(namingQueryKeys.settings())
      
      // Optimistically update
      queryClient.setQueryData<{
        designerConventionId: string
        producerConventionId: string
        creatorConventionId?: string
        namingEnabled?: boolean
      } | null>(
        namingQueryKeys.settings(),
        (old) => ({
          designerConventionId: newSettings.designerConventionId ?? old?.designerConventionId ?? 'ucs',
          producerConventionId: newSettings.producerConventionId ?? old?.producerConventionId ?? 'musical-full',
          creatorConventionId: newSettings.creatorConventionId ?? old?.creatorConventionId ?? 'musical-full',
          namingEnabled: newSettings.namingEnabled ?? old?.namingEnabled ?? true,
        })
      )
      
      return { previousSettings }
    },
    onError: (error, _settings, context) => {
      // Rollback on error
      if (context?.previousSettings !== undefined) {
        queryClient.setQueryData(namingQueryKeys.settings(), context.previousSettings)
      }
      console.error('Failed to update naming settings:', error)
    },
    onSettled: () => {
      // Invalidate combined query
      queryClient.invalidateQueries({ queryKey: namingQueryKeys.combined() })
    },
  })
}
