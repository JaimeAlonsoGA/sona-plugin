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
 * Automatically updates the session query cache
 */
export function useAuthStateListener() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((session: Session | null) => {
      // Update session cache when auth state changes
      queryClient.setQueryData(queryKeys.session, session)
    })
    
    return () => {
      unsubscribe()
    }
  }, [queryClient])
}

/**
 * Hook for sign in mutation
 * 
 * @returns Mutation for signing in
 */
export function useSignIn() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signIn(email, password),
    onSuccess: (data) => {
      if (data.session) {
        // Update session cache
        queryClient.setQueryData(queryKeys.session, data.session)
      }
    },
  })
}

/**
 * Hook for sign up mutation
 * 
 * @returns Mutation for signing up
 */
export function useSignUp() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signUp(email, password),
    onSuccess: (data) => {
      if (data.session) {
        // Update session cache
        queryClient.setQueryData(queryKeys.session, data.session)
      }
    },
  })
}

/**
 * Hook for sign out mutation
 * 
 * @returns Mutation for signing out
 */
export function useSignOut() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear session cache
      queryClient.setQueryData(queryKeys.session, null)
      // Clear user cache
      queryClient.setQueryData(queryKeys.user, null)
      // Remove all auth-related queries
      queryClient.removeQueries({ queryKey: queryKeys.session })
      queryClient.removeQueries({ queryKey: queryKeys.user })
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
