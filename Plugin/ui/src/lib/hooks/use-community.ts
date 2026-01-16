/**
 * TanStack Query Hooks for Community
 * 
 * Provides optimized hooks for community features:
 * - Stats (total users, generations)
 * - Activity feed (beta joins)
 * - Community posts
 * - Post creation/deletion
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  getCommunityStats,
  getCommunityActivity,
  getCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  getUserRecentJobs,
  type CommunityStats,
  type CommunityActivity,
  type CommunityPost,
  type CreatePostInput,
  type UserJob,
} from '../api/community'
import { useIsAuthenticated } from './use-supabase'

/**
 * Query key factory for community queries
 */
export const communityQueryKeys = {
  all: ['community'] as const,
  stats: () => [...communityQueryKeys.all, 'stats'] as const,
  activity: () => [...communityQueryKeys.all, 'activity'] as const,
  posts: () => [...communityQueryKeys.all, 'posts'] as const,
  userJobs: () => [...communityQueryKeys.all, 'userJobs'] as const,
}

// ============================================
// PUBLIC QUERIES (No auth required)
// ============================================

/**
 * Hook to fetch community statistics
 * Refetches every 30 seconds for live updates
 */
export function useCommunityStats() {
  return useQuery<CommunityStats>({
    queryKey: communityQueryKeys.stats(),
    queryFn: getCommunityStats,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for live feel
    retry: 2,
  })
}

/**
 * Hook to fetch community activity feed
 * Shows recent beta joins with witty messages
 */
export function useCommunityActivity(limit = 20) {
  return useQuery<CommunityActivity[]>({
    queryKey: communityQueryKeys.activity(),
    queryFn: () => getCommunityActivity(limit),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 2,
  })
}

/**
 * Hook to fetch community posts with infinite scrolling
 */
export function useCommunityPosts(limit = 20) {
  return useInfiniteQuery<CommunityPost[]>({
    queryKey: communityQueryKeys.posts(),
    queryFn: ({ pageParam = 0 }) => getCommunityPosts(limit, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than limit, we've reached the end
      if (lastPage.length < limit) {
        return undefined
      }
      // Return the offset for the next page
      return allPages.flat().length
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 2,
  })
}

/**
 * Hook to fetch community posts (non-infinite version)
 * Simpler for initial implementation
 */
export function useCommunityPostsList(limit = 30) {
  return useQuery<CommunityPost[]>({
    queryKey: communityQueryKeys.posts(),
    queryFn: () => getCommunityPosts(limit, 0),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    retry: 2,
  })
}

// ============================================
// AUTHENTICATED QUERIES
// ============================================

/**
 * Hook to fetch user's recent completed jobs
 * For the audio attachment selector
 */
export function useUserRecentJobs(limit = 10) {
  const isAuthenticated = useIsAuthenticated()

  return useQuery<UserJob[]>({
    queryKey: communityQueryKeys.userJobs(),
    queryFn: () => getUserRecentJobs(limit),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook to create a new community post
 * Automatically invalidates posts list on success
 */
export function useCreateCommunityPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePostInput) => createCommunityPost(input),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate posts to trigger refetch
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.posts() })
      }
    },
    onError: (error) => {
      console.error('[useCommunityPost] Error creating post:', error)
    },
  })
}

/**
 * Hook to delete a community post
 * Automatically removes from cache on success
 */
export function useDeleteCommunityPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(postId),
    onSuccess: (result, postId) => {
      if (result.success) {
        // Optimistic update: remove from cache immediately
        queryClient.setQueryData<CommunityPost[]>(
          communityQueryKeys.posts(),
          (old) => old?.filter((post) => post.id !== postId) ?? []
        )
        
        // Also invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.posts() })
      }
    },
    onError: (error) => {
      console.error('[useCommunityPost] Error deleting post:', error)
    },
  })
}

/**
 * Hook to invalidate all community queries
 */
export function useInvalidateCommunityQueries() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: communityQueryKeys.all })
  }
}
