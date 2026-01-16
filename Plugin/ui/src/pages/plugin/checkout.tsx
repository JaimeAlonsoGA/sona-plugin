/**
 * Checkout Page
 * 
 * Embedded Stripe checkout using Stripe Elements.
 * Handles payment confirmation for token purchases.
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { ROUTES } from '../../routes'
import { Card, Button, IconButton } from '../../components/shared'
import { ChevronLeftIcon } from '../../components/shared/icons'
import { TOKEN_PACKAGES } from '../../types/stripe.types'

// Initialize Stripe - use your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || 'pk_test_placeholder')

/**
 * Checkout Form Component
 * Handles the payment submission using Stripe Elements
 */
function CheckoutForm({ 
  packageId, 
  onSuccess, 
  onCancel 
}: { 
  packageId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pkg = TOKEN_PACKAGES.find(p => p.id === packageId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm the payment - Stripe Elements will handle collecting payment details
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing?success=true`,
        },
        redirect: 'if_required', // Only redirect if 3D Secure is needed
      })

      if (confirmError) {
        // Show error to customer (e.g., card declined)
        setError(confirmError.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        onSuccess()
      }
      // If redirect happened, the return_url will handle success
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Summary */}
      {pkg && (
        <Card className="bg-[var(--sona-sage)]/10 border-[var(--sona-sage)]/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[var(--sona-text)] font-medium">{pkg.name}</h3>
              <p className="text-[var(--sona-text-muted)] text-sm">{pkg.tokens} tokens</p>
            </div>
            <div className="text-right">
              <p className="text-[var(--sona-gold)] font-semibold text-lg">{pkg.priceDisplay}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ${pkg?.priceDisplay || ''}`
          )}
        </Button>
      </div>

      {/* Secure Payment Badge */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--sona-sage)]">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-[var(--sona-text-subtle)] text-xs">
          Secure payment powered by Stripe
        </span>
      </div>
    </form>
  )
}

/**
 * Main Checkout Page Component
 */
export default function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  
  const clientSecret = searchParams.get('client_secret')
  const packageId = searchParams.get('package_id') || ''
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Validate that we have the required params
    if (!clientSecret || !packageId) {
      console.error('Missing checkout parameters')
      navigate(ROUTES.BILLING, { replace: true })
      return
    }
    setIsLoading(false)
  }, [clientSecret, packageId, navigate])

  const handleSuccess = () => {
    // Invalidate token queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['userTokens'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    
    // Navigate to billing with success message
    navigate(`${ROUTES.BILLING}?success=true`, { replace: true })
  }

  const handleCancel = () => {
    navigate(ROUTES.BILLING, { replace: true })
  }

  if (isLoading || !clientSecret) {
    return (
      <div className="page flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--sona-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pkg = TOKEN_PACKAGES.find(p => p.id === packageId)

  return (
    <div className="page">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-4">
        <IconButton
          icon={<ChevronLeftIcon size={18} />}
          onClick={handleCancel}
          label="Back to Billing"
        />
        <h1 className="text-base font-medium text-[var(--sona-text)]">Checkout</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--sona-text)] mb-2">
                Complete Your Purchase
              </h2>
              <p className="text-[var(--sona-text-muted)] text-sm">
                {pkg ? `${pkg.tokens} tokens for ${pkg.priceDisplay}` : 'Token purchase'}
              </p>
            </div>

            {/* Stripe Elements Provider */}
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#467A5D',
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm
                packageId={packageId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
