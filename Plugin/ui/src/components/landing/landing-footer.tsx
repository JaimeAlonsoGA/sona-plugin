/**
 * Landing Footer Component
 * 
 * Full footer with navigation links and branding
 */

import { WEBSITE_ROUTES } from "@/routes"
import { Link } from "react-router-dom"

const FOOTER_LINKS = {
  product: [
    { label: 'Download', href: WEBSITE_ROUTES.DOWNLOAD },
    { label: 'Changelog', href: WEBSITE_ROUTES.CHANGELOG },
    { label: 'Pricing', href: WEBSITE_ROUTES.PRICING },
  ],
  resources: [
    // { label: 'Documentation', href: '#' },
    { label: 'Feedback', href: WEBSITE_ROUTES.FEEDBACK },
    { label: 'Community', href: WEBSITE_ROUTES.COMMUNITY },
    // { label: 'Blog', href: WEBSITE_ROUTES.BLOG },
    { label: 'Prompting Guide', href: WEBSITE_ROUTES.PROMPTING },
  ],
  company: [
    { label: 'About', href: WEBSITE_ROUTES.ABOUT },
    { label: 'Contact', href: WEBSITE_ROUTES.CONTACT },
    { label: 'Privacy', href: WEBSITE_ROUTES.PRIVACY },
    { label: 'Terms', href: WEBSITE_ROUTES.TERMS },
  ],
}

export function LandingFooter() {
  return (
    <footer className="bg-landing-bg-light dark:bg-landing-bg-dark border-t border-gray-200 dark:border-white/5 pt-12 md:pt-20 pb-8 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-0 mb-12 md:mb-20 relative">
          {/* Large Background Logo Text - Hidden on mobile */}
          <div className="absolute bottom-0 left-0 -mb-20 -ml-10 opacity-5 pointer-events-none select-none hidden md:block">
            <span className="text-[12rem] md:text-[18rem] font-mono font-bold text-landing-text-light dark:text-landing-text-dark leading-none">
              sona
            </span>
          </div>

          {/* Logo and Tagline */}
          <div className="mb-6 md:mb-0 relative z-10">
            <div className="flex items-center gap-2">
              <span className='sona-logo text-xl'>sona</span>
            </div>
            <p className="font-sans text-sm md:text-base text-landing-subtext-light dark:text-landing-subtext-dark max-w-xs">
              Empowering the next generation of audio creators with ethical AI tools.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 md:gap-24 relative z-10 w-full md:w-auto">
            <div>
              <h4 className="font-bold mb-4 md:mb-6 text-xs md:text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 md:space-y-4 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                {FOOTER_LINKS.product.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 md:mb-6 text-xs md:text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 md:space-y-4 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                {FOOTER_LINKS.resources.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold mb-4 md:mb-6 text-xs md:text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 md:space-y-4 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 border-t border-gray-200 dark:border-white/5 pt-6 md:pt-8 text-xs text-landing-subtext-light dark:text-landing-subtext-dark relative z-10">
          <p className="text-center md:text-left">© 2026 aiwasamistake.ai | All rights reserved.</p>
          <div className="flex gap-6">
            <Link to={WEBSITE_ROUTES.PRIVACY} className="hover:text-primary">Privacy Policy</Link>
            <Link to={WEBSITE_ROUTES.TERMS} className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
