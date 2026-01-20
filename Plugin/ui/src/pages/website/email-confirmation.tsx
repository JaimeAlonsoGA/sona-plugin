/**
 * Email Confirmation Page
 * 
 * Shown after user confirms their email from the magic link.
 * Displays beta application status message.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle, Loader2, Mail, Download, Home, RefreshCw } from 'lucide-react'
import { LandingNav } from '../../components/landing/landing-nav'
import { LandingFooter } from '../../components/landing/landing-footer'
import { BetaModal } from '../../components/landing/beta-modal'
import { useSession } from '../../lib/hooks'
import { getBetaStatus, BetaStatus } from '../../lib/beta'
import { useAccessGate } from '@/hooks/use-access-gate'

/**
 * User states:
 * 1. Error from URL params (auth error)
 * 2. No session (not logged in)
 * 3. Email not confirmed
 * 4. Email confirmed + beta none (hasn't applied)
 * 5. Email confirmed + beta pending (application under review)
 * 6. Email confirmed + beta approved (can download)
 * 7. Email confirmed + beta rejected
 */

export default function EmailConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: session, isLoading: sessionLoading } = useSession()

  const { handleProtectedAction, openModal, isModalOpen, closeModal } = useAccessGate()

  const [betaStatus, setBetaStatus] = useState<BetaStatus>('none')
  const [isLoading, setIsLoading] = useState(true)

  // Check for error or success in URL params
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Derived states
  const isEmailConfirmed = !!session?.user?.email_confirmed_at

  useEffect(() => {
    const checkStatus = async () => {
      if (session?.user?.id) {
        const status = await getBetaStatus(session.user.id)
        setBetaStatus(status)
      }
      setIsLoading(false)
    }

    if (!sessionLoading) {
      checkStatus()
    }
  }, [session?.user?.id, sessionLoading])

  const handleGoToLanding = () => {
    navigate('/')
  }

  // Loading state
  if (isLoading || sessionLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-landing-subtext-light dark:text-landing-subtext-dark">
            Loading your account status...
          </p>
        </div>
      </PageWrapper>
    )
  }

  // Error state from URL params
  if (error) {
    return (
      <PageWrapper showModal isModalOpen={isModalOpen} closeModal={closeModal}>
        <StatusCard
          icon={<XCircle className="w-10 h-10 text-red-500" />}
          iconBg="bg-red-500/10"
          title="Something went wrong"
          description={errorDescription || 'There was an error confirming your email. Please try again.'}
        >
          <button
            onClick={handleGoToLanding}
            className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </StatusCard>
      </PageWrapper>
    )
  }

  // No session - user not logged in
  if (!session) {
    return (
      <PageWrapper showModal isModalOpen={isModalOpen} closeModal={closeModal}>
        <StatusCard
          icon={<Mail className="w-10 h-10 text-amber-500" />}
          iconBg="bg-amber-500/10"
          title="Please Sign In"
          description="You need to sign in to view your account status."
        >
          <button
            onClick={openModal}
            className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors"
          >
            Sign In / Register
          </button>
        </StatusCard>
      </PageWrapper>
    )
  }

  // Email NOT confirmed yet
  if (!isEmailConfirmed) {
    return (
      <PageWrapper showModal isModalOpen={isModalOpen} closeModal={closeModal}>
        <StatusCard
          icon={<Mail className="w-10 h-10 text-amber-500" />}
          iconBg="bg-amber-500/10"
          title="Confirm Your Email"
          description={`We've sent a confirmation link to ${session.user.email}. Please check your inbox and click the link to verify your email address.`}
        >
          <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-amber-500/20">
            <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
              <strong className="text-landing-text-light dark:text-landing-text-dark">Didn't receive the email?</strong>
              <br />
              Check your spam folder or request a new confirmation link.
            </p>
          </div>
          <button
            onClick={handleGoToLanding}
            className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 px-8 py-4 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </StatusCard>
      </PageWrapper>
    )
  }

  // Email confirmed - show beta status
  return (
    <PageWrapper showModal isModalOpen={isModalOpen} closeModal={closeModal}>
      {/* Beta status: NONE - hasn't applied yet */}
      {betaStatus === 'none' && (
        <StatusCard
          icon={<CheckCircle className="w-10 h-10 text-green-500" />}
          iconBg="bg-green-500/10"
          title="Email Confirmed!"
          description="Your email has been verified. Complete your beta application to get access to SONA."
        >
          <button
            onClick={openModal}
            className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors"
          >
            Complete Beta Application
          </button>
        </StatusCard>
      )}

      {/* Beta status: PENDING - application under review */}
      {betaStatus === 'pending' && (
        <StatusCard
          icon={<Clock className="w-10 h-10 text-amber-500" />}
          iconBg="bg-amber-500/10"
          title="Application Under Review"
          description="Thank you for applying! Your beta application is being reviewed by our team."
        >
          <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-amber-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="font-medium text-amber-500">Review in Progress</span>
            </div>
            <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
              We're carefully reviewing all applications to ensure the best experience for our beta testers. 
              We'll send you an email when you're approved to download SONA.
            </p>
          </div>
          <button
            onClick={handleGoToLanding}
            className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 px-8 py-4 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </StatusCard>
      )}

      {/* Beta status: APPROVED - can download */}
      {betaStatus === 'approved' && (
        <StatusCard
          icon={<CheckCircle className="w-10 h-10 text-green-500" />}
          iconBg="bg-green-500/10"
          title="Welcome to SONA Beta!"
          description="Congratulations! You have full access to download and use SONA."
        >
          <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-green-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-500">Beta Access Granted</span>
            </div>
            <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
              Download the plugin and start creating amazing AI-generated sounds. 
              We can't wait to see what you create!
            </p>
          </div>
          <button
            onClick={handleProtectedAction}
            className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download SONA
          </button>
        </StatusCard>
      )}

      {/* Beta status: REJECTED */}
      {betaStatus === 'rejected' && (
        <StatusCard
          icon={<XCircle className="w-10 h-10 text-red-500" />}
          iconBg="bg-red-500/10"
          title="Application Not Approved"
          description="Unfortunately, your beta application was not approved at this time."
        >
          <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-red-500/20">
            <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
              We appreciate your interest in SONA. You may apply again in the future 
              when we open more spots for beta testers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Apply Again
            </button>
            <button
              onClick={handleGoToLanding}
              className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 px-8 py-4 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </StatusCard>
      )}
    </PageWrapper>
  )
}

// ============================================
// Helper Components
// ============================================

interface PageWrapperProps {
  children: React.ReactNode
  showModal?: boolean
  isModalOpen?: boolean
  closeModal?: () => void
}

function PageWrapper({ children, showModal, isModalOpen, closeModal }: PageWrapperProps) {
  return (
    <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
      <div className="grain-overlay mix-blend-overlay dark:mix-blend-overlay" />
      <LandingNav />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <LandingFooter />

      {showModal && isModalOpen !== undefined && closeModal && (
        <BetaModal isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  )
}

interface StatusCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  children?: React.ReactNode
}

function StatusCard({ icon, iconBg, title, description, children }: StatusCardProps) {
  return (
    <>
      <div className={`w-20 h-20 mx-auto mb-8 rounded-full ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>

      <h1 className="font-display text-3xl font-medium mb-4">
        {title}
      </h1>

      <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
        {description}
      </p>

      {children}
    </>
  )
}
