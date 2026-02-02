/**
 * Supabase Edge Function: Create Stripe Payment Intent
 * 
 * Creates a Stripe Payment Intent for embedded checkout with Stripe Elements.
 * Uses fetch directly instead of Stripe SDK for Deno compatibility.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// Token packages configuration with prices in cents
const TOKEN_PACKAGES: Record<string, { tokens: number; name: string; price: number }> = {
  'tokens_200': { tokens: 150, name: 'Starter (200 tokens)', price: 200 },
  'tokens_500': { tokens: 400, name: 'Creator (500 tokens)', price: 500 },
  'tokens_900': { tokens: 900, name: 'Pro (900 tokens)', price: 1000 },
  'tokens_2000': { tokens: 2000, name: 'Studio (2000 tokens)', price: 2000 },
}

interface CheckoutRequest {
  priceId: string
  packageId: string
  successUrl?: string
  cancelUrl?: string
}

/**
 * Make a request to Stripe API
 */
async function stripeRequest(
  endpoint: string,
  method: string,
  apiKey: string,
  body?: Record<string, unknown>
): Promise<{ data?: unknown; error?: string }> {
  const url = `https://api.stripe.com/v1${endpoint}`

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  // Convert body to URL-encoded format for Stripe
  let encodedBody: string | undefined
  if (body) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(body)) {
      if (value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    }
    encodedBody = params.toString()
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: encodedBody,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Stripe API error:', data)
      return { error: data.error?.message || 'Stripe API error' }
    }

    return { data }
  } catch (error) {
    console.error('Stripe request failed:', error)
    return { error: error instanceof Error ? error.message : 'Request failed' }
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe API key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY_TEST')
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY_TEST not configured')
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get environment variables - same pattern as generate function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Get token from custom header (x-user-token) or Authorization header
    // x-user-token is used because Supabase gateway may filter Authorization header
    const customToken = req.headers.get('x-user-token')
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')

    // Extract token from either source
    let token: string | null = null
    if (customToken) {
      token = customToken
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }

    console.log('Auth debug:', {
      hasCustomToken: !!customToken,
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 30) + '...',
    })

    if (!token) {
      console.error('No token found in headers')
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role client to verify user - same as generate function
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify the JWT using admin client's getUser with the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    console.log('User verification result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
    })

    if (authError || !user) {
      console.error('Auth error:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Parse request body
    const body: CheckoutRequest = await req.json()
    const { priceId, packageId, successUrl, cancelUrl } = body

    console.log('Checkout request:', { priceId, packageId })

    // Validate package
    const tokenPackage = TOKEN_PACKAGES[packageId]
    if (!tokenPackage) {
      return new Response(
        JSON.stringify({ error: 'Invalid package ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate price ID
    if (!priceId || !priceId.startsWith('price_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid price ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has a Stripe customer ID
    const { data: userTokens } = await supabaseAdmin
      .from('user_tokens')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = userTokens?.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.id)

      const customerResult = await stripeRequest('/customers', 'POST', stripeSecretKey, {
        email: user.email,
        'metadata[supabase_user_id]': user.id,
      })

      if (customerResult.error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create customer: ' + customerResult.error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      customerId = (customerResult.data as { id: string }).id
      console.log('Created Stripe customer:', customerId)

      // Store customer ID
      await supabaseAdmin
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          balance: 0,
          lifetime_purchased: 0,
          lifetime_used: 0,
        }, {
          onConflict: 'user_id'
        })
    }

    // Create Payment Intent for embedded checkout
    const paymentIntentResult = await stripeRequest('/payment_intents', 'POST', stripeSecretKey, {
      amount: tokenPackage.price.toString(),
      currency: 'usd',
      customer: customerId,
      'automatic_payment_methods[enabled]': 'true',
      'metadata[user_id]': user.id,
      'metadata[package_id]': packageId,
      'metadata[tokens]': tokenPackage.tokens.toString(),
      description: `Sona - ${tokenPackage.name}`,
    })

    if (paymentIntentResult.error) {
      console.error('Failed to create payment intent:', paymentIntentResult.error)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment intent: ' + paymentIntentResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = paymentIntentResult.data as {
      id: string
      client_secret: string
      status: string
    }
    console.log('Payment Intent created:', paymentIntent.id)

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        packageId: packageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Payment intent error:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
