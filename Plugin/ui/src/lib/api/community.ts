/**
 * Community API Functions
 * 
 * Functions for fetching and posting community content.
 * Used by the public /community page.
 */

import { supabase } from '../supabase'

// ============================================
// TYPES
// ============================================

export interface CommunityStats {
  total_users: number
  total_generations: number
}

export interface CommunityActivity {
  id: string
  user_id: string
  activity_type: 'beta_join' | 'first_generation' | 'milestone'
  display_name: string
  message_template: string
  created_at: string
  is_visible: boolean
}

export interface CommunityPost {
  id: string
  user_id: string
  author_name: string
  message: string
  created_at: string
  has_audio: boolean
  audio_url: string | null
  audio_prompt: string | null
}

export interface CreatePostInput {
  message: string
  attached_job_id?: string | null
}

export interface UserJob {
  id: string
  prompt: string
  result_url: string | null
  created_at: string
  status: string
}

// ============================================
// FETCH FUNCTIONS (Public)
// ============================================

/**
 * Fetch community statistics
 * Public - no auth required
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const { data, error } = await supabase
    .from('community_stats')
    .select('*')
    .single()

  if (error) {
    console.error('[Community] Error fetching stats:', error)
    // Return fallback values
    return { total_users: 0, total_generations: 0 }
  }

  return {
    total_users: data?.total_users ?? 0,
    total_generations: data?.total_generations ?? 0,
  }
}

/**
 * Fetch recent activity log (beta joins)
 * Public - no auth required
 */
export async function getCommunityActivity(limit = 20): Promise<CommunityActivity[]> {
  const { data, error } = await supabase
    .from('community_activity_log')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Community] Error fetching activity:', error)
    return []
  }

  return data ?? []
}

/**
 * Fetch community posts with audio info
 * Public - no auth required
 */
export async function getCommunityPosts(
  limit = 20,
  offset = 0
): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .rpc('get_community_posts_with_audio', {
      p_limit: limit,
      p_offset: offset,
    })

  if (error) {
    console.error('[Community] Error fetching posts:', error)
    return []
  }

  return data ?? []
}

// ============================================
// MUTATION FUNCTIONS (Authenticated + Beta)
// ============================================

/**
 * Create a new community post
 * Requires beta access
 */
export async function createCommunityPost(
  input: CreatePostInput
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user's beta application for author name
  const { data: betaApp, error: betaError } = await supabase
    .from('beta_applications')
    .select('first_name, status')
    .eq('user_id', user.id)
    .single()

  if (betaError || !betaApp || betaApp.status !== 'approved') {
    return { success: false, error: 'Beta access required to post' }
  }

  // Validate message
  if (!input.message || input.message.trim().length < 10) {
    return { success: false, error: 'Message must be at least 10 characters' }
  }

  if (input.message.length > 1000) {
    return { success: false, error: 'Message must be less than 1000 characters' }
  }

  // If attaching audio, verify it belongs to the user
  if (input.attached_job_id) {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id, status, result_url')
      .eq('id', input.attached_job_id)
      .single()

    if (jobError || !job) {
      return { success: false, error: 'Audio generation not found' }
    }

    if (job.user_id !== user.id) {
      return { success: false, error: 'You can only attach your own audio' }
    }

    if (job.status !== 'completed' || !job.result_url) {
      return { success: false, error: 'Audio must be completed to attach' }
    }
  }

  // Create the post
  const { data: post, error: createError } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      author_name: betaApp.first_name,
      message: input.message.trim(),
      attached_job_id: input.attached_job_id || null,
    })
    .select()
    .single()

  if (createError) {
    console.error('[Community] Error creating post:', createError)
    return { success: false, error: 'Failed to create post' }
  }

  // Return with audio info if attached
  return {
    success: true,
    post: {
      ...post,
      has_audio: !!input.attached_job_id,
      audio_url: null, // Would need to join, but client will refetch
      audio_prompt: null,
    },
  }
}

/**
 * Delete a community post
 * User can only delete their own posts
 */
export async function deleteCommunityPost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error: deleteError } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id) // RLS also enforces this

  if (deleteError) {
    console.error('[Community] Error deleting post:', deleteError)
    return { success: false, error: 'Failed to delete post' }
  }

  return { success: true }
}

/**
 * Fetch user's recent completed jobs for attachment selector
 * Requires authentication
 */
export async function getUserRecentJobs(limit = 10): Promise<UserJob[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('id, prompt, result_url, created_at, status')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Community] Error fetching user jobs:', error)
    return []
  }

  return data ?? []
}
