/**
 * Supabase Client Configuration
 * 
 * This module initializes the Supabase client and provides helper functions
 * for authentication and API calls.
 */

import { createClient, AuthError, Session, User } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local')
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Authentication Types
 */
export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

/**
 * Sign in with email and password
 * 
 * @param email - User email
 * @param password - User password
 * @returns Promise with user, session, and error
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return {
      user: data.user,
      session: data.session,
      error,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

/**
 * Sign up with email and password
 * 
 * @param email - User email
 * @param password - User password
 * @returns Promise with user, session, and error
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    return {
      user: data.user,
      session: data.session,
      error,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

/**
 * Sign out the current user
 * 
 * @returns Promise with error (null if successful)
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: error as AuthError }
  }
}

/**
 * Get the current session
 * 
 * @returns Promise with the current session or null
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

/**
 * Generate audio using Supabase Edge Function
 * 
 * @param prompt - Text prompt for audio generation
 * @param mode - Generation mode
 * @returns Promise with ArrayBuffer containing the audio data
 * @throws Error if not authenticated or generation fails
 */
export async function generateAudio(prompt: string, mode: string): Promise<ArrayBuffer> {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated. Please sign in to generate audio.')
  }
  
  // Call Supabase Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-audio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, mode }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Audio generation failed: ${response.status} - ${errorText}`)
  }
  
  return await response.arrayBuffer()
}

/**
 * Listen to auth state changes
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): { unsubscribe: () => void } {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session)
    }
  )
  
  return {
    unsubscribe: () => subscription.unsubscribe(),
  }
}
