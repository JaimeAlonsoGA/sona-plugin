/**
 * Admin API Functions
 * 
 * Functions for admin dashboard operations:
 * - Beta application management
 * - Reports/feedback management
 * - Statistics and analytics
 * - Admin user management
 */

import { supabase } from '../supabase'

// ============================================
// TYPES
// ============================================

export interface AdminStats {
  pending_applications: number
  approved_applications: number
  rejected_applications: number
  total_applications: number
  total_jobs: number
  completed_jobs: number
  failed_jobs: number
  jobs_last_24h: number
  jobs_last_7d: number
  new_reports: number
  total_reports: number
  total_tokens_purchased: number
  total_tokens_used: number
  total_tokens_balance: number
  total_purchases: number
  users_with_tokens: number
  active_admins: number
}

export interface FinanceStats {
  tokens_purchased_total: number
  tokens_used_total: number
  tokens_from_beta_bonus: number
  purchase_count: number
  unique_buyers: number
  total_users_with_tokens_record: number
  users_with_positive_balance: number
  avg_token_balance: number
}

export interface BetaApplication {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  country: string
  role: string
  referral_source: string
  referral_detail: string | null
  referral_code: string | null
  modes_of_interest: string[]
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  approved_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  user_id: string | null
  email: string | null
  feedback_type: 'bug' | 'feature' | 'general' | 'prompting'
  message: string
  job_id: string | null
  job_storage_url: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  granted_by: string | null
  granted_at: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'usage' | 'beta_bonus' | 'adjustment'
  amount: number
  description: string
  stripe_payment_id: string | null
  created_at: string
}

// Email sender options for report responses
export type ReportEmailSender = 'support' | 'hello' | 'jaime' | 'development'

export const REPORT_EMAIL_SENDERS: Record<ReportEmailSender, { label: string; email: string }> = {
  support: { label: 'Support', email: 'support@sona.audio' },
  hello: { label: 'Hello', email: 'hello@sona.audio' },
  jaime: { label: 'Jaime Alonso', email: 'jaime.alonso@sona.audio' },
  development: { label: 'Development', email: 'development@sona.audio' },
}

// Default sender based on feedback type
export const DEFAULT_EMAIL_SENDER: Record<string, ReportEmailSender> = {
  bug: 'support',
  feature: 'development',
  prompting: 'development',
  general: 'hello',
}

export interface SendReportEmailParams {
  reportId: string
  recipientEmail: string
  message: string
  feedbackType: 'bug' | 'feature' | 'prompting' | 'general'
  senderKey?: ReportEmailSender
  userName?: string
}

export interface SendReportEmailResponse {
  success: boolean
  emailId?: string
  error?: string
}

// ============================================
// ADMIN STATUS CHECK
// ============================================

/**
 * Check if current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .rpc('is_admin', { check_user_id: user.id })

  if (error) {
    console.error('[Admin] Error checking admin status:', error)
    return false
  }

  return data === true
}

// ============================================
// STATISTICS
// ============================================

/**
 * Fetch admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  const { data, error } = await supabase
    .from('admin_stats')
    .select('*')
    .single()

  if (error) {
    console.error('[Admin] Error fetching stats:', error)
    return null
  }

  return data as AdminStats
}

/**
 * Fetch financial statistics via direct queries
 * This approach is more scalable than maintaining view columns
 */
export async function getFinanceStats(): Promise<FinanceStats | null> {
  try {
    // Fetch all stats with parallel queries for efficiency
    const [
      purchaseResult,
      usageResult,
      betaBonusResult,
      uniqueBuyersResult,
      userTokensResult,
    ] = await Promise.all([
      // Total purchased tokens
      supabase
        .from('token_transactions')
        .select('amount')
        .eq('type', 'purchase'),
      // Total used tokens
      supabase
        .from('token_transactions')
        .select('amount')
        .eq('type', 'usage'),
      // Beta bonus tokens
      supabase
        .from('token_transactions')
        .select('amount')
        .eq('type', 'beta_bonus'),
      // Unique buyers
      supabase
        .from('token_transactions')
        .select('user_id')
        .eq('type', 'purchase'),
      // User tokens for balance stats
      supabase
        .from('user_tokens')
        .select('balance'),
    ])

    // Calculate aggregates
    const tokens_purchased_total = purchaseResult.data?.reduce((sum, t) => sum + t.amount, 0) || 0
    const tokens_used_total = usageResult.data?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
    const tokens_from_beta_bonus = betaBonusResult.data?.reduce((sum, t) => sum + t.amount, 0) || 0
    const purchase_count = purchaseResult.data?.length || 0
    const unique_buyers = new Set(uniqueBuyersResult.data?.map(t => t.user_id)).size
    const total_users_with_tokens_record = userTokensResult.data?.length || 0
    const users_with_positive_balance = userTokensResult.data?.filter(u => u.balance > 0).length || 0
    const avg_token_balance = userTokensResult.data?.length 
      ? userTokensResult.data.reduce((sum, u) => sum + u.balance, 0) / userTokensResult.data.length 
      : 0

    return {
      tokens_purchased_total,
      tokens_used_total,
      tokens_from_beta_bonus,
      purchase_count,
      unique_buyers,
      total_users_with_tokens_record,
      users_with_positive_balance,
      avg_token_balance,
    }
  } catch (error) {
    console.error('[Admin] Error fetching finance stats:', error)
    return null
  }
}

// ============================================
// BETA APPLICATIONS
// ============================================

/**
 * Fetch all beta applications with optional status filter
 */
export async function getBetaApplications(
  status?: 'pending' | 'approved' | 'rejected',
  limit = 50,
  offset = 0
): Promise<BetaApplication[]> {
  let query = supabase
    .from('beta_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Admin] Error fetching beta applications:', error)
    return []
  }

  return data as BetaApplication[]
}

/**
 * Approve a beta application via Edge Function
 */
export async function approveBetaApplication(
  userId: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string; emailSent?: boolean }> {
  const { data, error } = await supabase.functions.invoke('beta-approval', {
    body: { userId, adminNotes }
  })

  if (error) {
    console.error('[Admin] Error approving application:', error)
    return { success: false, message: error.message || 'Failed to approve application' }
  }

  return data as { success: boolean; message: string; emailSent?: boolean }
}

/**
 * Reject a beta application
 */
export async function rejectBetaApplication(
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('beta_applications')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      admin_notes: reason || null
    })
    .eq('user_id', userId)

  if (error) {
    console.error('[Admin] Error rejecting application:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Update admin notes on a beta application
 */
export async function updateBetaApplicationNotes(
  userId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('beta_applications')
    .update({ admin_notes: notes })
    .eq('user_id', userId)

  if (error) {
    console.error('[Admin] Error updating notes:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// REPORTS / FEEDBACK
// ============================================

/**
 * Fetch all reports with optional status filter
 */
export async function getReports(
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  feedbackType?: 'bug' | 'feature' | 'general' | 'prompting',
  limit = 50,
  offset = 0
): Promise<Report[]> {
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (feedbackType) {
    query = query.eq('feedback_type', feedbackType)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Admin] Error fetching reports:', error)
    return []
  }

  return data as Report[]
}

/**
 * Update report status
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = { status }
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes
  }

  const { error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    console.error('[Admin] Error updating report:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Add admin response/notes to a report
 */
export async function respondToReport(
  reportId: string,
  adminNotes: string,
  newStatus?: 'reviewed' | 'resolved' | 'dismissed'
): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = { admin_notes: adminNotes }
  if (newStatus) {
    updateData.status = newStatus
  }

  const { error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    console.error('[Admin] Error responding to report:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Send email response to a report using Resend
 */
export async function sendReportEmail(
  params: SendReportEmailParams
): Promise<SendReportEmailResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-report-response`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[Admin] Error sending report email:', data)
      return { success: false, error: data.error || 'Failed to send email' }
    }

    return { success: true, emailId: data.emailId }
  } catch (error) {
    console.error('[Admin] Error sending report email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// ============================================
// TOKEN TRANSACTIONS
// ============================================

/**
 * Fetch recent token transactions
 */
export async function getTokenTransactions(
  limit = 100,
  offset = 0,
  type?: string
): Promise<TokenTransaction[]> {
  let query = supabase
    .from('token_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Admin] Error fetching transactions:', error)
    return []
  }

  return data as TokenTransaction[]
}

/**
 * Manually add tokens to a user (admin adjustment)
 */
export async function addTokensToUser(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('add_user_tokens', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_transaction_type: 'adjustment'
  })

  if (error) {
    console.error('[Admin] Error adding tokens:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

/**
 * Fetch all admin users
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Admin] Error fetching admin users:', error)
    return []
  }

  return data as AdminUser[]
}

/**
 * Grant admin access to a user
 */
export async function grantAdminRole(
  userId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('admin_users')
    .insert({
      user_id: userId,
      granted_by: currentUser.id,
      notes: notes || null
    })

  if (error) {
    console.error('[Admin] Error granting admin role:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Revoke admin access from a user
 */
export async function revokeAdminRole(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: false })
    .eq('user_id', userId)

  if (error) {
    console.error('[Admin] Error revoking admin role:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// GENERATION STATISTICS
// ============================================

export interface GenerationStats {
  // By mode
  designer_jobs: number
  producer_jobs: number
  creator_jobs: number
  // By status
  completed_jobs: number
  failed_jobs: number
  pending_jobs: number
  processing_jobs: number
  // By skip naming
  with_naming: number
  skip_naming: number
  // By quality
  quality_standard: number
  quality_high: number
  // Duration stats
  avg_duration: number
  total_duration: number
  // Time-based
  jobs_today: number
  jobs_this_week: number
  jobs_this_month: number
  // Unique users
  unique_users_generated: number
  // Average per user
  avg_jobs_per_user: number
}

export interface ModeComparison {
  mode: string
  total: number
  completed: number
  failed: number
  success_rate: number
  avg_duration: number
  with_naming: number
  skip_naming: number
}

export interface RecentJob {
  id: string
  user_id: string
  user_email: string | null
  mode: string
  status: string
  prompt: string
  duration: number
  skip_naming: boolean | null
  quality: string
  created_at: string
  completed_at: string | null
  error_message: string | null
}

/**
 * Fetch generation statistics via direct queries
 */
export async function getGenerationStats(): Promise<GenerationStats | null> {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all jobs data
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('mode, status, skip_naming, quality, duration, user_id, created_at')

    if (error) {
      console.error('[Admin] Error fetching jobs:', error)
      return null
    }

    if (!jobs || jobs.length === 0) {
      return {
        designer_jobs: 0,
        producer_jobs: 0,
        creator_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        pending_jobs: 0,
        processing_jobs: 0,
        with_naming: 0,
        skip_naming: 0,
        quality_standard: 0,
        quality_high: 0,
        avg_duration: 0,
        total_duration: 0,
        jobs_today: 0,
        jobs_this_week: 0,
        jobs_this_month: 0,
        unique_users_generated: 0,
        avg_jobs_per_user: 0,
      }
    }

    // Calculate statistics
    const designer_jobs = jobs.filter(j => j.mode === 'designer').length
    const producer_jobs = jobs.filter(j => j.mode === 'producer').length
    const creator_jobs = jobs.filter(j => j.mode === 'creator').length

    const completed_jobs = jobs.filter(j => j.status === 'completed').length
    const failed_jobs = jobs.filter(j => j.status === 'failed').length
    const pending_jobs = jobs.filter(j => j.status === 'pending').length
    const processing_jobs = jobs.filter(j => j.status === 'processing').length

    const with_naming = jobs.filter(j => j.skip_naming === false || j.skip_naming === null).length
    const skip_naming = jobs.filter(j => j.skip_naming === true).length

    const quality_standard = jobs.filter(j => j.quality === 'standard').length
    const quality_high = jobs.filter(j => j.quality === 'high').length

    const completedJobsWithDuration = jobs.filter(j => j.status === 'completed' && j.duration > 0)
    const total_duration = completedJobsWithDuration.reduce((sum, j) => sum + j.duration, 0)
    const avg_duration = completedJobsWithDuration.length > 0
      ? total_duration / completedJobsWithDuration.length
      : 0

    const jobs_today = jobs.filter(j => j.created_at >= todayStart).length
    const jobs_this_week = jobs.filter(j => j.created_at >= weekStart).length
    const jobs_this_month = jobs.filter(j => j.created_at >= monthStart).length

    const uniqueUsers = new Set(jobs.map(j => j.user_id))
    const unique_users_generated = uniqueUsers.size
    const avg_jobs_per_user = unique_users_generated > 0 
      ? jobs.length / unique_users_generated 
      : 0

    return {
      designer_jobs,
      producer_jobs,
      creator_jobs,
      completed_jobs,
      failed_jobs,
      pending_jobs,
      processing_jobs,
      with_naming,
      skip_naming,
      quality_standard,
      quality_high,
      avg_duration,
      total_duration,
      jobs_today,
      jobs_this_week,
      jobs_this_month,
      unique_users_generated,
      avg_jobs_per_user,
    }
  } catch (error) {
    console.error('[Admin] Error calculating generation stats:', error)
    return null
  }
}

/**
 * Fetch mode comparison statistics
 */
export async function getModeComparison(): Promise<ModeComparison[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('mode, status, skip_naming, duration')

    if (error || !jobs) {
      console.error('[Admin] Error fetching mode comparison:', error)
      return []
    }

    const modes = ['designer', 'producer', 'creator']
    
    return modes.map(mode => {
      const modeJobs = jobs.filter(j => j.mode === mode)
      const completed = modeJobs.filter(j => j.status === 'completed')
      const failed = modeJobs.filter(j => j.status === 'failed')
      const completedWithDuration = completed.filter(j => j.duration > 0)
      
      return {
        mode,
        total: modeJobs.length,
        completed: completed.length,
        failed: failed.length,
        success_rate: modeJobs.length > 0 
          ? (completed.length / modeJobs.length) * 100 
          : 0,
        avg_duration: completedWithDuration.length > 0
          ? completedWithDuration.reduce((sum, j) => sum + j.duration, 0) / completedWithDuration.length
          : 0,
        with_naming: modeJobs.filter(j => !j.skip_naming).length,
        skip_naming: modeJobs.filter(j => j.skip_naming === true).length,
      }
    })
  } catch (error) {
    console.error('[Admin] Error calculating mode comparison:', error)
    return []
  }
}

/**
 * Fetch recent jobs for admin view
 */
export async function getRecentJobs(limit = 20): Promise<RecentJob[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, user_id, user_email, mode, status, prompt, duration, skip_naming, quality, created_at, completed_at, error_message')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Admin] Error fetching recent jobs:', error)
    return []
  }

  return data as RecentJob[]
}

