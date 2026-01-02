/**
 * Profile Page
 * 
 * User account and navigation
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession, useSignOut, useCompletedJobs } from '../lib/hooks'
import { ROUTES } from '../routes'
import { Card, Button, IconButton } from '../components/shared'
import { ChevronLeftIcon, ChevronRightIcon, LogOutIcon, WaveformIcon } from '../components/shared/icons'

// Mock subscription data - TODO: replace with real subscription data
const mockSubscription = {
  tier: 'Creator',
  tokensUsed: 0,
  tokensTotal: Infinity,
  renewsAt: '2030-01-15',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const signOutMutation = useSignOut({
    onSuccess: () => navigate(ROUTES.AUTH),
  })

  const { completedCount, isLoading: isLoadingJobs } = useCompletedJobs()

  const user = session?.user
  const userInitial = user?.email?.charAt(0).toUpperCase() || '?'
  const tokensLeft = mockSubscription.tokensTotal - mockSubscription.tokensUsed
  const tokensPercentage = (mockSubscription.tokensUsed / mockSubscription.tokensTotal) * 100

  return (
    <div className="page">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-4">
        <IconButton
          icon={<ChevronLeftIcon size={18} />}
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
                <p className="text-[var(--sona-text-subtle)] text-sm">
                  Member since {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '...'}
                </p>
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
                    {isLoadingJobs ? '...' : `${completedCount} creations`}
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
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--sona-text)] font-medium">Subscription</h2>
              <span className="sona-chip active">
                {mockSubscription.tier}
              </span>
            </div>

            {/* Tokens */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--sona-text-muted)] text-sm">Tokens remaining</span>
                <span className="text-[var(--sona-gold)] font-medium">
                  {tokensLeft === Infinity ? '∞' : tokensLeft}
                </span>
              </div>
              <div className="h-1 bg-[var(--sona-border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - tokensPercentage}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="h-full bg-[var(--sona-sage)] rounded-full"
                />
              </div>
            </div>

            <p className="sona-label">
              Renews {mockSubscription.renewsAt}
            </p>
          </Card>

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
          sona v0.1.0 · prototip
        </p>
      </footer>
    </div>
  )
}
