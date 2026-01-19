/**
 * Profile Page
 * 
 * User account and navigation
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession, useSignOut, useCompletedJobs, useUserTokens, useTotalCompletedJobsCount } from '../../lib/hooks'
import { ROUTES } from '../../routes'
import { Card, Button, IconButton } from '../../components/shared'
import { ChevronLeftIcon, ChevronRightIcon, LogOutIcon, WaveformIcon } from '../../components/shared/icons'
import { NamingSettings } from '../../components/profile'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const signOutMutation = useSignOut({
    onSuccess: () => navigate(ROUTES.AUTH),
  })

  const { completedCount, isLoading: isLoadingJobs } = useCompletedJobs()
  const { data: totalCompletedCount, isLoading: isLoadingTotalCount } = useTotalCompletedJobsCount()
  const { data: userTokens, isLoading: isLoadingTokens } = useUserTokens()

  const user = session?.user
  const userInitial = user?.email?.charAt(0).toUpperCase() || '?'
  const tokenBalance = userTokens?.balance ?? 0

  return (
    <div className="page">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-4">
        <IconButton
          icon={<ChevronLeftIcon className="w-5 h-5" />}
          onClick={() => navigate(ROUTES.HOME)}
          label="Back"
        />
        <h1 className="text-base font-medium text-[var(--sona-text)]">Profile</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-md mx-auto space-y-4">
          {/* User Card */}
          <Card
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded-full flex items-center justify-center text-[var(--sona-text-muted)] text-lg font-medium">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--sona-text)] font-medium truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 text-[var(--sona-text-subtle)] text-sm">
                  <span>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '...'}
                  </span>
                  <span className="text-[var(--sona-border)]">·</span>
                  <span className="text-[var(--sona-sage)]">
                    {isLoadingTotalCount ? '...' : `${totalCompletedCount ?? 0} creations`}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sound Library Link */}
          <Card
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            interactive
            onClick={() => navigate(ROUTES.SOUNDS)}
            className="cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--sona-sage)]/10 rounded-xl flex items-center justify-center">
                  <WaveformIcon size={18} className="text-[var(--sona-sage)]" />
                </div>
                <div>
                  <p className="text-[var(--sona-text)] font-medium">My Sounds</p>
                  <p className="text-[var(--sona-text-muted)] text-sm">
                    {isLoadingJobs ? '...' : `Last ${completedCount} sounds in storage`}
                  </p>
                </div>
              </div>
              <ChevronRightIcon size={18} className="text-[var(--sona-text-subtle)] group-hover:text-[var(--sona-sage)] transition-colors" />
            </div>
          </Card>

          {/* Subscription Card */}
          <Card
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            interactive
            onClick={() => navigate(ROUTES.BILLING)}
            className="cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--sona-text)] font-medium">Tokens</h2>
              <span className="sona-chip active">
                Beta
              </span>
            </div>

            {/* Token Balance */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--sona-text-muted)] text-sm">Current balance</span>
                {isLoadingTokens ? (
                  <div className="h-5 w-12 bg-[var(--sona-border)] rounded animate-pulse" />
                ) : (
                  <span className="text-[var(--sona-gold)] font-medium">
                    {tokenBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="h-1 bg-[var(--sona-border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: tokenBalance > 0 ? '100%' : '0%' }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="h-full bg-[var(--sona-gold)] rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[var(--sona-text-subtle)] text-xs">
                Click to buy more tokens
              </p>
              <ChevronRightIcon size={16} className="text-[var(--sona-text-subtle)] group-hover:text-[var(--sona-gold)] transition-colors" />
            </div>
          </Card>

          {/* Prompting Guide Link */}
          {/* <Card
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            interactive
            onClick={() => navigate(ROUTES.PROMPTING)}
            className="cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--sona-ember)]/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <p className="text-[var(--sona-text)] font-medium">Prompting Guide</p>
                  <p className="text-[var(--sona-text-muted)] text-sm">
                    Learn Stable Audio 2.5 tips
                  </p>
                </div>
              </div>
              <ChevronRightIcon size={18} className="text-[var(--sona-text-subtle)] group-hover:text-[var(--sona-ember)] transition-colors" />
            </div>
          </Card> */}

          {/* Naming Convention Settings */}
          <NamingSettings />

          {/* Beta Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center py-6"
          >
            <p className="text-[var(--sona-text-subtle)] text-xs">
              Beta version · More features coming soon
            </p>
          </motion.div>

          {/* Sign Out */}
          <Button
            variant="ghost"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            loading={signOutMutation.isPending}
            icon={<LogOutIcon size={15} />}
            className="w-full justify-start text-[var(--sona-text-muted)] hover:text-[var(--sona-ember)]"
          >
            {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-3 text-center">
        <p className="text-[10px] text-[var(--sona-text-subtle)] tracking-wider">
          Closed Beta v1.0.0 · aiwasamistake.ai
        </p>
      </footer>
    </div>
  )
}
