/**
 * Authentication Page
 * 
 * Provides login and sign up functionality with form validation.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn, useSignUp } from '../lib/hooks'
import { ROUTES } from '../routes'
import { Loader2 } from 'lucide-react'

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

    if (!email.trim() || !password.trim()) {
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        return
      }
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
    <div className="page bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[#F6E092] text-4xl font-bold tracking-wide">SONA</span>
          <p className="text-[#EFEDD7]/40 text-sm mt-2">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#EFEDD7]/60 mb-2 uppercase tracking-wider"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#2a2a2a] text-[#EFEDD7] border border-[#3a3a3a] rounded-lg px-4 py-3 focus:outline-none focus:border-[#E47640]/50 transition-colors placeholder:text-[#EFEDD7]/30 text-sm"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#EFEDD7]/60 mb-2 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#2a2a2a] text-[#EFEDD7] border border-[#3a3a3a] rounded-lg px-4 py-3 focus:outline-none focus:border-[#E47640]/50 transition-colors placeholder:text-[#EFEDD7]/30 text-sm"
              disabled={isLoading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Confirm Password (Sign up only) */}
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-[#EFEDD7]/60 mb-2 uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#2a2a2a] text-[#EFEDD7] border rounded-lg px-4 py-3 focus:outline-none transition-colors placeholder:text-[#EFEDD7]/30 text-sm ${
                  confirmPassword && !passwordsMatch
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#3a3a3a] focus:border-[#E47640]/50'
                }`}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error instanceof Error ? error.message : 'An error occurred'}
            </div>
          )}

          {/* Sign Up Success Message */}
          {mode === 'signup' && signUpMutation.isSuccess && !signUpMutation.data?.session && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
              Check your email to confirm your account!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#E47640] hover:bg-[#E47640]/90 disabled:bg-[#3a3a3a] disabled:text-[#EFEDD7]/30 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-[#EFEDD7]/40 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#E47640] hover:text-[#E47640]/80 font-medium transition-colors"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[#EFEDD7]/20 text-xs mt-8">
          by Prototip
        </p>
      </div>
    </div>
  )
}
