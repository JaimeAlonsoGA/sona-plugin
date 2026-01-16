/**
 * Landing Navigation Component (New Design)
 * 
 * Fixed glass-morphism navigation bar with responsive menu
 * Hides on scroll down, shows on scroll up
 */

import { useState, useEffect } from 'react'
import { Menu, X, LogOut, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSession, useSignOut } from '../../lib/hooks'
import { useBetaStatus } from '../../lib/hooks/use-beta'
import { WEBSITE_ROUTES } from '@/routes'
import { BetaModal } from './beta-modal'

interface LandingNavProps {
  onDownload?: () => void
}

export function LandingNav({ onDownload }: LandingNavProps) {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const nav = useNavigate()
  const { data: session } = useSession()
  const signOutMutation = useSignOut()
  const { data: betaStatus } = useBetaStatus(session?.user?.id)
  
  const isLoggedIn = !!session?.user

  // Hide/show nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 100 // Start hiding after 100px
      
      if (currentScrollY < scrollThreshold) {
        // Always show when near top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down - hide
        setIsVisible(false)
        setMobileMenuOpen(false) // Close mobile menu when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navLinks = [
    { href: WEBSITE_ROUTES.PROMPTING, label: 'Promting' },
    { href: WEBSITE_ROUTES.COMMUNITY, label: 'Community' },
    { href: WEBSITE_ROUTES.PRICING, label: 'Pricing' },
  ]

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    nav(href)
  }

  const handleSignOut = async () => {
    setMobileMenuOpen(false)
    await signOutMutation.mutateAsync()
  }

  const handleStatusClick = () => {
    setMobileMenuOpen(false)
    if (betaStatus === 'approved') {
      nav('/download')
    } else {
      nav('/auth/callback')
    }
  }

  const getStatusConfig = () => {
    switch (betaStatus) {
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
        }
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
        }
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
        }
      case 'none':
      default:
        return {
          label: 'Apply',
          icon: FileText,
          className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20',
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <nav 
      className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-white/70 dark:bg-sona-void/80 border-b border-gray-200 dark:border-white/5 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => nav('/')} className="flex-shrink-0 flex items-center gap-2">
            <span className='sona-logo text-xl hover:bg-gradient-to-r hover:from-primary/60 hover:to-primary/80 hover:bg-clip-text hover:text-transparent'>sona</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium hover:text-primary transition-colors text-landing-subtext-light dark:text-landing-subtext-dark"
              >
                {link.label}
              </button>
            ))}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Beta Status Button */}
                <button
                  onClick={handleStatusClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${statusConfig.className}`}
                >
                  <statusConfig.icon className="w-4 h-4" />
                  {statusConfig.label}
                </button>
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={signOutMutation.isPending}
                  className="flex items-center gap-2 bg-zinc-800 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  // On landing page, use the passed handler (for scrolling)
                  // On other pages, open the beta modal directly
                  if (location.pathname === '/' && onDownload) {
                    onDownload()
                  } else {
                    setIsBetaModalOpen(true)
                  }
                }}
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition-all shadow-lg shadow-primary/20"
              >
                Download
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-landing-text-light dark:text-landing-text-dark hover:text-primary p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-3 py-2 text-base font-medium text-landing-subtext-light dark:text-landing-subtext-dark hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isLoggedIn ? (
              <div className="space-y-2 mt-2">
                {/* Beta Status Button - Mobile */}
                <button
                  onClick={handleStatusClick}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium border transition-all ${statusConfig.className}`}
                >
                  <statusConfig.icon className="w-4 h-4" />
                  {statusConfig.label}
                </button>
                {/* Sign Out Button - Mobile */}
                <button
                  onClick={handleSignOut}
                  disabled={signOutMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-zinc-700 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  // On landing page, use the passed handler (for scrolling)
                  // On other pages, open the beta modal directly
                  if (location.pathname === '/' && onDownload) {
                    onDownload()
                  } else {
                    setIsBetaModalOpen(true)
                  }
                }}
                className="w-full mt-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-amber-700 transition-all"
              >
                Download
              </button>
            )}
          </div>
        )}
      </div>

      {/* Beta Modal for login/signup */}
      <BetaModal 
        isOpen={isBetaModalOpen} 
        onClose={() => setIsBetaModalOpen(false)} 
      />
    </nav>
  )
}
