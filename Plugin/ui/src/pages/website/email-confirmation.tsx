/**
 * Email Confirmation Page
 * 
 * Shown after user confirms their email from the magic link.
 * Displays beta application status message.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { LandingNav } from '../../components/landing/landing-nav'
import { LandingFooter } from '../../components/landing/landing-footer'
import { useSession } from '../../lib/hooks'
import { getBetaStatus, BetaStatus } from '../../lib/beta'
import { useAccessGate } from '@/hooks/use-access-gate'

export default function EmailConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: session, isLoading: sessionLoading } = useSession()

  const { handleProtectedAction } = useAccessGate()

  const [betaStatus, setBetaStatus] = useState<BetaStatus>('none')
  const [isLoading, setIsLoading] = useState(true)

  // Check for error or success in URL params
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

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

  if (isLoading || sessionLoading) {
    return (
      <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle error state
  if (error) {
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
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="font-display text-3xl font-medium mb-4">
                Something went wrong
              </h1>

              <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
                {errorDescription || 'There was an error confirming your email. Please try again.'}
              </p>

              <button
                onClick={handleGoToLanding}
                className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors"
              >
                Back to Home
              </button>
            </motion.div>
          </div>
        </main>

        <LandingFooter />
      </div>
    )
  }

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
            {/* Email Confirmed */}
            {session?.user.email_confirmed_at && (
              <>
                < div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="font-display text-3xl font-medium mb-4">
                  Email Confirmed!
                </h1>
              </>
            )}

            {/* Status-based content */}
            {betaStatus === 'pending' && (
              <>
                <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-amber-500" />
                    <span className="font-medium text-amber-500">Application Under Review</span>
                  </div>
                  <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
                    Your closed beta application is being reviewed by our team. We'll send you an email when you're approved to download SONA.
                  </p>
                </div>

                <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
                  Thank you for your interest in SONA! We're carefully reviewing all applications to ensure the best experience for our beta testers.
                </p>
              </>
            )}

            {betaStatus === 'approved' && (
              <>
                <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-green-500/20">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-green-500">Beta Access Approved!</span>
                  </div>
                  <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
                    Congratulations! You have full access to download and use SONA.
                  </p>
                </div>

                <button
                  onClick={handleProtectedAction}
                  className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors"
                >
                  Download SONA
                </button>
              </>
            )}

            {betaStatus === 'none' && (
              <>
                <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
                  Your email has been confirmed. You can now complete your beta application.
                </p>

                <button
                  onClick={handleGoToLanding}
                  className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-amber-700 transition-colors"
                >
                  Complete Beta Application
                </button>
              </>
            )}

            {betaStatus === 'rejected' && (
              <>
                <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl p-6 mb-8 border border-red-500/20">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <span className="font-medium text-red-500">Application Not Approved</span>
                  </div>
                  <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm">
                    Unfortunately, your beta application was not approved at this time. You may apply again in the future.
                  </p>
                </div>

                <button
                  onClick={handleGoToLanding}
                  className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 px-8 py-4 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Back to Home
                </button>
              </>
            )}
          </motion.div>
        </div>
      </main >

      <LandingFooter />
    </div >
  )
}
