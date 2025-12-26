/**
 * Example component demonstrating Supabase authentication with React Query
 * 
 * This component can be imported and used in the App to test authentication.
 */

import { useState } from 'react'
import { useSignIn, useSignUp, useSignOut, useSession, useIsAuthenticated } from '../lib/hooks'

export function AuthExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  
  const signIn = useSignIn()
  const signUp = useSignUp()
  const signOut = useSignOut()
  const { data: session, isLoading } = useSession()
  const isAuthenticated = useIsAuthenticated()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'signin') {
      signIn.mutate({ email, password })
    } else {
      signUp.mutate({ email, password })
    }
  }

  const handleSignOut = () => {
    signOut.mutate()
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Loading session...</p>
      </div>
    )
  }

  if (isAuthenticated && session) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Authenticated</h3>
          <p className="text-gray-400">User: {session.user.email}</p>
          <p className="text-gray-400 text-sm">Session expires: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {signOut.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {(signIn.error || signUp.error) && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded">
            <p className="text-red-200 text-sm">
              {mode === 'signin' 
                ? signIn.error?.message || 'Sign in failed'
                : signUp.error?.message || 'Sign up failed'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={signIn.isPending || signUp.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {(mode === 'signin' && signIn.isPending) || (mode === 'signup' && signUp.isPending)
              ? 'Loading...'
              : mode === 'signin' 
              ? 'Sign In' 
              : 'Sign Up'}
          </button>
          
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}
