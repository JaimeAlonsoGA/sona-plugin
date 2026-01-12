/**
 * Landing Navigation
 * 
 * Top navigation bar for the landing page
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { SonaLogo } from '../shared/sona-logo'
import { useSession } from '../../lib/hooks'

interface NavProps {
  onRequestAccess: () => void
}

const NAV_LINKS = [
  { href: '#demo', label: 'Demos' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNav({ onRequestAccess }: NavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="backdrop-blur-xl border-b"
        style={{ 
          background: 'rgba(10, 10, 10, 0.8)',
          borderColor: 'var(--sona-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/landing" className="min-w-64 flex items-center gap-2">
              <SonaLogo size="md" animate={false} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center justify-end gap-4 min-w-64">
              {session ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--sona-void)] transition-all"
                    style={{
                      background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                    }}
                  >
                    Open Plugin
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
                  >
                    Sign in
                  </Link>
                  <button
                    onClick={onRequestAccess}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--sona-void)] transition-all"
                    style={{
                      background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                    }}
                  >
                    Request Access
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[var(--sona-text-muted)]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 border-b"
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              borderColor: 'var(--sona-border)',
            }}
          >
            <div className="px-6 py-4 space-y-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors py-2"
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-[var(--sona-border)] space-y-3">
                {session ? (
                  <>
                    <Link
                      to="/profile"
                      className="block text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/"
                      className="block w-full py-3 rounded-lg text-center font-medium text-[var(--sona-void)]"
                      style={{
                        background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Open Plugin
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="block text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        onRequestAccess()
                      }}
                      className="w-full py-3 rounded-lg text-center font-medium text-[var(--sona-void)]"
                      style={{
                        background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                      }}
                    >
                      Request Access
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
