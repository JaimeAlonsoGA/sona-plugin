/**
 * React Query Hooks for Supabase Authentication and API
 * 
 * This module provides optimized hooks using TanStack Query
 * for authentication and API operations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Session } from '@supabase/supabase-js'
import { 
  signIn, 
  signUp, 
  signOut, 
  generateAudio, 
  getSession,
  onAuthStateChange 
} from '../supabase'
import { useEffect } from 'react'
import { jobQueryKeys } from './use-jobs'

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  session: ['session'] as const,
  user: ['user'] as const,
}

/**
 * Hook to get current session
 * 
 * @returns Query result with session data
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to listen to auth state changes
 * Automatically updates the session query cache and invalidates user data
 */
export function useAuthStateListener() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((session: Session | null) => {
      // Update session cache when auth state changes
      queryClient.setQueryData(queryKeys.session, session)
      
      // When auth state changes, invalidate all user-related queries
      // This ensures fresh data on login and cleanup on logout
      if (session) {
        // User logged in - invalidate to refetch with new user context
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
      } else {
        // User logged out - clear all cached data
        queryClient.removeQueries({ queryKey: jobQueryKeys.all })
        queryClient.removeQueries({ queryKey: queryKeys.user })
      }
    })
    
    return () => {
      unsubscribe()
    }
  }, [queryClient])
}

/**
 * Hook for sign in mutation
 * 
 * @param options - Optional mutation options like onSuccess callback
 * @returns Mutation for signing in
 */
export function useSignIn(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signIn(email, password),
    onSuccess: (data) => {
      if (data.session) {
        // Update session cache
        queryClient.setQueryData(queryKeys.session, data.session)
        // Invalidate and refetch all job queries for the new user
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
      }
      // Call custom onSuccess if provided
      options?.onSuccess?.()
    },
  })
}

/**
 * Hook for sign up mutation
 * 
 * @param options - Optional mutation options like onSuccess callback
 * @returns Mutation for signing up
 */
export function useSignUp(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signUp(email, password),
    onSuccess: (data) => {
      if (data.session) {
        // Update session cache
        queryClient.setQueryData(queryKeys.session, data.session)
        // Invalidate and refetch all job queries for the new user
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
      }
      // Call custom onSuccess if provided
      options?.onSuccess?.()
    },
  })
}

/**
 * Hook for sign out mutation
 * 
 * @param options - Optional mutation options like onSuccess callback
 * @returns Mutation for signing out
 */
export function useSignOut(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear session cache
      queryClient.setQueryData(queryKeys.session, null)
      queryClient.setQueryData(queryKeys.user, null)
      
      // Remove all cached queries to prevent stale data on next login
      queryClient.removeQueries({ queryKey: queryKeys.session })
      queryClient.removeQueries({ queryKey: queryKeys.user })
      queryClient.removeQueries({ queryKey: jobQueryKeys.all })
      
      // Clear the entire cache to ensure clean state
      queryClient.clear()
      
      // Call custom onSuccess if provided
      options?.onSuccess?.()
    },
  })
}

/**
 * Hook for audio generation mutation
 * 
 * @returns Mutation for generating audio
 */
export function useGenerateAudio() {
  return useMutation({
    mutationFn: ({ prompt, mode }: { prompt: string; mode: string }) => 
      generateAudio(prompt, mode),
    onError: (error) => {
      console.error('Audio generation failed:', error)
    },
  })
}

/**
 * Hook to check if user is authenticated
 * 
 * @returns Boolean indicating authentication status
 */
export function useIsAuthenticated() {
  const { data: session } = useSession()
  return !!session
}
