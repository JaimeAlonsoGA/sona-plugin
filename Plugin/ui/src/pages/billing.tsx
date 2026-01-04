/**
 * Billing Page
 * 
 * Token purchase page with Stripe integration.
 * Displays available token packages and handles checkout.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../routes'
import { Card, IconButton } from '../components/shared'
import { ChevronLeftIcon } from '../components/shared/icons'
import { TokenPackageCard } from '../components/billing/token-package-card'
import { TOKEN_PACKAGES } from '../types/stripe.types'
import { useCreateCheckoutSession, useUserTokens, useTokenTransactions } from '@/lib/hooks'
import { TokenBalance, TransactionHistory } from '@/components/billing'

export default function BillingPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const initialBalanceRef = useRef<number | null>(null)
  const hasProcessedSuccessRef = useRef(false)
  
  const { data: userTokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useUserTokens()
  const { refetch: refetchTransactions } = useTokenTransactions()
  const checkoutMutation = useCreateCheckoutSession()

  // Handle success redirect from Stripe - run once on mount if success=true
  useEffect(() => {
    const success = searchParams.get('success')
    
    if (success === 'true' && !hasProcessedSuccessRef.current) {
      hasProcessedSuccessRef.current = true
      
      // Store initial balance before polling
      initialBalanceRef.current = userTokens?.balance ?? 0
      setShowSuccessMessage(true)
      setIsPolling(true)
      
      // Clear the URL param immediately
      setSearchParams({}, { replace: true })
      
      console.log('[Billing] Payment success detected, starting polling. Initial balance:', initialBalanceRef.current)
      
      // Start aggressive polling
      let pollCount = 0
      const maxPolls = 20 // 20 polls * 1 second = 20 seconds max
      
      const pollInterval = setInterval(async () => {
        pollCount++
        console.log(`[Billing] Poll #${pollCount}`)
        
        try {
          const [tokensResult] = await Promise.all([
            refetchTokens(),
            refetchTransactions()
          ])
          
          const newBalance = tokensResult.data?.balance ?? 0
          console.log(`[Billing] New balance: ${newBalance}, Initial: ${initialBalanceRef.current}`)
          
          // Stop if balance changed or max polls reached
          if (newBalance !== initialBalanceRef.current || pollCount >= maxPolls) {
            console.log('[Billing] Stopping poll - balance updated or max reached')
            clearInterval(pollInterval)
            setIsPolling(false)
            
            if (newBalance !== initialBalanceRef.current) {
              // Balance updated! Keep success message a bit longer
              setTimeout(() => setShowSuccessMessage(false), 3000)
            } else {
              setShowSuccessMessage(false)
            }
          }
        } catch (err) {
          console.error('[Billing] Poll error:', err)
        }
      }, 1000) // Poll every 1 second
      
      return () => {
        clearInterval(pollInterval)
        setIsPolling(false)
      }
    }
  }, []) // Empty deps - only run on mount

  // Refetch when component mounts (in case user navigates back)
  useEffect(() => {
    refetchTokens()
    refetchTransactions()
  }, [])

  const handlePurchase = async (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId)
    if (!pkg) return

    setSelectedPackage(packageId)
    
    try {
      const result = await checkoutMutation.mutateAsync({
        packageId: pkg.id,
        priceId: pkg.stripePriceId,
      })
      
      // Navigate to checkout page with client secret
      if (result.clientSecret) {
        navigate(`${ROUTES.BILLING}/checkout?client_secret=${result.clientSecret}&package_id=${result.packageId}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setSelectedPackage(null)
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-4">
        <IconButton
          icon={<ChevronLeftIcon size={18} />}
          onClick={() => navigate(ROUTES.PROFILE)}
          label="Back to Profile"
        />
        <h1 className="text-base font-medium text-[var(--sona-text)]">Billing</h1>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-5 mb-2 p-3 bg-[var(--sona-sage)]/20 border border-[var(--sona-sage)]/30 rounded-lg"
        >
          <div className="flex items-center justify-center gap-2">
            {isPolling ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--sona-sage)]/30 border-t-[var(--sona-sage)] rounded-full animate-spin" />
                <p className="text-[var(--sona-sage)] text-sm font-medium">
                  Payment successful! Adding tokens...
                </p>
              </>
            ) : (
              <p className="text-[var(--sona-sage)] text-sm font-medium">
                ✓ Tokens added successfully!
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Token Balance Card */}
          <TokenBalance
            balance={userTokens?.balance ?? 0}
            isLoading={isLoadingTokens}
          />

          {/* Token Packages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-medium text-[var(--sona-text-muted)] mb-3">
              Get More Tokens
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {TOKEN_PACKAGES.map((pkg, index) => (
                <TokenPackageCard
                  key={pkg.id}
                  package={pkg}
                  isLoading={checkoutMutation.isPending && selectedPackage === pkg.id}
                  onPurchase={() => handlePurchase(pkg.id)}
                  delay={0.15 + index * 0.05}
                />
              ))}
            </div>
          </motion.div>

          {/* Transaction History */}
          <TransactionHistory />

          {/* Beta Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center py-4"
          >
            <Card className="bg-[var(--sona-gold)]/5 border-[var(--sona-gold)]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--sona-gold)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--sona-gold)]">✨</span>
                </div>
                <div className="text-left">
                  <p className="text-[var(--sona-text)] text-sm font-medium mb-1">
                    Beta Pricing
                  </p>
                  <p className="text-[var(--sona-text-muted)] text-xs">
                    During beta, all purchases are one-time token packs. 
                    Subscriptions coming soon with exclusive early-adopter benefits!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Secure Payment Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--sona-sage)]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[var(--sona-text-subtle)] text-xs">
              Secure payments by Stripe
            </span>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-3 text-center">
        <p className="text-[10px] text-[var(--sona-text-subtle)] tracking-wider">
          sona v0.1.0 · prototip
        </p>
      </footer>
    </div>
  )
}
