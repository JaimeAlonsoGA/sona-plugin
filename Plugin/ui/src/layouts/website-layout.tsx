/**
 * Website Layout Component
 * 
 * Shared layout for all website pages (not plugin).
 * Includes navigation, footer, and the global beta modal.
 * The beta modal is positioned fixed to the viewport center,
 * independent of header/footer positioning.
 */

import { Outlet } from 'react-router-dom'
import { LandingNav } from '../components/landing/landing-nav'
import { LandingFooter } from '../components/landing/landing-footer'
import { BetaModal } from '../components/landing/beta-modal'
import { AccessGateProvider, useAccessGate } from '../hooks/use-access-gate'

/**
 * Inner layout component that uses the AccessGate context
 * This needs to be separate because it consumes the context
 */
function WebsiteLayoutInner() {
  const { handleProtectedAction, isModalOpen, closeModal } = useAccessGate()

  return (
    <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark transition-colors duration-300">
      {/* Grain Overlay Effect */}
      <div className="grain-overlay mix-blend-overlay dark:mix-blend-overlay" />

      {/* Navigation */}
      <LandingNav onDownload={handleProtectedAction} />

      {/* Main Content - Children routes rendered here */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Beta Registration Modal - Fixed to viewport center */}
      <BetaModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}

/**
 * Website Layout with BetaCTA Provider
 * Wraps the inner layout with the context provider
 */
export function WebsiteLayout() {
  return (
    <AccessGateProvider>
      <WebsiteLayoutInner />
    </AccessGateProvider>
  )
}

/**
 * Minimal Website Layout - For pages that need nav/footer but custom content wrapper
 * Use this for pages that have their own full-page styling
 */
export function MinimalWebsiteLayout() {
  return (
    <AccessGateProvider>
      <MinimalWebsiteLayoutInner />
    </AccessGateProvider>
  )
}

function MinimalWebsiteLayoutInner() {
  const { handleProtectedAction, isModalOpen, closeModal } = useAccessGate()

  return (
    <>
      <LandingNav onDownload={handleProtectedAction} />
      <Outlet />
      <LandingFooter />
      <BetaModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}

export default WebsiteLayout
