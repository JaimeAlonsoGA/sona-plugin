/**
 * Beta Access Modal
 * 
 * Modal for landing page that handles:
 * - User registration with beta application form
 * - Login for existing users
 * - Status display (pending, approved, rejected)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2, Mail, ChevronRight, AlertCircle } from 'lucide-react'
import { useSignIn, useSignUp, useSession } from '../../lib/hooks'
import { 
  BetaApplicationInput, 
  BetaRole, 
  BetaMode, 
  BetaReferralSource,
  ROLE_LABELS,
  MODE_LABELS,
  REFERRAL_LABELS,
  isValidReferralCode,
} from '../../lib/beta'
import { useBetaStatus, useSubmitBetaApplication } from '../../lib/hooks/use-beta'
import { useNavigate } from 'react-router-dom'

interface BetaModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalStep = 'auth' | 'email_sent' | 'form' | 'success' | 'pending' | 'approved'
type AuthMode = 'login' | 'signup'

export function BetaModal({ isOpen, onClose }: BetaModalProps) {
  const navigate = useNavigate()
  const { data: session } = useSession()
  
  // Auth state
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [role, setRole] = useState<BetaRole | ''>('')
  const [modesOfInterest, setModesOfInterest] = useState<BetaMode[]>([])
  const [referralSource, setReferralSource] = useState<BetaReferralSource | ''>('')
  const [referralDetail, setReferralDetail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null)
  
  // UI state
  const [step, setStep] = useState<ModalStep>('auth')
  const [error, setError] = useState<string | null>(null)
  
  const signInMutation = useSignIn()
  const signUpMutation = useSignUp()
  const submitBetaMutation = useSubmitBetaApplication()
  
  // Use TanStack Query for beta status
  const { data: betaStatus } = useBetaStatus(session?.user?.id)

  // Check beta status when session changes - now using cached query data
  useEffect(() => {
    if (session?.user?.id && betaStatus !== undefined) {
      if (betaStatus === 'approved') {
        setStep('approved')
      } else if (betaStatus === 'pending') {
        setStep('pending')
      } else if (betaStatus === 'none') {
        setStep('form')
      }
    } else if (!session?.user?.id) {
      setStep('auth')
    }
  }, [session?.user?.id, betaStatus, isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError(null)
    }
  }, [isOpen])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      if (authMode === 'signup') {
        await signUpMutation.mutateAsync({ email: email.trim(), password })
        // Show email sent confirmation step
        setStep('email_sent')
      } else {
        await signInMutation.mutateAsync({ email: email.trim(), password })
        // After login, check beta status in the useEffect
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !country.trim() || !role || modesOfInterest.length === 0 || !referralSource) {
      setError('Please fill in all required fields')
      return
    }

    if (!session?.user?.id) {
      setError('You must be logged in')
      return
    }

    const application: BetaApplicationInput = {
      email: session.user.email || email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country: country.trim(),
      role: role as BetaRole,
      modes_of_interest: modesOfInterest,
      referral_source: referralSource as BetaReferralSource,
      referral_detail: referralDetail.trim() || undefined,
      referral_code: referralCode.trim() || undefined,
    }

    submitBetaMutation.mutate(
      { userId: session.user.id, application },
      {
        onSuccess: (result) => {
          if (result.success) {
            // Cache is automatically updated by the mutation
            // Step will update via the useEffect watching betaStatus
            if (result.autoApproved) {
              setStep('approved')
            } else {
              setStep('success')
            }
          } else {
            setError(result.error || 'Failed to submit application')
          }
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to submit application')
        },
      }
    )
  }

  const toggleMode = (mode: BetaMode) => {
    setModesOfInterest(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

  const handleGoToDownload = () => {
    onClose()
    navigate('/download')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center border-b border-gray-200 dark:border-white/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              CLOSED BETA
            </div>
            <h2 className="font-display text-2xl font-bold">
              {step === 'auth' && (authMode === 'login' ? 'Welcome Back' : 'Join the Beta')}
              {step === 'email_sent' && 'Check Your Inbox'}
              {step === 'form' && 'Complete Your Application'}
              {step === 'success' && 'Application Submitted!'}
              {step === 'pending' && 'Application Pending'}
              {step === 'approved' && "You're In!"}
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Auth Step */}
              {step === 'auth' && (
                <motion.form
                  key="auth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleAuth}
                  className="space-y-4"
                >
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark text-center mb-6">
                    {authMode === 'signup' 
                      ? 'Create an account to apply for the closed beta.'
                      : 'Sign in to check your beta access status.'}
                  </p>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                      disabled={signInMutation.isPending || signUpMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                      disabled={signInMutation.isPending || signUpMutation.isPending}
                    />
                  </div>

                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                        disabled={signUpMutation.isPending}
                      />
                    </motion.div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={signInMutation.isPending || signUpMutation.isPending}
                    className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {(signInMutation.isPending || signUpMutation.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login')
                      setError(null)
                    }}
                    className="w-full text-sm text-landing-subtext-light dark:text-landing-subtext-dark hover:text-primary transition-colors"
                  >
                    {authMode === 'signup' 
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"}
                  </button>
                </motion.form>
              )}

              {/* Email Sent Step */}
              {step === 'email_sent' && (
                <motion.div
                  key="email_sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">Confirm Your Email</h3>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-4">
                    We've sent a confirmation link to:
                  </p>
                  <p className="font-medium text-primary mb-6">{email}</p>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-6">
                    Click the link in the email to verify your account<br/>
                    and complete your beta application.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-amber-700 transition-colors"
                    >
                      Got it
                    </button>
                    <button
                      onClick={() => {
                        setStep('auth')
                        setEmail('')
                        setPassword('')
                        setConfirmPassword('')
                      }}
                      className="w-full text-sm text-landing-subtext-light dark:text-landing-subtext-dark hover:text-primary transition-colors"
                    >
                      Use a different email
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Form Step */}
              {step === 'form' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleFormSubmit}
                  className="space-y-5"
                >
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark text-center mb-4">
                    Tell us about yourself to complete your beta application.
                  </p>

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Where do you live? *</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium mb-2">What's your role? *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as BetaRole)}
                      className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Select your role</option>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Modes of Interest */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Which modes interest you? *</label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(MODE_LABELS).map(([mode, { label, description }]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => toggleMode(mode as BetaMode)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            modesOfInterest.includes(mode as BetaMode)
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              modesOfInterest.includes(mode as BetaMode)
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 dark:border-white/30'
                            }`}>
                              {modesOfInterest.includes(mode as BetaMode) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium">{label}</span>
                              <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark ml-2">
                                ({description})
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-sm font-medium mb-2">How did you find SONA? *</label>
                    <select
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value as BetaReferralSource)}
                      className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Select an option</option>
                      {Object.entries(REFERRAL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Referral Detail (optional) */}
                  {(referralSource === 'friend_referral' || referralSource === 'other') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-sm font-medium mb-2">
                        {referralSource === 'friend_referral' ? "Who referred you? (optional)" : "Please specify (optional)"}
                      </label>
                      <input
                        type="text"
                        value={referralDetail}
                        onChange={(e) => setReferralDetail(e.target.value)}
                        placeholder={referralSource === 'friend_referral' ? "Friend's name or email" : "Tell us more"}
                        className="w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none transition-colors"
                      />
                    </motion.div>
                  )}

                  {/* Referral Code (optional - instant approval) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Referral Code <span className="text-landing-subtext-light dark:text-landing-subtext-dark font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const code = e.target.value.toUpperCase()
                          setReferralCode(code)
                          if (code.length > 0) {
                            setReferralCodeValid(isValidReferralCode(code))
                          } else {
                            setReferralCodeValid(null)
                          }
                        }}
                        placeholder="SONA-XXXX"
                        className={`w-full px-4 py-3 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border transition-colors focus:outline-none ${
                          referralCodeValid === true 
                            ? 'border-green-500 focus:border-green-500' 
                            : referralCodeValid === false 
                              ? 'border-red-400 focus:border-red-400'
                              : 'border-gray-200 dark:border-white/10 focus:border-primary'
                        }`}
                      />
                      {referralCodeValid === true && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-500 text-xs">
                          <Check className="w-4 h-4" />
                          <span>Instant access!</span>
                        </div>
                      )}
                    </div>
                    {referralCodeValid === true && (
                      <p className="text-xs text-green-500 mt-1">
                        Valid code! You'll get instant beta access.
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitBetaMutation.isPending}
                    className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitBetaMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Submit Application
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">Check Your Email</h3>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-6">
                    We've sent you a confirmation email. Please verify your email address to complete your application.
                  </p>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                    Your beta application will be reviewed soon. We'll notify you when you're approved!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded-full bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Got it
                  </button>
                </motion.div>
              )}

              {/* Pending Step */}
              {step === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">Application Under Review</h3>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                    Your beta application is being reviewed. We'll send you an email when you're approved to access SONA.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded-full bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}

              {/* Approved Step */}
              {step === 'approved' && (
                <motion.div
                  key="approved"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3">Welcome to the Beta!</h3>
                  <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-6">
                    Your application has been approved. You now have full access to download and use SONA.
                  </p>
                  <button
                    onClick={handleGoToDownload}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    Download SONA
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
