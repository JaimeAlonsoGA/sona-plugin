/**
 * Admin Dashboard Page
 * 
 * Protected admin page with sections for:
 * - Overview statistics
 * - Beta applications management
 * - User feedback/reports
 * - Financial analytics
 * - Admin user management
 */

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  MessageSquare,
  DollarSign,
  UserCog,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Send,
  Loader2,
  TrendingUp,
  Coins,
  FileText,
  UserPlus,
  UserMinus,
  Zap,
  BarChart3,
  Palette,
  Music,
  Sparkles,
  Tag,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  useAdminAccess,
  useAdminStats,
  useFinanceStats,
  useBetaApplications,
  useApproveBetaApplication,
  useRejectBetaApplication,
  useReports,
  useUpdateReportStatus,
  useRespondToReport,
  useSendReportEmail,
  useTokenTransactionsAdmin,
  useAdminUsers,
  useGrantAdminRole,
  useRevokeAdminRole,
  useGenerationStats,
  useModeComparison,
  useRecentJobsAdmin,
} from '@/lib/hooks/use-admin'
import {
  REPORT_EMAIL_SENDERS,
  DEFAULT_EMAIL_SENDER,
  type ReportEmailSender,
} from '@/lib/api/admin'

// ============================================
// TAB NAVIGATION
// ============================================

type AdminTab = 'overview' | 'generations' | 'beta' | 'reports' | 'finance' | 'admins'

const ADMIN_TABS: { id: AdminTab; label: string; icon: typeof Shield }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'generations', label: 'Generations', icon: Zap },
  { id: 'beta', label: 'Beta Applications', icon: Users },
  { id: 'reports', label: 'Feedback', icon: MessageSquare },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'admins', label: 'Admin Users', icon: UserCog },
]

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  trend,
}: {
  label: string
  value: string | number
  icon: typeof Activity
  color?: string
  trend?: string
}) {
  return (
    <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-4 border border-gray-200 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {trend && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `var(--${color})/10` }}
        >
          <Icon className="w-5 h-5" style={{ color: `var(--${color})` }} />
        </div>
      </div>
    </div>
  )
}

// ============================================
// OVERVIEW SECTION
// ============================================

function OverviewSection() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-landing-subtext-light dark:text-landing-subtext-dark">
        Failed to load statistics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pending Applications"
          value={stats.pending_applications}
          icon={Clock}
          color="sona-gold"
        />
        <StatCard
          label="Approved Users"
          value={stats.approved_applications}
          icon={CheckCircle}
          color="sona-producer"
        />
        <StatCard
          label="New Reports"
          value={stats.new_reports}
          icon={MessageSquare}
          color="sona-designer"
        />
        <StatCard
          label="Active Admins"
          value={stats.active_admins}
          icon={Shield}
          color="sona-creator"
        />
      </div>

      {/* Jobs Stats */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Generation Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Total Jobs</p>
            <p className="text-xl font-bold">{stats.total_jobs.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Completed</p>
            <p className="text-xl font-bold text-green-500">{stats.completed_jobs.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Last 24h</p>
            <p className="text-xl font-bold">{stats.jobs_last_24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Last 7 Days</p>
            <p className="text-xl font-bold">{stats.jobs_last_7d.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-[var(--sona-gold)]" />
          Token Economy
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Total Purchased</p>
            <p className="text-xl font-bold">{stats.total_tokens_purchased.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Total Used</p>
            <p className="text-xl font-bold">{stats.total_tokens_used.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Current Balance</p>
            <p className="text-xl font-bold text-primary">{stats.total_tokens_balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Users with Tokens</p>
            <p className="text-xl font-bold">{stats.users_with_tokens.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// BETA APPLICATIONS SECTION
// ============================================

function BetaApplicationsSection() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: applications = [], isLoading, refetch } = useBetaApplications(statusFilter)
  const approveMutation = useApproveBetaApplication()
  const rejectMutation = useRejectBetaApplication()

  const handleApprove = async (userId: string) => {
    await approveMutation.mutateAsync({ userId })
  }

  const handleReject = async (userId: string) => {
    const reason = prompt('Reason for rejection (optional):')
    await rejectMutation.mutateAsync({ userId, reason: reason || undefined })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? undefined : status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-landing-surface-light dark:bg-landing-surface-dark hover:bg-primary/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-landing-subtext-light dark:text-landing-subtext-dark">
          No applications found
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              layout
              className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    app.status === 'pending' ? 'bg-yellow-500' :
                    app.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{app.first_name} {app.last_name}</p>
                    <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                      {app.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                  {expandedId === app.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 dark:border-white/10"
                  >
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Role:</span>
                          <p className="font-medium">{app.role}</p>
                        </div>
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Country:</span>
                          <p className="font-medium">{app.country}</p>
                        </div>
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Referral:</span>
                          <p className="font-medium">{app.referral_source}</p>
                        </div>
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Interests:</span>
                          <p className="font-medium">{app.modes_of_interest?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>

                      {app.referral_detail && (
                        <div className="text-sm">
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Referral Detail:</span>
                          <p className="mt-1">{app.referral_detail}</p>
                        </div>
                      )}

                      {app.admin_notes && (
                        <div className="text-sm">
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Admin Notes:</span>
                          <p className="mt-1">{app.admin_notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {app.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(app.user_id)
                            }}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(app.user_id)
                            }}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// REPORTS SECTION
// ============================================

function ReportsSection() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed' | undefined>('pending')
  const [typeFilter, setTypeFilter] = useState<'bug' | 'feature' | 'general' | 'prompting' | undefined>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [selectedSender, setSelectedSender] = useState<ReportEmailSender | null>(null)
  const [showEmailForm, setShowEmailForm] = useState<string | null>(null)

  const { data: reports = [], isLoading } = useReports(statusFilter, typeFilter)
  const updateStatusMutation = useUpdateReportStatus()
  const respondMutation = useRespondToReport()
  const sendEmailMutation = useSendReportEmail()

  const handleStatusChange = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    await updateStatusMutation.mutateAsync({ reportId, status })
  }

  const handleRespond = async (reportId: string) => {
    if (!responseText.trim()) return
    await respondMutation.mutateAsync({
      reportId,
      adminNotes: responseText.trim(),
      newStatus: 'reviewed',
    })
    setResponseText('')
  }

  const handleSendEmail = async (report: typeof reports[0]) => {
    if (!responseText.trim() || !report.email) return
    
    const sender = selectedSender || DEFAULT_EMAIL_SENDER[report.feedback_type]
    
    const result = await sendEmailMutation.mutateAsync({
      reportId: report.id,
      recipientEmail: report.email,
      message: responseText.trim(),
      feedbackType: report.feedback_type,
      senderKey: sender,
    })

    if (result.success) {
      setResponseText('')
      setShowEmailForm(null)
      setSelectedSender(null)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'text-red-500 bg-red-500/10'
      case 'feature': return 'text-blue-500 bg-blue-500/10'
      case 'prompting': return 'text-purple-500 bg-purple-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getDefaultSenderLabel = (feedbackType: string) => {
    const senderKey = DEFAULT_EMAIL_SENDER[feedbackType]
    return REPORT_EMAIL_SENDERS[senderKey]?.label || 'Hello'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? undefined : status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-landing-surface-light dark:bg-landing-surface-dark hover:bg-primary/10'
              }`}
            >
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['bug', 'feature', 'prompting', 'general'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? undefined : type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? getTypeColor(type)
                  : 'bg-landing-surface-light dark:bg-landing-surface-dark hover:bg-primary/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-landing-subtext-light dark:text-landing-subtext-dark">
          No reports found
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              layout
              className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => {
                  setExpandedId(expandedId === report.id ? null : report.id)
                  setShowEmailForm(null)
                  setResponseText('')
                }}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(report.feedback_type)}`}>
                    {report.feedback_type}
                  </span>
                  <p className="font-medium text-sm truncate max-w-md">
                    {report.message.slice(0, 80)}{report.message.length > 80 ? '...' : ''}
                  </p>
                  {report.email && (
                    <Mail className="w-3 h-3 text-landing-subtext-light dark:text-landing-subtext-dark" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    report.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                    report.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </span>
                  {expandedId === report.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === report.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 dark:border-white/10"
                  >
                    <div className="p-4 space-y-4">
                      <div className="text-sm">
                        <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Message:</span>
                        <p className="mt-1 whitespace-pre-wrap">{report.message}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Email:</span>
                          <p className="font-medium">{report.email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Date:</span>
                          <p className="font-medium">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {report.admin_notes && (
                        <div className="text-sm">
                          <span className="text-landing-subtext-light dark:text-landing-subtext-dark">Admin Notes:</span>
                          <p className="mt-1 bg-primary/5 p-2 rounded whitespace-pre-wrap">{report.admin_notes}</p>
                        </div>
                      )}

                      {/* Email Response Form */}
                      {showEmailForm === report.id ? (
                        <div className="space-y-3 p-4 bg-landing-bg-light dark:bg-landing-bg-dark rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Send Email Response
                            </h4>
                            <button
                              onClick={() => {
                                setShowEmailForm(null)
                                setResponseText('')
                                setSelectedSender(null)
                              }}
                              className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark hover:text-primary"
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Sender Selection */}
                          <div>
                            <label className="block text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
                              From (default: {getDefaultSenderLabel(report.feedback_type)})
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {(Object.keys(REPORT_EMAIL_SENDERS) as ReportEmailSender[]).map((key) => (
                                <button
                                  key={key}
                                  onClick={() => setSelectedSender(selectedSender === key ? null : key)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    selectedSender === key || (!selectedSender && DEFAULT_EMAIL_SENDER[report.feedback_type] === key)
                                      ? 'bg-primary text-white'
                                      : 'bg-landing-surface-light dark:bg-landing-surface-dark hover:bg-primary/10'
                                  }`}
                                >
                                  {REPORT_EMAIL_SENDERS[key].label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* To */}
                          <div>
                            <label className="block text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
                              To
                            </label>
                            <p className="text-sm font-medium">{report.email}</p>
                          </div>

                          {/* Message */}
                          <div>
                            <label className="block text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
                              Message
                            </label>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response..."
                              className="w-full p-3 rounded-lg bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 text-sm resize-none"
                              rows={4}
                            />
                          </div>

                          {/* Send Button */}
                          <button
                            onClick={() => handleSendEmail(report)}
                            disabled={!responseText.trim() || sendEmailMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {sendEmailMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Send Email
                          </button>
                        </div>
                      ) : (
                        /* Quick Response Form */
                        <div className="space-y-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Add a note (internal only)..."
                            className="w-full p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 text-sm resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleRespond(report.id)}
                              disabled={!responseText.trim() || respondMutation.isPending}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                              {respondMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              Save Note
                            </button>
                            {report.email && (
                              <button
                                onClick={() => {
                                  setShowEmailForm(report.id)
                                  setResponseText('')
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                Reply by Email
                              </button>
                            )}
                            {report.status !== 'resolved' && (
                              <button
                                onClick={() => handleStatusChange(report.id, 'resolved')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Resolve
                              </button>
                            )}
                            {report.status !== 'dismissed' && (
                              <button
                                onClick={() => handleStatusChange(report.id, 'dismissed')}
                                disabled={updateStatusMutation.isPending}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// FINANCE SECTION
// ============================================

function FinanceSection() {
  const { data: financeStats, isLoading: statsLoading } = useFinanceStats()
  const { data: transactions = [], isLoading: transactionsLoading } = useTokenTransactionsAdmin(50)

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Finance Stats */}
      {financeStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Purchased"
            value={financeStats.tokens_purchased_total}
            icon={Coins}
            color="sona-gold"
          />
          <StatCard
            label="Total Used"
            value={financeStats.tokens_used_total}
            icon={Activity}
            color="sona-producer"
          />
          <StatCard
            label="Unique Buyers"
            value={financeStats.unique_buyers}
            icon={Users}
            color="primary"
          />
          <StatCard
            label="Avg Balance"
            value={financeStats.avg_token_balance?.toFixed(0) || 0}
            icon={TrendingUp}
            color="sona-creator"
          />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recent Transactions
        </h3>
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center py-8 text-landing-subtext-light dark:text-landing-subtext-dark">
            No transactions found
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'purchase' ? 'bg-green-500/10 text-green-500' :
                    tx.type === 'usage' ? 'bg-red-500/10 text-red-500' :
                    tx.type === 'beta_bonus' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`font-mono font-bold ${
                  tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// ADMIN USERS SECTION
// ============================================

function AdminUsersSection() {
  const { data: adminUsers = [], isLoading, refetch } = useAdminUsers()
  const grantMutation = useGrantAdminRole()
  const revokeMutation = useRevokeAdminRole()

  const [newAdminId, setNewAdminId] = useState('')
  const [newAdminNotes, setNewAdminNotes] = useState('')

  const handleGrant = async () => {
    if (!newAdminId.trim()) return
    await grantMutation.mutateAsync({
      userId: newAdminId.trim(),
      notes: newAdminNotes.trim() || undefined,
    })
    setNewAdminId('')
    setNewAdminNotes('')
  }

  const handleRevoke = async (userId: string) => {
    if (confirm('Revoke admin access for this user?')) {
      await revokeMutation.mutateAsync(userId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Admin */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Grant Admin Access
        </h3>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
              User ID
            </label>
            <input
              type="text"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              placeholder="Enter user UUID..."
              className="w-full p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={newAdminNotes}
              onChange={(e) => setNewAdminNotes(e.target.value)}
              placeholder="e.g., Reason for granting..."
              className="w-full p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 text-sm"
            />
          </div>
          <button
            onClick={handleGrant}
            disabled={!newAdminId.trim() || grantMutation.isPending}
            className="px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {grantMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Grant Access'
            )}
          </button>
        </div>
      </div>

      {/* Admin Users List */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[var(--sona-creator)]" />
            Admin Users
          </h3>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : adminUsers.length === 0 ? (
          <p className="text-center py-8 text-landing-subtext-light dark:text-landing-subtext-dark">
            No admin users found
          </p>
        ) : (
          <div className="space-y-2">
            {adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm font-mono">{admin.user_id}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        Admin
                      </span>
                      {!admin.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                          Inactive
                        </span>
                      )}
                      {admin.notes && (
                        <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                          • {admin.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {admin.is_active && (
                  <button
                    onClick={() => handleRevoke(admin.user_id)}
                    disabled={revokeMutation.isPending}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Revoke access"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// GENERATIONS SECTION
// ============================================

function GenerationsSection() {
  const { data: stats, isLoading: statsLoading } = useGenerationStats()
  const { data: modeComparison = [], isLoading: modesLoading } = useModeComparison()
  const { data: recentJobs = [], isLoading: jobsLoading, refetch } = useRecentJobsAdmin(20)

  const isLoading = statsLoading || modesLoading || jobsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-landing-subtext-light dark:text-landing-subtext-dark">
        Failed to load generation statistics
      </div>
    )
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'designer': return Palette
      case 'producer': return Music
      case 'creator': return Sparkles
      default: return BarChart3
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'designer': return 'sona-designer'
      case 'producer': return 'sona-producer'
      case 'creator': return 'sona-creator'
      default: return 'primary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      case 'processing': return 'text-blue-500'
      case 'pending': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toFixed(0)}s`
  }

  const successRate = stats.completed_jobs + stats.failed_jobs > 0
    ? ((stats.completed_jobs / (stats.completed_jobs + stats.failed_jobs)) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Generations"
          value={stats.completed_jobs + stats.failed_jobs + stats.pending_jobs + stats.processing_jobs}
          icon={Zap}
          color="primary"
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          icon={CheckCircle}
          color="sona-producer"
        />
        <StatCard
          label="Failed Jobs"
          value={stats.failed_jobs}
          icon={AlertTriangle}
          color="sona-gold"
        />
        <StatCard
          label="Unique Users"
          value={stats.unique_users_generated}
          icon={Users}
          color="sona-creator"
        />
      </div>

      {/* Mode Comparison */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Mode Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modeComparison.map((mode) => {
            const Icon = getModeIcon(mode.mode)
            const color = getModeColor(mode.mode)
            return (
              <div
                key={mode.mode}
                className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--${color})]/10`}>
                    <Icon className={`w-5 h-5 text-[var(--${color})]`} />
                  </div>
                  <div>
                    <h4 className="font-bold capitalize">{mode.mode}</h4>
                    <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                      {mode.total.toLocaleString()} total jobs
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">Completed</p>
                    <p className="font-bold text-green-500">{mode.completed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">Failed</p>
                    <p className="font-bold text-red-500">{mode.failed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">Success Rate</p>
                    <p className="font-bold">{mode.success_rate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">Avg Duration</p>
                    <p className="font-bold">{formatDuration(mode.avg_duration)}</p>
                  </div>
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">With Naming</p>
                    <p className="font-bold">{mode.with_naming.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">Skip Naming</p>
                    <p className="font-bold">{mode.skip_naming.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Job Status & Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--sona-producer)]" />
            Job Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Completed</span>
              </div>
              <span className="font-bold text-green-500">{stats.completed_jobs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Failed</span>
              </div>
              <span className="font-bold text-red-500">{stats.failed_jobs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Processing</span>
              </div>
              <span className="font-bold text-blue-500">{stats.processing_jobs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Pending</span>
              </div>
              <span className="font-bold text-yellow-500">{stats.pending_jobs.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quality & Naming */}
        <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--sona-designer)]" />
            Quality & Naming
          </h3>
          <div className="space-y-4">
            {/* Quality */}
            <div>
              <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-2">Quality Distribution</p>
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
                  <p className="text-2xl font-bold">{stats.quality_standard.toLocaleString()}</p>
                  <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">Standard</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
                  <p className="text-2xl font-bold text-primary">{stats.quality_high.toLocaleString()}</p>
                  <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">High Quality</p>
                </div>
              </div>
            </div>
            {/* Naming */}
            <div>
              <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-2">Naming Feature</p>
              <div className="flex gap-4">
                <div className="flex-1 p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.with_naming.toLocaleString()}</p>
                  <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">With Naming</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
                  <p className="text-2xl font-bold text-gray-400">{stats.skip_naming.toLocaleString()}</p>
                  <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">Skip Naming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--sona-gold)]" />
          Activity Timeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
            <p className="text-3xl font-bold">{stats.jobs_today.toLocaleString()}</p>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Today</p>
          </div>
          <div className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
            <p className="text-3xl font-bold">{stats.jobs_this_week.toLocaleString()}</p>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">This Week</p>
          </div>
          <div className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
            <p className="text-3xl font-bold">{stats.jobs_this_month.toLocaleString()}</p>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">This Month</p>
          </div>
          <div className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark text-center">
            <p className="text-3xl font-bold">{stats.avg_jobs_per_user.toFixed(1)}</p>
            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Avg Jobs/User</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark">
          <div className="flex justify-between items-center">
            <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Average Generation Time</span>
            <span className="font-bold">{formatDuration(stats.avg_duration)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">Total Processing Time</span>
            <span className="font-bold">{formatDuration(stats.total_duration)}</span>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Jobs
          </h3>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <p className="text-center py-8 text-landing-subtext-light dark:text-landing-subtext-dark">
            No jobs found
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentJobs.map((job) => {
              const ModeIcon = getModeIcon(job.mode)
              const modeColor = getModeColor(job.mode)
              return (
                <div
                  key={job.id}
                  className="p-4 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--${modeColor})]/10 shrink-0`}>
                        <ModeIcon className={`w-4 h-4 text-[var(--${modeColor})]`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={job.prompt}>
                          {job.prompt || 'No prompt'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-white/10 capitalize">
                            {job.mode}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-white/10">
                            {job.quality}
                          </span>
                          {job.skip_naming && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-white/10">
                              No naming
                            </span>
                          )}
                          {job.duration && (
                            <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                              {job.duration}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs font-mono text-landing-subtext-light dark:text-landing-subtext-dark mt-1" title={job.user_id}>
                        {job.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// MAIN ADMIN PAGE
// ============================================

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const { isAdmin, isLoading, isAuthenticated } = useAdminAccess()

  // Loading state
  if (isLoading) {
    return (
      <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-landing-subtext-light dark:text-landing-subtext-dark">
            Verifying admin access...
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
        <LandingNav />
        <div className="pt-32 pb-24 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-landing-subtext-light dark:text-landing-subtext-dark">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
        <LandingFooter />
      </div>
    )
  }

  return (
    <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <LandingNav />

      {/* Header */}
      <section className="bg-gradient-to-br from-[var(--sona-deep)] to-black relative pt-32 pb-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-5xl font-bold text-landing-subtext-light">Admin Dashboard</h1>
              <p className="text-landing-subtext-dark">
                SONA Administration Panel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 bg-landing-bg-light dark:bg-landing-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewSection />}
              {activeTab === 'generations' && <GenerationsSection />}
              {activeTab === 'beta' && <BetaApplicationsSection />}
              {activeTab === 'reports' && <ReportsSection />}
              {activeTab === 'finance' && <FinanceSection />}
              {activeTab === 'admins' && <AdminUsersSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
