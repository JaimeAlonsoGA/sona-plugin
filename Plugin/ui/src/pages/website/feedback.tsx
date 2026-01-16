/**
 * Feedback Page
 * 
 * Protected page for beta testers to submit feedback.
 * Uses ProtectedContent to show beta modal if user doesn't have access.
 * 
 * Note: Nav, Footer, and BetaModal are provided by WebsiteLayout
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, AlertCircle, Music, Link2, MessageSquare, Bug, Lightbulb, Sparkles, Loader2 } from 'lucide-react'
import { useSession, useSubmitReport, useLatestJob } from '@/lib/hooks'
import type { FeedbackType } from '@/lib/api/reports'
import { VersionBadge } from '@/components/shared/version-badge'
import { ProtectedContent } from '@/components/shared'

const FEEDBACK_TYPES = [
  {
    value: 'general' as FeedbackType,
    label: 'General',
    icon: MessageSquare,
    description: 'Share your thoughts about SONA'
  },
  {
    value: 'bug' as FeedbackType,
    label: 'Bug Report',
    icon: Bug,
    description: 'Found something broken?'
  },
  {
    value: 'feature' as FeedbackType,
    label: 'Feature Request',
    icon: Lightbulb,
    description: 'Suggest new features'
  },
  {
    value: 'prompting' as FeedbackType,
    label: 'Prompting Tips',
    icon: Sparkles,
    description: 'Share what works for you'
  },
]

export default function FeedbackPage() {
  const { data: session } = useSession()
  const { data: latestJob, isLoading: isLoadingJob } = useLatestJob()
  const submitReportMutation = useSubmitReport()

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [includeLastGeneration, setIncludeLastGeneration] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email)
    }
  }, [session, email])

  // Reset include generation when switching away from bug report
  useEffect(() => {
    if (feedbackType !== 'bug') {
      setIncludeLastGeneration(false)
    }
  }, [feedbackType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      await submitReportMutation.mutateAsync({
        feedbackType,
        message: message.trim(),
        email: email.trim() || undefined,
        jobId: includeLastGeneration && latestJob ? latestJob.id : undefined,
        jobStorageUrl: includeLastGeneration && latestJob ? latestJob.storageUrl : undefined,
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit report:', error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to submit feedback. Please try again.'
      )
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setMessage('')
    setFeedbackType('general')
    setIncludeLastGeneration(false)
    setSubmitError(null)
  }

  // Truncate prompt for display
  const truncatePrompt = (prompt: string, maxLength = 50) => {
    if (prompt.length <= maxLength) return prompt
    return prompt.substring(0, maxLength) + '...'
  }

  return (
    <>
      {/* Header - Always visible */}
      <section className="bg-gradient-to-br from-[var(--sona-creator)] to-black relative pt-32 lg:pt-40 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-32">
          {/* <div className="inline-block mb-4">
                            <div className="h-px w-12 bg-primary mx-auto mb-6" />
                        </div> */}

          <h1 className="font-display text-4xl md:text-7xl font-bold mb-4">
            Give Feedback
          </h1>

          <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-lg mb-4">
            We value your input. Please provide your feedback to help us improve SONA.
          </p>

          {/* Version Badge */}
          <VersionBadge />

          {/* Changelog */}
          <div className="mt-6 mb-32 flex flex-col ">
            <Link to="/changelog" className="text-blue-500  hover:underline decoration-blue-500">View Changelog ↗</Link>
          </div>
        </div>
      </section>

      {/* Protected Content - Shows access required message if not authenticated/beta */}
      <ProtectedContent
        title="Beta Access Required"
        description="Submit feedback is available exclusively to beta testers. Join the beta to help us improve SONA!"
      >
        <main className="relative z-10 pt-32 pb-24">
          <div className="max-w-2xl mx-auto px-6">

          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                // Success State
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 md:p-10 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-3">
                    Thank You!
                  </h2>
                  <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
                    Your feedback has been submitted successfully.<br />
                    We appreciate your help in improving SONA.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl font-medium border border-gray-200 dark:border-white/10 hover:border-primary hover:text-primary transition-colors"
                  >
                    Send more feedback
                  </button>
                </motion.div>
              ) : (
                // Form
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="p-8 md:p-10"
                >
                  {/* Error Alert */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-500 text-sm font-medium">Failed to submit</p>
                          <p className="text-red-500/80 text-sm mt-1">{submitError}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      What type of feedback?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FEEDBACK_TYPES.map((type) => {
                        const Icon = type.icon
                        const isSelected = feedbackType === type.value
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFeedbackType(type.value)}
                            className={`p-4 rounded-xl text-left transition-all ${isSelected
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-landing-bg-light dark:bg-landing-bg-dark border-2 border-transparent hover:border-gray-300 dark:hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-landing-subtext-light dark:text-landing-subtext-dark'}`} />
                              <span className={`font-medium text-sm ${isSelected ? 'text-primary' : ''}`}>
                                {type.label}
                              </span>
                            </div>
                            <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark pl-7">
                              {type.description}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Include Last Generation - Only for bug reports */}
                  <AnimatePresence>
                    {feedbackType === 'bug' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <label className="block text-sm font-medium mb-3">
                          Link a generation (optional)
                        </label>

                        {isLoadingJob ? (
                          <div className="p-4 rounded-xl bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-landing-subtext-light dark:text-landing-subtext-dark" />
                              <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                Loading your latest generation...
                              </span>
                            </div>
                          </div>
                        ) : latestJob ? (
                          <button
                            type="button"
                            onClick={() => setIncludeLastGeneration(!includeLastGeneration)}
                            className={`w-full p-4 rounded-xl text-left transition-all ${includeLastGeneration
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-landing-bg-light dark:bg-landing-bg-dark border-2 border-transparent hover:border-gray-300 dark:hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${includeLastGeneration
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 dark:border-white/30'
                                }`}>
                                {includeLastGeneration && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Music className="w-4 h-4 text-landing-subtext-light dark:text-landing-subtext-dark" />
                                  <span className="text-sm font-medium">
                                    Include last generation
                                  </span>
                                </div>
                                <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-2">
                                  Attach your most recent audio for context
                                </p>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-black/20">
                                  <Link2 className="w-3 h-3 text-landing-subtext-light dark:text-landing-subtext-dark flex-shrink-0" />
                                  <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark truncate">
                                    "{truncatePrompt(latestJob.prompt)}"
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ) : (
                          <div className="p-4 rounded-xl bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                              <Music className="w-5 h-5 text-landing-subtext-light dark:text-landing-subtext-dark" />
                              <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                No recent generations to link
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Your message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      maxLength={5000}
                      className="w-full px-4 py-3 rounded-xl bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors resize-none"
                      placeholder={
                        feedbackType === 'bug'
                          ? "Describe the bug you encountered. Include steps to reproduce if possible..."
                          : feedbackType === 'feature'
                            ? "Describe the feature you'd like to see..."
                            : feedbackType === 'prompting'
                              ? "Share prompting tips that worked well for you..."
                              : "Share your thoughts about SONA..."
                      }
                    />
                    <div className="mt-2 flex justify-end">
                      <span className={`text-xs ${message.length > 4500
                        ? 'text-red-500'
                        : 'text-landing-subtext-light dark:text-landing-subtext-dark'
                        }`}>
                        {message.length} / 5000
                      </span>
                    </div>
                  </div>

                  {/* Email (pre-filled, readonly) */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 text-landing-subtext-light dark:text-landing-subtext-dark cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                      We'll use this email if we need to follow up
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitReportMutation.isPending || !message.trim()}
                    className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitReportMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </>
                    )}
                  </button>

                  {/* Info about linked generation */}
                  {includeLastGeneration && latestJob && (
                    <p className="mt-4 text-xs text-landing-subtext-light dark:text-landing-subtext-dark text-center">
                      Your latest generation will be attached to help us investigate.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      </ProtectedContent>
    </>
  )
}
