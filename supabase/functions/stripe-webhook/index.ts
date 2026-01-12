/**
 * Supabase Edge Function: Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for payment processing.
 * Updates user token balance after successful payments.
 * 
 * IMPORTANT: This endpoint must be publicly accessible (no auth required)
 * but validates requests using Stripe webhook signature.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Token packages configuration (must match checkout function)
const TOKEN_PACKAGES: Record<string, { tokens: number; name: string }> = {
  'tokens_200': { tokens: 200, name: 'Starter (200 tokens)' },
  'tokens_500': { tokens: 500, name: 'Creator (500 tokens)' },
  'tokens_1000': { tokens: 1000, name: 'Producer (1000 tokens)' },
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY_TEST')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase admin client (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Only process successful payments
        if (session.payment_status !== 'paid') {
          console.log('Payment not completed, skipping')
          break
        }

        const userId = session.metadata?.user_id
        const packageId = session.metadata?.package_id
        const tokensStr = session.metadata?.tokens

        if (!userId || !packageId || !tokensStr) {
          console.error('Missing metadata in checkout session')
          break
        }

        const tokens = parseInt(tokensStr, 10)
        const tokenPackage = TOKEN_PACKAGES[packageId]

        if (!tokenPackage || isNaN(tokens)) {
          console.error('Invalid token package or amount')
          break
        }

        console.log(`Processing payment for user ${userId}: ${tokens} tokens`)

        // Update user token balance
        const { error: updateError } = await supabase.rpc('add_user_tokens', {
          p_user_id: userId,
          p_amount: tokens,
          p_transaction_type: 'purchase',
          p_description: `Purchased ${tokenPackage.name}`,
          p_stripe_payment_id: session.payment_intent as string || session.id,
        })

        if (updateError) {
          console.error('Failed to update user tokens:', updateError)
          // Don't return error - Stripe will retry the webhook
          // Log for manual investigation
        } else {
          console.log(`Successfully added ${tokens} tokens to user ${userId}`)
        }

        break
      }

      case 'payment_intent.succeeded': {
        // Handle Payment Intent success (from embedded checkout)
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`)

        const userId = paymentIntent.metadata?.user_id
        const packageId = paymentIntent.metadata?.package_id
        const tokensStr = paymentIntent.metadata?.tokens

        if (!userId || !packageId || !tokensStr) {
          console.log('PaymentIntent without token metadata, skipping token update')
          break
        }

        const tokens = parseInt(tokensStr, 10)
        const tokenPackage = TOKEN_PACKAGES[packageId]

        if (!tokenPackage || isNaN(tokens)) {
          console.error('Invalid token package or amount in PaymentIntent')
          break
        }

        console.log(`Processing PaymentIntent for user ${userId}: ${tokens} tokens`)

        // Update user token balance
        const { error: updateError } = await supabase.rpc('add_user_tokens', {
          p_user_id: userId,
          p_amount: tokens,
          p_transaction_type: 'purchase',
          p_description: `Purchased ${tokenPackage.name}`,
          p_stripe_payment_id: paymentIntent.id,
        })

        if (updateError) {
          console.error('Failed to update user tokens from PaymentIntent:', updateError)
        } else {
          console.log(`Successfully added ${tokens} tokens to user ${userId} from PaymentIntent`)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} failed:`, paymentIntent.last_payment_error?.message)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
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
