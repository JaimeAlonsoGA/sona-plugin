/**
 * Landing Footer
 * 
 * Site footer with links and info
 */

import { Link } from 'react-router-dom'
import { SonaLogo } from '../shared/sona-logo'
import { Github, Twitter } from 'lucide-react'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-16 px-6 border-t border-[var(--sona-border)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <SonaLogo size="md" animate={false} />
            <p className="mt-4 text-sm text-[var(--sona-text-muted)] leading-relaxed">
              AI-powered audio generation for sound designers, music producers, and content creators.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-medium text-[var(--sona-cream)] mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Demos
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-medium text-[var(--sona-cream)] mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/prompting" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Prompting Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/form" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Send Feedback
                </Link>
              </li>
              <li>
                <a href="mailto:support@sona.audio" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium text-[var(--sona-cream)] mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--sona-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--sona-text-subtle)]">
            © {currentYear} SONA. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--sona-text-subtle)]">
              Powered by Stable Audio 2.5
            </span>
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com/sona_audio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/sona-audio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--sona-text-muted)] hover:text-[var(--sona-text)] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
