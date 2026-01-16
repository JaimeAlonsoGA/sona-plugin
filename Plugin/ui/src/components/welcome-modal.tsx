/**
 * Welcome Modal Component
 * 
 * Multi-panel onboarding experience shown on every plugin open
 * Panel 1: Open Beta advantages
 * Panel 2: Prompting types (Text-to-Audio, Audio-to-Audio, Inpaint)
 * Panel 3: Terms and policies
 * 
 * User can opt to not show again via checkbox
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../lib/hooks'
import { Checkbox } from './ui/checkbox'

import textToAudioImage from '../assets/text-to-audio.png'
import audioToAudioImage from '../assets/audio-to-audio.png'
import inpaintImage from '../assets/inpaint.png'

const ANNOUNCEMENT_VERSION = '0.1.0'
const STORAGE_KEY = `sona-welcome-hidden-${ANNOUNCEMENT_VERSION}`

const BETA_ADVANTAGES = [
  { icon: '🎁', title: '500 Free Tokens', description: 'Start creating immediately with generous free credits' },
  { icon: '🚀', title: 'Early Access', description: 'Be among the first to experience AI audio generation' },
  { icon: '💫', title: 'Priority Support', description: 'Direct access to our team for feedback and help' },
  { icon: '🎨', title: 'Shape the Future', description: 'Your feedback directly influences product development' },
  { icon: '🔓', title: 'All Features Unlocked', description: 'Full access to Designer and Producer modes' },
]

const PROMPTING_TYPES = [
  {
    id: 'text-to-audio',
    title: 'Text to Audio',
    description: 'Describe your sound and let AI bring it to life',
    gradient: 'from-[#6BA3B5] to-[#4A8A9A]',
    image: textToAudioImage,
    available: true,
  },
  {
    id: 'audio-to-audio',
    title: 'Audio to Audio',
    description: 'Transform existing audio with AI-powered variations',
    gradient: 'from-[#D4A56A] to-[#B8915A]',
    image: audioToAudioImage,
    available: false,
  },
  {
    id: 'inpaint',
    title: 'Inpaint Generation',
    description: 'Regenerate specific sections while keeping the rest',
    gradient: 'from-[#7BA38E] to-[#5A8A6E]',
    image: inpaintImage,
    available: false,
  },
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPanel, setCurrentPanel] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const { data: session, isLoading } = useSession()

  const userName = session?.user?.user_metadata?.display_name || 
                   session?.user?.email?.split('@')[0] || 
                   'Creator'

  useEffect(() => {
    // Show modal every time plugin opens, unless user opted out
    if (!isLoading && session?.user) {
      const isHidden = localStorage.getItem(STORAGE_KEY) === 'true'
      if (!isHidden) {
        setIsOpen(true)
      }
    }
  }, [session, isLoading])

  const handleClose = () => {
    // Only persist if user checked "Don't show again"
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentPanel < 2) {
      setCurrentPanel(currentPanel + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1)
    }
  }

  const renderPanel = () => {
    switch (currentPanel) {
      case 0:
        return <BetaAdvantagesPanel />
      case 1:
        return <PromptingTypesPanel />
      case 2:
        return <TermsPanel />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[var(--sona-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--sona-border)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[var(--sona-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sona-ember)] to-[var(--sona-gold)] flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--sona-cream)]">Welcome to SONA</h2>
                    <p className="text-xs text-[var(--sona-text-muted)]">
                      Hello, <span className="text-[var(--sona-gold)]">{userName}</span>!
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-[var(--sona-ember)]/20 text-[var(--sona-ember)] rounded-full">
                  Open Beta
                </span>
              </div>
            </div>

            {/* Panel Content */}
            <div className="px-6 py-5 min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderPanel()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pb-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPanel(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentPanel 
                      ? 'bg-[var(--sona-ember)] w-6' 
                      : 'bg-[var(--sona-muted)] hover:bg-[var(--sona-text-subtle)]'
                  }`}
                />
              ))}
            </div>

            {/* Footer with Navigation */}
            <div className="px-6 py-4 border-t border-[var(--sona-border)] bg-[var(--sona-elevated)]">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    id="dont-show-again"
                    checked={dontShowAgain}
                    onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                  />
                  <span className="text-[10px] text-[var(--sona-text-subtle)] group-hover:text-[var(--sona-text-muted)] transition-colors select-none">
                    Don't show again
                  </span>
                </label>
                <div className="flex gap-2">
                  {currentPanel > 0 && (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 text-sm font-medium bg-[var(--sona-ember)] hover:bg-[var(--sona-ember)]/90 text-[var(--sona-cream)] rounded-lg transition-colors"
                  >
                    {currentPanel === 2 ? 'Start Creating!' : 'Next'}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[9px] text-[var(--sona-text-subtle)]">
                  <span className="font-medium">SONA</span> v{ANNOUNCEMENT_VERSION} · Sonantic Labs
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BetaAdvantagesPanel() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--sona-gold)] uppercase tracking-wider mb-4">
        Open Beta Benefits
      </h3>
      <div className="space-y-2">
        {BETA_ADVANTAGES.map((advantage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center gap-3 p-2.5 h-12 rounded-xl bg-[var(--sona-elevated)] border border-[var(--sona-border)]"
          >
            <span className="text-base shrink-0">{advantage.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--sona-cream)] truncate">{advantage.title}</p>
              <p className="text-[10px] text-[var(--sona-text-muted)] truncate">{advantage.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PromptingTypesPanel() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--sona-gold)] uppercase tracking-wider mb-4">
        Ways to Create
      </h3>
      <div className="space-y-2">
        {PROMPTING_TYPES.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative h-[82px] rounded-xl overflow-hidden ${!type.available ? 'opacity-60' : ''}`}
          >
            {/* Image Background */}
            <img 
              src={type.image} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${type.gradient} opacity-60`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            
            <div className="relative flex items-center gap-3 h-full p-3">
              {/* Image thumbnail - shows full image */}
              <div className="h-16 w-12 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/20">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--sona-cream)]">{type.title}</p>
                  {!type.available && (
                    <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--sona-text-muted)] mt-0.5 truncate">{type.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TermsPanel() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--sona-gold)] uppercase tracking-wider mb-4">
        Terms & Ownership
      </h3>
      
      <div className="space-y-4">
        {/* Main ownership message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl bg-gradient-to-br from-[var(--sona-sage)]/20 to-[var(--sona-sage)]/5 border border-[var(--sona-sage)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--sona-sage)]/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h4 className="text-base font-semibold text-[var(--sona-cream)]">Your Creations, Your Rights</h4>
          </div>
          <p className="text-sm text-[var(--sona-text-muted)] leading-relaxed">
            All audio generated through SONA belongs entirely to you. You retain full ownership 
            and commercial rights to use your creations however you wish — in games, music, 
            films, or any other project.
          </p>
        </motion.div>

        {/* Additional terms */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--sona-text-muted)]">
            <span className="text-[var(--sona-sage)]">✓</span>
            <span>No attribution required</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--sona-text-muted)]">
            <span className="text-[var(--sona-sage)]">✓</span>
            <span>Commercial use permitted</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--sona-text-muted)]">
            <span className="text-[var(--sona-sage)]">✓</span>
            <span>Unlimited modifications allowed</span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--sona-text-subtle)] mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Beta features may change without notice.
        </p>
      </div>
    </div>
  )
}
