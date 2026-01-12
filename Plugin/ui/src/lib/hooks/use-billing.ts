/**
 * Billing Hooks
 * 
 * React Query hooks for token balance, transactions, and Stripe checkout.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type {
    UserTokens,
    TokenTransaction,
    CreateCheckoutRequest,
    CreateCheckoutResponse
} from '../../types/stripe.types'

/**
 * Query Keys
 */
export const billingQueryKeys = {
    userTokens: (userId: string) => ['userTokens', userId] as const,
    transactions: (userId: string) => ['transactions', userId] as const,
}

/**
 * Fetch user token balance
 */
async function fetchUserTokens(userId: string): Promise<UserTokens | null> {
    const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        // If no record exists, return default values
        if (error.code === 'PGRST116') {
            return {
                user_id: userId,
                balance: 0,
                lifetime_purchased: 0,
                lifetime_used: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        }
        throw error
    }

    return data as UserTokens
}

/**
 * Hook to get user token balance
 */
export function useUserTokens() {
    return useQuery({
        queryKey: ['userTokens'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null
            return fetchUserTokens(user.id)
        },
        staleTime: 1000 * 30, // 30 seconds
        refetchOnWindowFocus: true,
    })
}

/**
 * Fetch user token transactions
 */
async function fetchTokenTransactions(userId: string): Promise<TokenTransaction[]> {
    const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    return data as TokenTransaction[]
}

/**
 * Hook to get user token transactions
 */
export function useTokenTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []
            return fetchTokenTransactions(user.id)
        },
        staleTime: 1000 * 60, // 1 minute
    })
}

/**
 * Create Stripe checkout session
 * Following the same pattern as submitJob in jobs.ts which works correctly
 */
async function createCheckoutSession(
    request: CreateCheckoutRequest
): Promise<CreateCheckoutResponse> {
    // Get fresh session - this will auto-refresh if expired
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[Billing Debug] getSession result:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none',
    })

    if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error. Please sign in again.')
    }

    if (!session) {
        throw new Error('Not authenticated. Please sign in to continue.')
    }

    // Check if token is expired and refresh if needed
    const now = Math.floor(Date.now() / 1000)
    const isExpired = session.expires_at ? session.expires_at < now : false
    
    if (isExpired) {
        console.log('[Billing Debug] Token expired, refreshing...')
        const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !freshSession) {
            console.error('[Billing Debug] Refresh failed:', refreshError?.message)
            throw new Error('Session expired. Please sign in again.')
        }
        console.log('[Billing Debug] Session refreshed successfully')
    }

    try {
        // Use Supabase's built-in functions.invoke() - same as generate function
        console.log('[Billing Debug] Invoking stripe-checkout Edge Function')
        
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
            body: request,
        })

        console.log('[Billing Debug] Response:', { data, error: error?.message })

        if (error) {
            console.error('Edge Function error:', error)
            throw new Error(error.message || 'Failed to create checkout session')
        }

        if (!data) {
            throw new Error('Invalid response from server')
        }

        return data as CreateCheckoutResponse
    } catch (error) {
        console.error('Checkout error:', error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Failed to create checkout session')
    }
}

/**
 * Hook to create Stripe checkout session
 * Returns mutation that navigates to checkout page with client_secret
 */
export function useCreateCheckoutSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createCheckoutSession,
        // Note: Navigation is handled by the component using this hook
        // The component should navigate to /billing/checkout?client_secret=xxx&package_id=xxx
        onError: (error) => {
            console.error('Checkout error:', error)
        },
        onSettled: () => {
            // Refetch tokens after checkout attempt
            queryClient.invalidateQueries({ queryKey: ['userTokens'] })
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
        },
    })
}

/**
 * Check if user has enough tokens
 * @param required - Number of tokens required (default: 20 for base generation)
 */
async function checkTokenBalance(required: number = 20): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.rpc('check_user_tokens', {
        p_user_id: user.id,
        p_required: required,
    })

    if (error) {
        console.error('Error checking token balance:', error)
        return false
    }

    return data
}

/**
 * Hook to check if user has enough tokens
 * @param required - Number of tokens required (default: 20 for base generation)
 */
export function useHasTokens(required: number = 20) {
    return useQuery({
        queryKey: ['hasTokens', required],
        queryFn: () => checkTokenBalance(required),
        staleTime: 1000 * 10, // 10 seconds
    })
}

/**
 * Use tokens for generation (variable amount)
 * @deprecated Tokens are now charged by the Edge Function. This is kept for manual usage if needed.
 */
async function useTokens({ amount, description }: { amount: number; description: string }): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.rpc('use_tokens', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
    })

    if (error) {
        console.error('Error using tokens:', error)
        return false
    }

    return data
}

/**
 * Hook to use tokens (variable amount)
 * @deprecated Tokens are now charged by the Edge Function automatically.
 */
export function useUseTokens() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: useTokens,
        onSuccess: () => {
            // Invalidate token queries to refetch balance
            queryClient.invalidateQueries({ queryKey: ['userTokens'] })
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['hasTokens'] })
        },
    })
}

/**
 * Legacy hook - use a single token
 * @deprecated Use useUseTokens for variable amounts or let Edge Function handle it
 */
export function useUseToken() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (description: string = 'Audio generation') => 
            useTokens({ amount: 1, description }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userTokens'] })
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['hasTokens'] })
        },
    })
}
