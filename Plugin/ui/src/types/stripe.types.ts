/**
 * Stripe Integration Types
 * 
 * Type definitions for Stripe payment integration in Sona.
 * Supports one-time token purchases and future subscription tiers.
 */

/**
 * Token Package Configuration
 */
export interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number // in cents
  priceDisplay: string
  description: string
  popular?: boolean
  // Stripe Price ID - set this after creating products in Stripe Dashboard
  stripePriceId: string
}

/**
 * Available token packages for purchase
 */
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'tokens_150',
    name: 'Starter',
    tokens: 150,
    price: 200, // $2.00
    priceDisplay: '$2',
    description: 'Perfect for trying out Sona',
    stripePriceId: 'price_1SqH8BGdyEsF9dE2Jp6UN1QP', // Set after creating in Stripe
  },
  {
    id: 'tokens_400',
    name: 'Creator',
    tokens: 400,
    price: 500, // $5.00
    priceDisplay: '$5',
    description: 'For amazing sound creation',
    popular: true,
    stripePriceId: 'price_1SqH88GdyEsF9dE25Q8PU5Nf', // Set after creating in Stripe
  },
  {
    id: 'tokens_900',
    name: 'Pro',
    tokens: 900,
    price: 1000, // $10.00
    priceDisplay: '$10',
    description: 'Best value for power users',
    stripePriceId: 'price_1SqH86GdyEsF9dE278IS8HUP', // Set after creating in Stripe
  },
  {
    id: 'tokens_2000',
    name: 'Studio',
    tokens: 2000,
    price: 2000, // $20.00
    priceDisplay: '$20',
    description: 'Enterprise package for studios',
    stripePriceId: 'price_1SqH7xGdyEsF9dE2XckEKjcX', // Set after creating in Stripe
  },
]

/**
 * Future Subscription Tiers (for post-beta)
 * Prepared structure for subscription-based model
 */
export type SubscriptionTier = 'free' | 'starter' | 'creator' | 'pro'

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price: number // monthly, in cents
  priceDisplay: string
  tokensPerMonth: number
  features: string[]
  stripePriceId?: string
}

/**
 * Subscription plans configuration (for future use)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: 'Free',
    tokensPerMonth: 10,
    features: [
      '10 tokens/month',
      'Basic audio generation',
      'MP3 downloads',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 999, // $9.99
    priceDisplay: '$9.99/mo',
    tokensPerMonth: 200,
    features: [
      '200 tokens/month',
      'Priority generation',
      'WAV + MP3 downloads',
      'Custom naming conventions',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 1999, // $19.99
    priceDisplay: '$19.99/mo',
    tokensPerMonth: 500,
    features: [
      '500 tokens/month',
      'Priority generation',
      'All export formats',
      'Custom naming conventions',
      'Batch generation',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 3999, // $39.99
    priceDisplay: '$39.99/mo',
    tokensPerMonth: 1500,
    features: [
      '1500 tokens/month',
      'Fastest generation',
      'All features',
      'API access',
      'Priority support',
    ],
  },
]

/**
 * User token balance
 */
export interface UserTokens {
  user_id: string
  balance: number
  lifetime_purchased: number
  lifetime_used: number
  created_at: string
  updated_at: string
}

/**
 * Token transaction record
 */
export type TransactionType = 'purchase' | 'usage' | 'bonus' | 'refund' | 'subscription'

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number // positive for credits, negative for usage
  type: TransactionType
  description: string
  stripe_payment_id?: string
  created_at: string
}

/**
 * Checkout Session Request
 */
export interface CreateCheckoutRequest {
  priceId: string
  packageId: string
  successUrl?: string
  cancelUrl?: string
}

/**
 * Checkout Session Response (Payment Intent for embedded checkout)
 */
export interface CreateCheckoutResponse {
  paymentIntentId: string
  clientSecret: string
  packageId: string
}

/**
 * Webhook Event Payload
 */
export interface StripeWebhookPayload {
  type: string
  data: {
    object: {
      id: string
      customer?: string
      metadata?: {
        user_id?: string
        package_id?: string
        tokens?: string
      }
      amount_total?: number
      payment_status?: string
    }
  }
}

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
