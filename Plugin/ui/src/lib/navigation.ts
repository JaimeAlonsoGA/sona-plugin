/**
 * Cross-Domain Navigation Utilities
 * 
 * Single source of truth for all route definitions and cross-domain navigation.
 * 
 * Domain structure:
 * - sona.audio: Landing page, marketing, docs, public info
 * - plugin.sona.audio: Plugin web app (requires auth)
 * 
 * When in the plugin (JUCE WebView or plugin.sona.audio),
 * links to landing pages should open in the external browser.
 */

import { sendToPlugin } from './bridge'

// Domain configuration
const LANDING_DOMAIN = import.meta.env.VITE_LANDING_URL || 'https://sona.audio'
const PLUGIN_DOMAIN = import.meta.env.VITE_APP_URL || 'https://plugin.sona.audio'

/**
 * Landing page routes (hosted on sona.audio)
 * These are public pages for marketing, info, and onboarding
 */
export const WEBSITE_ROUTES = {
  HOME: '/',
  DOWNLOAD: '/download',
  ABOUT: '/about',
  PROMPTING: '/prompting',
  FEEDBACK: '/feedback',
  CONTACT: '/contact',
  COMMUNITY: '/community',
  PRICING: '/pricing',
  CHANGELOG: '/changelog',
  EMAIL_CONFIRM: '/auth/callback',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ADMIN: '/admin',
} as const

/**
 * Plugin app routes (hosted on plugin.sona.audio)
 * These require authentication
 */
export const PLUGIN_ROUTES = {
  ROOT: '/',
  APP: '/app',
  AUTH: '/auth',
  PROFILE: '/profile',
  SOUNDS: '/sounds',
  BILLING: '/billing',
  CHECKOUT: '/billing/checkout',
} as const

// Type helpers
export type LandingRoute = typeof WEBSITE_ROUTES[keyof typeof WEBSITE_ROUTES]
export type PluginRoute = typeof PLUGIN_ROUTES[keyof typeof PLUGIN_ROUTES]

/**
 * Check if we're running inside the JUCE plugin WebView
 */
export function isInJucePlugin(): boolean {
  return !!(window as any).__JUCE__
}

/**
 * Get the full URL for a landing page
 */
export function getLandingUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${LANDING_DOMAIN}${cleanPath}`
}

/**
 * Get the full URL for the plugin app
 */
export function getPluginUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${PLUGIN_DOMAIN}${cleanPath}`
}

/**
 * Open a URL in the system browser
 * Works both in JUCE WebView (via bridge) and regular browser
 */
export function openInBrowser(url: string): void {
  if (isInJucePlugin()) {
    // In JUCE WebView: send message to C++ to open URL
    console.log('[Navigation] Opening URL via JUCE bridge:', url)
    sendToPlugin({ type: 'open-url', payload: url })
  } else {
    // In regular browser: use window.open
    console.log('[Navigation] Opening URL in new tab:', url)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Open a landing page in the system browser
 * Use this from the plugin to open landing pages externally
 */
export function openWebPage(path: string): void {
  const url = getLandingUrl(path)
  openInBrowser(url)
}

/**
 * Open the plugin app in a new browser tab/window
 * Use this from the landing to open the plugin externally
 */
export function openPluginApp(path: string = '/'): void {
  const url = getPluginUrl(path)
  openInBrowser(url)
}

/**
 * Check if the current domain is the landing page
 */
export function isOnLandingDomain(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'sona.audio' ||
    hostname === 'www.sona.audio' ||
    hostname === 'localhost' // Dev can be either
}

/**
 * Check if the current domain is the plugin app
 */
export function isOnPluginDomain(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'plugin.sona.audio' ||
    hostname === 'localhost' // Dev can be either
}

/**
 * Smart navigation - handles cross-domain navigation automatically
 * If target is on a different domain, opens in new tab/browser
 * If target is on same domain, uses provided navigate function
 */
export function smartNavigate(
  path: string,
  navigate: (path: string) => void,
  options?: { forceExternal?: boolean }
): void {
  const landingPaths = Object.values(WEBSITE_ROUTES) as string[]
  const pluginPaths = Object.values(PLUGIN_ROUTES) as string[]

  // Check if path matches landing routes
  const isLandingRoute = landingPaths.some(route =>
    path === route || path.startsWith(route + '/')
  ) || path.startsWith('/blog') || path.startsWith('/docs')

  // Check if path matches plugin routes
  const isPluginRoute = pluginPaths.some(route =>
    path === route || path.startsWith(route + '/')
  )

  // In JUCE plugin or on plugin domain, landing routes open externally
  if ((isInJucePlugin() || isOnPluginDomain()) && isLandingRoute) {
    openWebPage(path)
    return
  }

  // On landing domain, plugin routes open externally
  if (isOnLandingDomain() && isPluginRoute && !isInJucePlugin()) {
    openPluginApp(path)
    return
  }

  // Force external navigation
  if (options?.forceExternal) {
    if (isLandingRoute) {
      openWebPage(path)
    } else {
      openPluginApp(path)
    }
    return
  }

  // Same domain navigation
  navigate(path)
}

// Export domain URLs for use in components
export const DOMAINS = {
  LANDING: LANDING_DOMAIN,
  PLUGIN: PLUGIN_DOMAIN,
} as const