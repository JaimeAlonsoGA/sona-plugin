/**
 * TanStack Query Hooks for Beta Access Management
 * 
 * Provides optimized hooks for beta status and application management
 * with proper cache invalidation and state persistence.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getBetaStatus, 
  getBetaApplication, 
  submitBetaApplication,
  BetaStatus,
  BetaApplicationInput,
} from '../beta'

/**
 * Query key factory for beta-related queries
 */
export const betaQueryKeys = {
  all: ['beta'] as const,
  status: (userId: string) => ['beta', 'status', userId] as const,
  application: (userId: string) => ['beta', 'application', userId] as const,
}

/**
 * Hook to get beta status for a user
 */
export function useBetaStatus(userId: string | undefined) {
  return useQuery({
    queryKey: betaQueryKeys.status(userId ?? ''),
    queryFn: () => getBetaStatus(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to get beta application for a user
 */
export function useBetaApplication(userId: string | undefined) {
  return useQuery({
    queryKey: betaQueryKeys.application(userId ?? ''),
    queryFn: () => getBetaApplication(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook for submitting beta application
 * Automatically updates cache on success
 */
export function useSubmitBetaApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, application }: { userId: string; application: BetaApplicationInput }) =>
      submitBetaApplication(userId, application),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Determine the new status based on auto-approval
        const newStatus: BetaStatus = result.autoApproved ? 'approved' : 'pending'
        
        // Immediately update the status cache
        queryClient.setQueryData(
          betaQueryKeys.status(variables.userId),
          newStatus
        )
        
        // Invalidate application query to refetch with new data
        queryClient.invalidateQueries({
          queryKey: betaQueryKeys.application(variables.userId),
        })
        
        // Also invalidate the general beta queries
        queryClient.invalidateQueries({
          queryKey: betaQueryKeys.all,
        })
      }
    },
  })
}

/**
 * Hook to invalidate all beta-related queries
 * Useful when we need to force a refresh (e.g., after email confirmation)
 */
export function useInvalidateBetaQueries() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: betaQueryKeys.all })
  }
}

/**
 * Hook to manually set beta status in cache
 * Useful for optimistic updates
 */
export function useSetBetaStatus() {
  const queryClient = useQueryClient()
  
  return (userId: string, status: BetaStatus) => {
    queryClient.setQueryData(betaQueryKeys.status(userId), status)
  }
}
