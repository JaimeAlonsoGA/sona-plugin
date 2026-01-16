/**
 * Access Gate Context
 * 
 * Provides access control and gating functionality throughout the website.
 * Manages modal state and handles protected actions based on access level.
 * This context should be used at the website layout level.
 * 
 * Generic system that can be extended for different access tiers:
 * - Beta access (current)
 * - Premium/subscription tiers (future)
 * - Feature flags (future)
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeta } from './use-beta'
import { useSession } from '../lib/hooks'

interface AccessGateContextType {
  /** Handle protected CTA - opens modal for users without access, or redirect to download for approved users */
  handleProtectedAction: () => void
  /** Whether the access modal is currently open */
  isModalOpen: boolean
  /** Open the access modal */
  openModal: () => void
  /** Close the access modal */
  closeModal: () => void
  /** Whether the user has full access (beta access for now) */
  hasAccess: boolean
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Loading state for session */
  isSessionLoading: boolean
  /** Loading state for access status */
  isAccessLoading: boolean
  /** Combined loading state */
  isLoading: boolean
  /** Check if user can access protected content (authenticated + has access) */
  canAccessProtected: boolean
}

const AccessGateContext = createContext<AccessGateContextType | undefined>(undefined)

export function AccessGateProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const { data: session, isLoading: isSessionLoading } = useSession()
  const { hasBetaAccess, isLoading: isAccessLoading } = useBeta()

  const isAuthenticated = !!session?.user
  const isLoading = isSessionLoading || isAccessLoading
  // For now, access = beta access. This can be extended for tiers/features
  const hasAccess = hasBetaAccess
  const canAccessProtected = isAuthenticated && hasAccess

  const openModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleProtectedAction = useCallback(() => {
    if (hasAccess) {
      navigate('/download')
    } else {
      setIsModalOpen(true)
    }
  }, [hasAccess, navigate])

  const value: AccessGateContextType = {
    handleProtectedAction,
    isModalOpen,
    openModal,
    closeModal,
    hasAccess,
    isAuthenticated,
    isSessionLoading,
    isAccessLoading,
    isLoading,
    canAccessProtected,
  }

  return (
    <AccessGateContext.Provider value={value}>
      {children}
    </AccessGateContext.Provider>
  )
}

export function useAccessGate() {
  const context = useContext(AccessGateContext)
  if (!context) {
    throw new Error('useAccessGate must be used within an AccessGateProvider')
  }
  return context
}
