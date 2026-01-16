/**
 * App Router Configuration
 * 
 * Separated routing for Landing (web) and Plugin (JUCE WebView) contexts.
 * Landing routes are public with beta-protected areas.
 * Plugin routes require authentication.
 * 
 * Route constants are defined in lib/navigation.ts
 */

import { lazy, Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../lib/hooks'
import { useBridge } from '../lib/bridge'
import { BetaProvider } from '../hooks/use-beta'
import { AnnouncementModal } from '../components/AnnouncementModal'
import { CommandPalette } from '../components/CommandPalette'
import { SonaProvider } from '../hooks/use-sona-state'
import { WEBSITE_ROUTES, PLUGIN_ROUTES } from '../lib/navigation'
import { ToastProvider, ErrorBoundary } from '../components/shared'
import { WebsiteLayout } from '../layouts'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../pages/website/landing'))
const DownloadPage = lazy(() => import('../pages/website/download'))
const EmailConfirmationPage = lazy(() => import('../pages/website/email-confirmation'))
const SonaPage = lazy(() => import('../pages/plugin/sona'))
const AuthPage = lazy(() => import('../pages/plugin/auth'))
const ProfilePage = lazy(() => import('../pages/plugin/profile'))
const SoundsPage = lazy(() => import('../pages/plugin/sounds'))
const BillingPage = lazy(() => import('../pages/plugin/billing'))
const CheckoutPage = lazy(() => import('../pages/plugin/checkout'))
const FeedbackPage = lazy(() => import('../pages/website/feedback'))
const PromptingGuidePage = lazy(() => import('../pages/website/prompting'))
const AboutPage = lazy(() => import('../pages/website/about'))
const ChangelogPage = lazy(() => import('../pages/website/changelog'))
const PricingPage = lazy(() => import('../pages/website/pricing'))
const PrivacyPage = lazy(() => import('../pages/website/privacy'))
const TermsPage = lazy(() => import('../pages/website/terms'))
const ContactPage = lazy(() => import('../pages/website/contact'))
const CommunityPage = lazy(() => import('../pages/website/community'))
const AdminPage = lazy(() => import('../pages/website/admin'))

// Loading fallback component
const PageLoader = () => (
  <div className="page bg-[var(--sona-deep)] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#F6E092] border-t-transparent rounded-full animate-spin" />
      <span className="text-[var(--sona-text-muted)] text-sm font-mono">SONA, wake up!...</span>
    </div>
  </div>
)

// Landing page loader (different style)
const LandingLoader = () => (
  <div className="min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm font-mono font-bold">Pss, Pss, SONA... a user!</span>
    </div>
  </div>
)

// Suspense wrapper for lazy pages
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
)

const LandingSuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LandingLoader />}>
    {children}
  </Suspense>
)

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Root layout with global providers
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BetaProvider>
          <SonaProvider>
            <ScrollToTop />
            <Outlet />
          </SonaProvider>
        </BetaProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

// Plugin-specific layout with modals
const PluginRootLayout = () => {
  return (
    <>
      <Outlet />
      <AnnouncementModal />
      <CommandPalette />
    </>
  )
}

// Plugin layout wrapper - applies fixed dimensions for plugin pages
const PluginLayout = () => {
  return (
    <div className="plugin-container">
      <Outlet />
    </div>
  )
}

// Protected route wrapper - requires authentication (for plugin)
const ProtectedPluginRoute = () => {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <PageLoader />
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return <PluginLayout />
}

// Public route wrapper - redirects to home if already authenticated (for plugin auth page)
const PublicRoute = () => {
  const { isInPlugin } = useBridge()
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <PageLoader />
  }

  // Only redirect if in plugin context
  if (session && isInPlugin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

// Check if we're on the plugin domain/context
const useIsPluginContext = () => {
  const { isInPlugin } = useBridge()
  const isPluginDomain = typeof window !== 'undefined' &&
    (window.location.hostname === 'plugin.sona.audio' ||
      window.location.hostname.startsWith('plugin.'))
  return isInPlugin || isPluginDomain
}

// Smart root route - shows landing on sona.audio, redirects to /app on plugin.sona.audio
const SmartRootRoute = () => {
  const isPluginContext = useIsPluginContext()

  // In JUCE plugin or on plugin subdomain: redirect to main app
  if (isPluginContext) {
    return <Navigate to="/app" replace />
  }

  // On landing domain: show landing page directly at /
  return (
    <LandingSuspenseWrapper>
      <LandingPage />
    </LandingSuspenseWrapper>
  )
}

// Route definitions
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Root route - Landing on sona.audio, redirect on plugin.sona.audio
      {
        path: '/',
        element: <SmartRootRoute />,
      },

      // ==========================================
      // WEBSITE ROUTES (Web - Public on sona.audio)
      // Uses WebsiteLayout with shared Nav, Footer, and BetaModal
      // ==========================================
      {
        element: (
          <LandingSuspenseWrapper>
            <WebsiteLayout />
          </LandingSuspenseWrapper>
        ),
        children: [
          // Public info pages
          {
            path: '/prompting',
            element: (
              <Suspense fallback={null}>
                <PromptingGuidePage />
              </Suspense>
            ),
          },
          {
            path: '/about',
            element: (
              <Suspense fallback={null}>
                <AboutPage />
              </Suspense>
            ),
          },
          {
            path: '/feedback',
            element: (
              <Suspense fallback={null}>
                <FeedbackPage />
              </Suspense>
            ),
          },
          {
            path: '/changelog',
            element: (
              <Suspense fallback={null}>
                <ChangelogPage />
              </Suspense>
            ),
          },
          {
            path: '/pricing',
            element: (
              <Suspense fallback={null}>
                <PricingPage />
              </Suspense>
            ),
          },
          {
            path: '/privacy',
            element: (
              <Suspense fallback={null}>
                <PrivacyPage />
              </Suspense>
            ),
          },
          {
            path: '/terms',
            element: (
              <Suspense fallback={null}>
                <TermsPage />
              </Suspense>
            ),
          },
          {
            path: '/contact',
            element: (
              <Suspense fallback={null}>
                <ContactPage />
              </Suspense>
            ),
          },
          {
            path: '/community',
            element: (
              <Suspense fallback={null}>
                <CommunityPage />
              </Suspense>
            ),
          },
          // Admin dashboard (protected by component itself)
          {
            path: '/admin',
            element: (
              <Suspense fallback={null}>
                <AdminPage />
              </Suspense>
            ),
          },
          // Download page (uses ProtectedContent internally for beta access)
          {
            path: '/download',
            element: (
              <Suspense fallback={null}>
                <DownloadPage />
              </Suspense>
            ),
          },
        ],
      },

      // Email confirmation callback (special - no layout)
      {
        path: '/auth/callback',
        element: (
          <LandingSuspenseWrapper>
            <EmailConfirmationPage />
          </LandingSuspenseWrapper>
        ),
      },

      // ==========================================
      // PLUGIN ROUTES (JUCE WebView - Protected)
      // ==========================================

      {
        element: <PluginRootLayout />,
        children: [
          // Auth page (public within plugin context)
          {
            element: <PublicRoute />,
            children: [
              {
                path: '/auth',
                element: (
                  <SuspenseWrapper>
                    <AuthPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },

          // Protected plugin routes
          {
            element: <ProtectedPluginRoute />,
            children: [
              {
                path: '/app',
                element: (
                  <SuspenseWrapper>
                    <SonaPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/profile',
                element: (
                  <SuspenseWrapper>
                    <ProfilePage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/sounds',
                element: (
                  <SuspenseWrapper>
                    <SoundsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/billing',
                element: (
                  <SuspenseWrapper>
                    <BillingPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/billing/checkout',
                element: (
                  <SuspenseWrapper>
                    <CheckoutPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },

      // Catch-all redirect to home
      {
        path: '*',
        element: <SmartRootRoute />,
      },
    ],
  },
])

// Router provider component
export const AppRouter = () => {
  return <RouterProvider router={router} />
}

// Re-export route constants from navigation.ts for convenience
export { WEBSITE_ROUTES, PLUGIN_ROUTES } from '../lib/navigation'

// Unified ROUTES constant for backwards compatibility
export const ROUTES = {
  // Plugin routes
  ...PLUGIN_ROUTES,
  HOME: PLUGIN_ROUTES.APP, // Alias for plugin context

  // Landing routes (reference only - use openWebPage() to navigate)
  LANDING_HOME: WEBSITE_ROUTES.HOME,  // sona.audio/
  DOWNLOAD: WEBSITE_ROUTES.DOWNLOAD,
  AUTH_CALLBACK: WEBSITE_ROUTES.EMAIL_CONFIRM,
  ABOUT: WEBSITE_ROUTES.ABOUT,
  PROMPTING: WEBSITE_ROUTES.PROMPTING,
  FEEDBACK: WEBSITE_ROUTES.FEEDBACK,
  PRIVACY: WEBSITE_ROUTES.PRIVACY,
  TERMS: WEBSITE_ROUTES.TERMS,
} as const

export type RoutePath = typeof ROUTES[keyof typeof ROUTES]
