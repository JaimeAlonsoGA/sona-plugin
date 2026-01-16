/**
 * Protected Content Component
 * 
 * Wrapper component for content that requires authentication and beta access.
 * Shows a friendly message with CTA to open beta modal if user doesn't have access.
 * 
 * Usage:
 * ```tsx
 * <ProtectedContent
 *   title="Submit Feedback"
 *   description="Share your thoughts and help us improve SONA."
 * >
 *   <FeedbackForm />
 * </ProtectedContent>
 * ```
 */

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Lock, Sparkles, Loader2 } from 'lucide-react'
import { useAccessGate } from '../../hooks/use-access-gate'

interface ProtectedContentProps {
  /** Content to show when user has access */
  children: ReactNode
  /** Title for the access required message */
  title?: string
  /** Description for the access required message */
  description?: string
  /** Custom loading component */
  loadingComponent?: ReactNode
  /** Whether to require beta access (default: true) */
  requireBetaAccess?: boolean
  /** Whether to require authentication only (default: false - requires both auth + beta) */
  requireAuthOnly?: boolean
}

/**
 * Default loading spinner
 */
function DefaultLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

/**
 * Access required message with CTA
 */
function AccessRequired({ 
  title, 
  description, 
  isAuthenticated,
  openBetaModal 
}: { 
  title: string
  description: string
  isAuthenticated: boolean
  openBetaModal: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">
          {title}
        </h2>
        
        <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8">
          {description}
        </p>
        
        <button
          onClick={openBetaModal}
          className="inline-flex items-center gap-2 bg-landing-surface-dark text-primary px-6 py-3 rounded-xl font-medium hover:bg-landing-text-light transition-colors shadow-lg shadow-primary/20"
        >
          {/* <Sparkles className="w-5 h-5" /> */}
          {isAuthenticated ? 'Request Beta Access' : 'Join the Beta'}
        </button>
        
        <p className="mt-4 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
          {isAuthenticated 
            ? 'Complete your beta application to access this feature.'
            : 'Sign up or log in to access this feature.'}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * Protected Content Wrapper
 * 
 * Wraps content that requires authentication and/or beta access.
 * Automatically shows loading state, access required message, or children.
 */
export function ProtectedContent({
  children,
  title = 'Beta Access Required',
  description = 'This feature is available exclusively to beta testers.',
  loadingComponent,
  requireBetaAccess = true,
  requireAuthOnly = false,
}: ProtectedContentProps) {
  const { 
    isAuthenticated, 
    hasAccess, 
    isLoading, 
    openModal 
  } = useAccessGate()

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoader />}</>
  }

  // Determine access
  const canAccess = requireAuthOnly 
    ? isAuthenticated 
    : (requireBetaAccess ? (isAuthenticated && hasAccess) : isAuthenticated)

  // Show access required message if no access
  if (!canAccess) {
    return (
      <AccessRequired
        title={title}
        description={description}
        isAuthenticated={isAuthenticated}
        openBetaModal={openModal}
      />
    )
  }

  // User has access - show children
  return <>{children}</>
}

export default ProtectedContent
