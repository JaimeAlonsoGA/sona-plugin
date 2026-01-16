/**
 * Admin TanStack Query Hooks
 * 
 * Provides optimized hooks for admin dashboard:
 * - Admin status checking
 * - Beta applications management
 * - Reports/feedback management
 * - Statistics and analytics
 * - Admin user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  checkIsAdmin,
  getAdminStats,
  getFinanceStats,
  getBetaApplications,
  approveBetaApplication,
  rejectBetaApplication,
  updateBetaApplicationNotes,
  getReports,
  updateReportStatus,
  respondToReport,
  sendReportEmail,
  getTokenTransactions,
  addTokensToUser,
  getAdminUsers,
  grantAdminRole,
  revokeAdminRole,
  getGenerationStats,
  getModeComparison,
  getRecentJobs,
  type AdminStats,
  type FinanceStats,
  type BetaApplication,
  type Report,
  type AdminUser,
  type TokenTransaction,
  type GenerationStats,
  type ModeComparison,
  type RecentJob,
  type SendReportEmailParams,
} from '../api/admin'
import { useIsAuthenticated } from './use-supabase'

/**
 * Query key factory for admin queries
 */
export const adminQueryKeys = {
  all: ['admin'] as const,
  isAdmin: () => [...adminQueryKeys.all, 'isAdmin'] as const,
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  financeStats: () => [...adminQueryKeys.all, 'financeStats'] as const,
  generationStats: () => [...adminQueryKeys.all, 'generationStats'] as const,
  modeComparison: () => [...adminQueryKeys.all, 'modeComparison'] as const,
  recentJobs: (limit?: number) => [...adminQueryKeys.all, 'recentJobs', limit] as const,
  betaApplications: (status?: string) => [...adminQueryKeys.all, 'betaApplications', status] as const,
  reports: (status?: string, type?: string) => [...adminQueryKeys.all, 'reports', status, type] as const,
  transactions: (type?: string) => [...adminQueryKeys.all, 'transactions', type] as const,
  adminUsers: () => [...adminQueryKeys.all, 'adminUsers'] as const,
}

// ============================================
// ADMIN STATUS HOOKS
// ============================================

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: adminQueryKeys.isAdmin(),
    queryFn: checkIsAdmin,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

// ============================================
// STATISTICS HOOKS
// ============================================

/**
 * Hook to fetch admin dashboard statistics
 */
export function useAdminStats() {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<AdminStats | null>({
    queryKey: adminQueryKeys.stats(),
    queryFn: getAdminStats,
    enabled: isAdmin === true,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

/**
 * Hook to fetch financial statistics
 */
export function useFinanceStats() {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<FinanceStats | null>({
    queryKey: adminQueryKeys.financeStats(),
    queryFn: getFinanceStats,
    enabled: isAdmin === true,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// ============================================
// BETA APPLICATIONS HOOKS
// ============================================

/**
 * Hook to fetch beta applications
 */
export function useBetaApplications(
  status?: 'pending' | 'approved' | 'rejected',
  limit = 50
) {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<BetaApplication[]>({
    queryKey: adminQueryKeys.betaApplications(status),
    queryFn: () => getBetaApplications(status, limit),
    enabled: isAdmin === true,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to approve a beta application
 */
export function useApproveBetaApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, adminNotes }: { userId: string; adminNotes?: string }) =>
      approveBetaApplication(userId, adminNotes),
    onSuccess: () => {
      // Invalidate beta applications queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.betaApplications() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

/**
 * Hook to reject a beta application
 */
export function useRejectBetaApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectBetaApplication(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.betaApplications() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

/**
 * Hook to update beta application notes
 */
export function useUpdateBetaApplicationNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, notes }: { userId: string; notes: string }) =>
      updateBetaApplicationNotes(userId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.betaApplications() })
    },
  })
}

// ============================================
// REPORTS HOOKS
// ============================================

/**
 * Hook to fetch reports
 */
export function useReports(
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  feedbackType?: 'bug' | 'feature' | 'general' | 'prompting',
  limit = 50
) {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<Report[]>({
    queryKey: adminQueryKeys.reports(status, feedbackType),
    queryFn: () => getReports(status, feedbackType, limit),
    enabled: isAdmin === true,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to update report status
 */
export function useUpdateReportStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      status,
      adminNotes,
    }: {
      reportId: string
      status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
      adminNotes?: string
    }) => updateReportStatus(reportId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

/**
 * Hook to respond to a report
 */
export function useRespondToReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      adminNotes,
      newStatus,
    }: {
      reportId: string
      adminNotes: string
      newStatus?: 'reviewed' | 'resolved' | 'dismissed'
    }) => respondToReport(reportId, adminNotes, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports() })
    },
  })
}

/**
 * Hook to send email response to a report
 */
export function useSendReportEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SendReportEmailParams) => sendReportEmail(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

// ============================================
// TRANSACTIONS HOOKS
// ============================================

/**
 * Hook to fetch token transactions
 */
export function useTokenTransactionsAdmin(limit = 100, type?: string) {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<TokenTransaction[]>({
    queryKey: adminQueryKeys.transactions(type),
    queryFn: () => getTokenTransactions(limit, 0, type),
    enabled: isAdmin === true,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to add tokens to a user
 */
export function useAddTokensToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      amount,
      description,
    }: {
      userId: string
      amount: number
      description: string
    }) => addTokensToUser(userId, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.financeStats() })
    },
  })
}

// ============================================
// ADMIN USER MANAGEMENT HOOKS
// ============================================

/**
 * Hook to fetch all admin users
 */
export function useAdminUsers() {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<AdminUser[]>({
    queryKey: adminQueryKeys.adminUsers(),
    queryFn: getAdminUsers,
    enabled: isAdmin === true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to grant admin role
 */
export function useGrantAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      notes,
    }: {
      userId: string
      notes?: string
    }) => grantAdminRole(userId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

/**
 * Hook to revoke admin role
 */
export function useRevokeAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => revokeAdminRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminUsers() })
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() })
    },
  })
}

// ============================================
// GENERATION STATISTICS HOOKS
// ============================================

/**
 * Hook to fetch generation statistics
 */
export function useGenerationStats() {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<GenerationStats | null>({
    queryKey: adminQueryKeys.generationStats(),
    queryFn: getGenerationStats,
    enabled: isAdmin === true,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

/**
 * Hook to fetch mode comparison statistics
 */
export function useModeComparison() {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<ModeComparison[]>({
    queryKey: adminQueryKeys.modeComparison(),
    queryFn: getModeComparison,
    enabled: isAdmin === true,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

/**
 * Hook to fetch recent jobs
 */
export function useRecentJobsAdmin(limit = 20) {
  const { data: isAdmin } = useIsAdmin()

  return useQuery<RecentJob[]>({
    queryKey: adminQueryKeys.recentJobs(limit),
    queryFn: () => getRecentJobs(limit),
    enabled: isAdmin === true,
    staleTime: 1000 * 30, // 30 seconds
  })
}

// ============================================
// HELPER HOOK FOR ADMIN GATE
// ============================================

/**
 * Composite hook for admin access control
 * Returns all necessary data for admin route protection
 */
export function useAdminAccess() {
  const isAuthenticated = useIsAuthenticated()
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin()

  return {
    isAuthenticated,
    isAdmin: isAdmin === true,
    isLoading: isAdminLoading,
  }
}

