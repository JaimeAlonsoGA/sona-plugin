/**
 * Beta Access Management
 * 
 * Handles closed beta registration, status checking, and access control.
 * Designed to transition smoothly from CLOSED BETA -> OPEN BETA -> PRODUCTION
 */

import { supabase } from './supabase'

// Beta configuration - change this for different phases
export const BETA_CONFIG = {
  phase: 'closed' as 'closed' | 'open' | 'production',
  requiresApproval: true, // Set to false for open beta
  autoApprove: false, // Set to true for open beta or production
} as const

// Valid referral codes for instant approval
// Add codes here to grant instant beta access
const VALID_REFERRAL_CODES = [
  'SONA-EARLY-2026',
  'SONA-FRIEND',
  'SONA-VIP',
] as const

/**
 * Validate a referral code
 */
export function isValidReferralCode(code: string): boolean {
  if (!code) return false
  return VALID_REFERRAL_CODES.includes(code.toUpperCase().trim() as any)
}

export type BetaStatus = 'none' | 'pending' | 'approved' | 'rejected'

export type BetaRole = 'sound_designer' | 'music_producer' | 'content_creator' | 'game_developer' | 'film_post' | 'other'

export type BetaMode = 'designer' | 'producer' | 'creator'

export type BetaReferralSource = 
  | 'friend_referral' 
  | 'google_search' 
  | 'social_media' 
  | 'youtube' 
  | 'podcast' 
  | 'blog_article' 
  | 'direct_recommendation' 
  | 'other'

export interface BetaApplication {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  country: string
  role: BetaRole
  modes_of_interest: BetaMode[]
  referral_source: BetaReferralSource
  referral_detail?: string
  referral_code?: string
  status: BetaStatus
  created_at: string
  updated_at: string
  approved_at?: string
  rejected_at?: string
  admin_notes?: string
}

export interface BetaApplicationInput {
  email: string
  first_name: string
  last_name: string
  country: string
  role: BetaRole
  modes_of_interest: BetaMode[]
  referral_source: BetaReferralSource
  referral_detail?: string
  referral_code?: string
}

/**
 * Check if beta access is required based on current phase
 */
export function isBetaAccessRequired(): boolean {
  return BETA_CONFIG.phase !== 'production'
}

/**
 * Check if approval is needed (closed beta only)
 */
export function requiresApproval(): boolean {
  return BETA_CONFIG.phase === 'closed' && BETA_CONFIG.requiresApproval
}

/**
 * Get the beta status for a user
 */
export async function getBetaStatus(userId: string): Promise<BetaStatus> {
  // In production mode, everyone has access
  if (BETA_CONFIG.phase === 'production') {
    return 'approved'
  }

  try {
    const { data, error } = await supabase
      .from('beta_applications')
      .select('status')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return 'none'
    }

    return data.status as BetaStatus
  } catch (error) {
    console.error('Error checking beta status:', error)
    return 'none'
  }
}

/**
 * Get full beta application for a user
 */
export async function getBetaApplication(userId: string): Promise<BetaApplication | null> {
  try {
    const { data, error } = await supabase
      .from('beta_applications')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data as BetaApplication
  } catch (error) {
    console.error('Error getting beta application:', error)
    return null
  }
}

/**
 * Submit a beta application
 */
export async function submitBetaApplication(
  userId: string,
  application: BetaApplicationInput
): Promise<{ success: boolean; error?: string; autoApproved?: boolean }> {
  try {
    // Check if referral code grants instant approval
    const hasValidReferralCode = application.referral_code 
      ? isValidReferralCode(application.referral_code) 
      : false
    
    // Determine initial status based on beta phase or valid referral code
    const initialStatus: BetaStatus = (BETA_CONFIG.autoApprove || hasValidReferralCode) 
      ? 'approved' 
      : 'pending'

    const { error } = await supabase
      .from('beta_applications')
      .upsert({
        user_id: userId,
        email: application.email,
        first_name: application.first_name,
        last_name: application.last_name,
        country: application.country,
        role: application.role,
        modes_of_interest: application.modes_of_interest,
        referral_source: application.referral_source,
        referral_detail: application.referral_detail,
        referral_code: application.referral_code?.toUpperCase().trim() || null,
        status: initialStatus,
        updated_at: new Date().toISOString(),
        ...(initialStatus === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      })

    if (error) {
      console.error('Error submitting beta application:', error)
      return { success: false, error: error.message }
    }

    // Send appropriate email based on status
    if (initialStatus === 'approved') {
      // If auto-approved, trigger the approval email
      sendApprovalEmail(userId).catch((err) => {
        // Don't fail the submission if email fails
        console.warn('Failed to send approval email:', err)
      })
    } else {
      // If pending, send confirmation email to user + admin notification
      sendApplicationConfirmationEmail({
        userEmail: application.email,
        firstName: application.first_name,
        lastName: application.last_name,
        country: application.country,
        role: application.role,
        modesOfInterest: application.modes_of_interest,
        referralSource: application.referral_source,
      }).catch((err) => {
        // Don't fail the submission if email fails
        console.warn('Failed to send application confirmation email:', err)
      })
    }

    return { success: true, autoApproved: hasValidReferralCode }
  } catch (error) {
    console.error('Error submitting beta application:', error)
    return { success: false, error: 'Failed to submit application' }
  }
}

/**
 * Send approval email via edge function
 * This is called automatically when a user is auto-approved (referral code)
 * or can be called manually from admin dashboard
 */
async function sendApprovalEmail(userId: string): Promise<void> {
  try {
    const response = await supabase.functions.invoke('beta-approval', {
      body: { userId }
    })

    if (response.error) {
      console.error('Failed to send approval email:', response.error)
    } else {
      console.log('Approval email sent:', response.data)
    }
  } catch (error) {
    console.error('Error calling beta-approval function:', error)
  }
}

/**
 * Send application confirmation email via edge function
 * This is called when a user submits a beta application (pending status)
 * Sends confirmation to user + notification to admin
 */
interface ApplicationEmailData {
  userEmail: string
  firstName: string
  lastName: string
  country: string
  role: string
  modesOfInterest: string[]
  referralSource: string
}

async function sendApplicationConfirmationEmail(data: ApplicationEmailData): Promise<void> {
  try {
    const response = await supabase.functions.invoke('send-beta-application', {
      body: data
    })

    if (response.error) {
      console.error('Failed to send application confirmation email:', response.error)
    } else {
      console.log('Application confirmation email sent:', response.data)
    }
  } catch (error) {
    console.error('Error calling send-beta-application function:', error)
  }
}

/**
 * Check if user has beta access (approved status)
 */
export async function hasBetaAccess(userId: string): Promise<boolean> {
  const status = await getBetaStatus(userId)
  return status === 'approved'
}

// Role display labels
export const ROLE_LABELS: Record<BetaRole, string> = {
  sound_designer: 'Sound Designer',
  music_producer: 'Music Producer',
  content_creator: 'Content Creator',
  game_developer: 'Game Developer',
  film_post: 'Film/Post Production',
  other: 'Other',
}

// Mode display labels
export const MODE_LABELS: Record<BetaMode, { label: string; description: string }> = {
  designer: { label: 'Designer Mode', description: 'SFX & Foley' },
  producer: { label: 'Producer Mode', description: 'One-shots & Loops' },
  creator: { label: 'Creator Mode', description: 'Complete Songs & Stems' },
}

// Referral source labels
export const REFERRAL_LABELS: Record<BetaReferralSource, string> = {
  friend_referral: 'A friend told me about it',
  google_search: 'Google search',
  social_media: 'Social media (Twitter, Instagram, etc.)',
  youtube: 'YouTube',
  podcast: 'Podcast',
  blog_article: 'Blog or article',
  direct_recommendation: 'Direct recommendation',
  other: 'Other',
}
