/**
 * Authentication Page
 * 
 * Provides login and sign up functionality with form validation.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn, useSignUp } from '../lib/hooks'
import { ROUTES } from '../routes'

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
    <div className="min-h-screen bg-[#467A5D] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#36795E] rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span
            className="text-[#F6E092] text-7xl font-bold tracking-wider">
            SONA
          </span>
          <p className="text-[#EFEDD7]/60">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#EFEDD7] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#133A28] text-[#EFEDD7] border border-[#467A5D] rounded-lg px-4 py-3 focus:outline-none focus:border-[#F6E092] focus:ring-1 focus:ring-[#F6E092] transition-colors placeholder:text-[#EFEDD7]/40"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#EFEDD7] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#133A28] text-[#EFEDD7] border border-[#467A5D] rounded-lg px-4 py-3 focus:outline-none focus:border-[#F6E092] focus:ring-1 focus:ring-[#F6E092] transition-colors placeholder:text-[#EFEDD7]/40"
              disabled={isLoading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Confirm Password (Sign up only) */}
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#EFEDD7] mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#133A28] text-[#EFEDD7] border rounded-lg px-4 py-3 focus:outline-none focus:ring-1 transition-colors placeholder:text-[#EFEDD7]/40 ${confirmPassword && !passwordsMatch
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#467A5D] focus:border-[#F6E092] focus:ring-[#F6E092]'
                  }`}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
              {error instanceof Error ? error.message : 'An error occurred'}
            </div>
          )}

          {/* Sign Up Success Message */}
          {mode === 'signup' && signUpMutation.isSuccess && !signUpMutation.data?.session && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-green-400 text-sm">
              Check your email to confirm your account!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#E47640] hover:bg-[#E47640]/90 disabled:bg-[#6B7782] disabled:text-[#F8F2CF]/40 disabled:cursor-not-allowed text-[#EFEDD7] font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-[#EFEDD7]/60 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#F6E092] hover:text-[#F6E092]/80 font-medium transition-colors"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
