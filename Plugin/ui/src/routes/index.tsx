/**
 * App Router Configuration
 * 
 * Centralized routing with authentication guards and lazy loading.
 */

import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../lib/hooks'
import { WelcomeModal } from '../components/WelcomeModal'
import { CommandPalette } from '../components/CommandPalette'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../pages/landing'))
const SonaPage = lazy(() => import('../pages/sona'))
const AuthPage = lazy(() => import('../pages/auth'))
const ProfilePage = lazy(() => import('../pages/profile'))
const SoundsPage = lazy(() => import('../pages/sounds'))
const BillingPage = lazy(() => import('../pages/billing'))
const CheckoutPage = lazy(() => import('../pages/checkout'))
const FeedbackPage = lazy(() => import('../pages/feedback'))
const PromptingGuidePage = lazy(() => import('../pages/prompting'))
const AboutPage = lazy(() => import('../pages/about'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-[#467A5D] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#F6E092] border-t-transparent rounded-full animate-spin" />
      <span className="text-[#EFEDD7]/60 text-sm">Loading...</span>
    </div>
  </div>
)

// Suspense wrapper for lazy pages
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
)

// Root layout with global components (modals, command palette)
const RootLayout = () => {
  return (
    <>
      <Outlet />
      <WelcomeModal />
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

// Protected route wrapper - requires authentication
const ProtectedRoute = () => {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <PageLoader />
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return <PluginLayout />
}

// Public route wrapper - redirects to home if already authenticated
const PublicRoute = () => {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <PageLoader />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

// Route definitions
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public landing page (always accessible)
      {
        path: '/landing',
        element: (
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        ),
      },

      // Public info pages (always accessible)
      {
        path: '/prompting',
        element: (
          <SuspenseWrapper>
            <PromptingGuidePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/about',
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/form',
        element: (
          <SuspenseWrapper>
            <FeedbackPage />
          </SuspenseWrapper>
        ),
      },

      // Public routes (redirect to home if authenticated)
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

      // Protected routes (require authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
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

  // Catch-all redirect to landing
  {
    path: '*',
    element: <Navigate to="/landing" replace />,
  },
])

// Router provider component
export const AppRouter = () => {
  return <RouterProvider router={router} />
}

// Route paths enum for type-safe navigation
export const ROUTES = {
  LANDING: '/landing',
  HOME: '/',
  AUTH: '/auth',
  PROFILE: '/profile',
  SOUNDS: '/sounds',
  BILLING: '/billing',
  CHECKOUT: '/billing/checkout',
  FORM: '/form',
  PROMPTING: '/prompting',
  ABOUT: '/about',
} as const

export type RoutePath = typeof ROUTES[keyof typeof ROUTES]
