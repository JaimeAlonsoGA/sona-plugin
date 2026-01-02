/**
 * Authentication Page
 * 
 * Welcoming, trustworthy sign in/sign up flow
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSignIn, useSignUp } from '../lib/hooks'
import { ROUTES } from '../routes'
import { SonaLogo, Button } from '../components/shared'

type AuthMode = 'login' | 'signup'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const signInMutation = useSignIn({
    onSuccess: () => navigate(ROUTES.HOME),
  })
  const signUpMutation = useSignUp()

  const isLoading = signInMutation.isPending || signUpMutation.isPending
  const error = signInMutation.error || signUpMutation.error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) return

    if (mode === 'signup') {
      if (password !== confirmPassword) return
      signUpMutation.mutate({ email: email.trim(), password })
    } else {
      signInMutation.mutate({ email: email.trim(), password })
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    signInMutation.reset()
    signUpMutation.reset()
  }

  const passwordsMatch = mode === 'login' || password === confirmPassword
  const canSubmit = email.trim() && password.trim() && passwordsMatch && !isLoading

  return (
    <div className="page flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <SonaLogo size="xl" />
          <motion.p 
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[var(--sona-text-muted)] text-sm mt-6"
          >
            {mode === 'login' ? 'Welcome back' : 'Begin your journey'}
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="sona-label block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="sona-input"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="sona-label block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="sona-input"
              disabled={isLoading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Confirm Password */}
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="confirmPassword" className="sona-label block mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`sona-input ${
                    confirmPassword && !passwordsMatch
                      ? 'border-[var(--sona-ember)]'
                      : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-xs text-[var(--sona-ember)]">
                    Passwords do not match
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-[var(--sona-ember)]/10 border border-[var(--sona-ember)]/20 rounded-2xl text-[var(--sona-ember)] text-sm"
              >
                {error instanceof Error ? error.message : 'An error occurred'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {mode === 'signup' && signUpMutation.isSuccess && !signUpMutation.data?.session && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-[var(--sona-sage)]/10 border border-[var(--sona-sage)]/20 rounded-2xl text-[var(--sona-sage)] text-sm"
              >
                Check your email to confirm your account
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-10 text-center">
          <p className="text-[var(--sona-text-muted)] text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[var(--sona-sage)] hover:text-[var(--sona-gold)] font-medium transition-colors"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--sona-text-subtle)] text-[10px] tracking-widest mt-12">
          by prototip
        </p>
      </motion.div>
    </div>
  )
}
