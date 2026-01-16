/**
 * Beta Access Context
 * 
 * Provides beta access state throughout the app.
 * Works with useBridge to determine if we're in plugin or landing context.
 * Uses TanStack Query for proper cache management and state persistence.
 */

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from '../lib/hooks'
import { useBridge } from '../lib/bridge'
import { 
  BetaStatus, 
  BetaApplication,
  isBetaAccessRequired 
} from '../lib/beta'
import { 
  useBetaStatus, 
  useBetaApplication, 
  useInvalidateBetaQueries 
} from '../lib/hooks/use-beta'

interface BetaContextType {
  // Beta state
  betaStatus: BetaStatus
  betaApplication: BetaApplication | null
  isLoading: boolean
  
  // Computed states
  hasBetaAccess: boolean
  isPending: boolean
  isRejected: boolean
  needsApplication: boolean
  
  // Actions
  refreshBetaStatus: () => void
  
  // Context info
  isInPlugin: boolean
  requiresBetaAccess: boolean
}

const BetaContext = createContext<BetaContextType | undefined>(undefined)

export function BetaProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const { isInPlugin } = useBridge()
  
  const userId = session?.user?.id
  
  // Use TanStack Query hooks for proper cache management
  const { data: betaStatus = 'none', isLoading: isStatusLoading } = useBetaStatus(userId)
  const { data: betaApplication = null, isLoading: isApplicationLoading } = useBetaApplication(userId)
  const invalidateBetaQueries = useInvalidateBetaQueries()

  const isLoading = isStatusLoading || isApplicationLoading

  const value: BetaContextType = {
    betaStatus,
    betaApplication,
    isLoading,
    
    // Computed
    hasBetaAccess: betaStatus === 'approved',
    isPending: betaStatus === 'pending',
    isRejected: betaStatus === 'rejected',
    needsApplication: betaStatus === 'none',
    
    // Actions - invalidate queries to trigger refetch
    refreshBetaStatus: invalidateBetaQueries,
    
    // Context
    isInPlugin,
    requiresBetaAccess: isBetaAccessRequired(),
  }

  return (
    <BetaContext.Provider value={value}>
      {children}
    </BetaContext.Provider>
  )
}

export function useBeta() {
  const context = useContext(BetaContext)
  if (!context) {
    throw new Error('useBeta must be used within a BetaProvider')
  }
  return context
}
