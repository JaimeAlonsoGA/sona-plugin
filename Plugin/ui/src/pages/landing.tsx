/**
 * Landing Page
 * 
 * Public landing page for SONA - AI Audio Generation Plugin
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import {
  Hero,
  Features,
  AudioDemo,
  BetaCTA,
  Pricing,
  FAQ,
  LandingNav,
  LandingFooter,
} from '../components/landing'

export default function LandingPage() {
  const [showAccessModal, setShowAccessModal] = useState(false)

  const handleRequestAccess = () => {
    setShowAccessModal(true)
  }

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--sona-void)' }}
    >
      <LandingNav onRequestAccess={handleRequestAccess} />
      
      <main>
        <Hero onRequestAccess={handleRequestAccess} />
        
        <div id="features">
          <Features />
        </div>
        
        <AudioDemo />
        
        <BetaCTA onRequestAccess={handleRequestAccess} />
        
        <div id="pricing">
          <Pricing onRequestAccess={handleRequestAccess} />
        </div>
        
        <div id="faq">
          <FAQ />
        </div>
      </main>
      
      <LandingFooter />

      {/* Beta Access Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <BetaAccessModal onClose={() => setShowAccessModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

interface BetaAccessModalProps {
  onClose: () => void
}

function BetaAccessModal({ onClose }: BetaAccessModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Submit to Supabase
    // For now, simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md p-8 rounded-2xl"
        style={{
          background: 'var(--sona-surface)',
          border: '1px solid var(--sona-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          // Success state
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--sona-sage-soft)] flex items-center justify-center">
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-8 h-8 text-[var(--sona-sage)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--sona-cream)] mb-2">
              You're on the list!
            </h3>
            <p className="text-[var(--sona-text-muted)] mb-6">
              We'll send you an invite when your access is ready.
              Check your email for confirmation.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-medium text-[var(--sona-void)]"
              style={{
                background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
              }}
            >
              Got it
            </button>
          </div>
        ) : (
          // Form state
          <>
            <h3 className="text-xl font-semibold text-[var(--sona-cream)] mb-2">
              Request Beta Access
            </h3>
            <p className="text-sm text-[var(--sona-text-muted)] mb-6">
              Join the waitlist and get 500 free tokens when accepted.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[var(--sona-text)] placeholder-[var(--sona-text-subtle)]"
                  style={{
                    background: 'var(--sona-elevated)',
                    border: '1px solid var(--sona-border)',
                  }}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[var(--sona-text)] placeholder-[var(--sona-text-subtle)]"
                  style={{
                    background: 'var(--sona-elevated)',
                    border: '1px solid var(--sona-border)',
                  }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-2">
                  I am a...
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[var(--sona-text)]"
                  style={{
                    background: 'var(--sona-elevated)',
                    border: '1px solid var(--sona-border)',
                  }}
                >
                  <option value="">Select your role</option>
                  <option value="sound-designer">Sound Designer</option>
                  <option value="music-producer">Music Producer</option>
                  <option value="content-creator">Content Creator</option>
                  <option value="game-developer">Game Developer</option>
                  <option value="film-post">Film/Post Production</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full py-4 rounded-xl font-medium text-[var(--sona-void)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--sona-void)]/30 border-t-[var(--sona-void)] rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Request Access'
                )}
              </button>
            </form>

            <p className="text-xs text-[var(--sona-text-subtle)] text-center mt-4">
              We'll never share your email. No spam, ever.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
