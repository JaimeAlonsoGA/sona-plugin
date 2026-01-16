/**
 * Landing Page
 * 
 * Public landing page for SONA - AI Audio Generation Plugin
 * Modern, clean design with gradient effects and animated elements
 * Closed Beta phase with registration modal
 * 
 * Note: This page is special and handles its own layout since it's the root route
 * and needs full control over the page structure.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Hero,
  ProductIntro,
  Features,
  ModeSelector,
  AudioShowcase,
  Pricing,
  CTA,
  LandingNav,
  LandingFooter,
} from '../../components/landing'
import { BetaModal } from '../../components/landing/beta-modal'
import { useBeta } from '../../hooks/use-beta'

export default function LandingPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const navigate = useNavigate()
  const { hasBetaAccess } = useBeta()

  const handleCloseBetaModal = () => {
    setIsBetaModalOpen(false)
  }

  // CTA handler - redirects to download if beta approved, otherwise opens modal
  const handleCTA = () => {
    if (hasBetaAccess) {
      navigate('/download')
    } else {
      setIsBetaModalOpen(true)
    }
  }

  const handleWatchDemo = () => {
    // Scroll to audio showcase
    const showcaseSection = document.querySelector('.audio-showcase-section')
    if (showcaseSection) {
      showcaseSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBuyTokens = (tier: string) => {
    // For beta, use the CTA handler
    handleCTA()
    console.log('Buy tokens clicked:', tier)
  }

  return (
    <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark transition-colors duration-300">
      {/* Grain Overlay Effect */}
      <div className="grain-overlay mix-blend-overlay dark:mix-blend-overlay" />

      {/* Navigation */}
      <LandingNav onDownload={handleCTA} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero onDownload={handleCTA} onWatchDemo={handleWatchDemo} />

        {/* Product Introduction */}
        <ProductIntro />

        {/* Features Section */}
        <Features />

        {/* Mode Selector */}
        <ModeSelector />

        {/* Audio Showcase */}
        <AudioShowcase handleOpenModal={handleCTA} />

        {/* Pricing Section */}
        <Pricing onBuyTokens={handleBuyTokens} />

        {/* Final CTA */}
        <CTA onDownload={handleCTA} />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Beta Registration Modal - Fixed to viewport center */}
      <BetaModal isOpen={isBetaModalOpen} onClose={handleCloseBetaModal} />
    </div>
  )
}
