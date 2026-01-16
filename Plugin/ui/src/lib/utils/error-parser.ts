/**
 * Error Parsing Utilities
 * 
 * Centralizes error parsing from various sources:
 * - Zod validation errors
 * - API/fetch errors
 * - Mutation errors
 * - Generic errors
 */

import type { ZodError } from 'zod'

// ============================================
// TYPES
// ============================================

export interface ParsedError {
  /** User-friendly error title */
  title: string
  /** Detailed error message */
  message: string
  /** Error code if available */
  code?: string
  /** Original error for debugging */
  originalError?: unknown
  /** Whether this is a validation error */
  isValidation?: boolean
  /** Whether this is a network error */
  isNetwork?: boolean
  /** Whether this requires user action (like insufficient tokens) */
  requiresAction?: boolean
  /** Suggested action for the user */
  suggestedAction?: string
}

// ============================================
// ERROR CODES
// ============================================

const ERROR_MESSAGES: Record<string, ParsedError> = {
  INSUFFICIENT_TOKENS: {
    title: 'Insufficient Tokens',
    message: 'You don\'t have enough tokens for this generation.',
    code: 'INSUFFICIENT_TOKENS',
    requiresAction: true,
    suggestedAction: 'Get more tokens to continue generating.',
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    code: 'NETWORK_ERROR',
    isNetwork: true,
    suggestedAction: 'Check your connection and try again.',
  },
  UNAUTHORIZED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    code: 'UNAUTHORIZED',
    requiresAction: true,
    suggestedAction: 'Sign in to continue.',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'You\'re making requests too quickly. Please wait a moment.',
    code: 'RATE_LIMIT',
    suggestedAction: 'Wait a few seconds before trying again.',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    code: 'SERVER_ERROR',
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    code: 'VALIDATION_ERROR',
    isValidation: true,
  },
}

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Check if error is a Zod error
 */
function isZodError(error: unknown): error is ZodError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'issues' in error &&
    Array.isArray((error as ZodError).issues)
  )
}

/**
 * Parse Zod validation errors into user-friendly messages
 */
export function parseZodError(error: ZodError): ParsedError {
  const issues = error.issues
  
  if (issues.length === 0) {
    return {
      ...ERROR_MESSAGES.VALIDATION_ERROR,
      originalError: error,
    }
  }

  // Get the first issue for the title
  const firstIssue = issues[0]
  const path = firstIssue.path.length > 0 ? firstIssue.path.join('.') : 'Input'
  
  // Combine all messages
  const messages = issues.map(issue => {
    const fieldPath = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${fieldPath}${issue.message}`
  })

  return {
    title: `Invalid ${path}`,
    message: messages.join('. '),
    code: 'VALIDATION_ERROR',
    isValidation: true,
    originalError: error,
  }
}

/**
 * Parse API error responses
 */
export function parseApiError(error: unknown): ParsedError {
  // Check for known error codes
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    
    // Check for code property
    if (errorObj.code && typeof errorObj.code === 'string') {
      const knownError = ERROR_MESSAGES[errorObj.code]
      if (knownError) {
        return {
          ...knownError,
          message: (errorObj.message as string) || knownError.message,
          originalError: error,
        }
      }
    }

    // Check for required tokens (insufficient tokens error)
    if (errorObj.required && typeof errorObj.required === 'number') {
      return {
        ...ERROR_MESSAGES.INSUFFICIENT_TOKENS,
        message: `This generation requires ${errorObj.required} tokens.`,
        originalError: error,
      }
    }

    // Check for status codes
    if (errorObj.status === 401 || errorObj.code === 401) {
      return { ...ERROR_MESSAGES.UNAUTHORIZED, originalError: error }
    }
    if (errorObj.status === 429 || errorObj.code === 429) {
      return { ...ERROR_MESSAGES.RATE_LIMIT, originalError: error }
    }
    if (errorObj.status && (errorObj.status as number) >= 500) {
      return { ...ERROR_MESSAGES.SERVER_ERROR, originalError: error }
    }

    // Generic API error with message
    if (errorObj.message && typeof errorObj.message === 'string') {
      return {
        title: 'Request Failed',
        message: errorObj.message,
        originalError: error,
      }
    }
  }

  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred.',
    originalError: error,
  }
}

/**
 * Parse network/fetch errors
 */
export function parseNetworkError(error: unknown): ParsedError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { ...ERROR_MESSAGES.NETWORK_ERROR, originalError: error }
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('network') || message.includes('offline') || message.includes('connection')) {
      return { ...ERROR_MESSAGES.NETWORK_ERROR, originalError: error }
    }
  }

  return {
    title: 'Network Error',
    message: error instanceof Error ? error.message : 'A network error occurred.',
    isNetwork: true,
    originalError: error,
  }
}

/**
 * Main error parser - detects error type and parses accordingly
 */
export function parseError(error: unknown): ParsedError {
  // Null/undefined
  if (error === null || error === undefined) {
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred.',
    }
  }

  // Zod error
  if (isZodError(error)) {
    return parseZodError(error)
  }

  // String error
  if (typeof error === 'string') {
    // Check for known patterns
    if (error.toLowerCase().includes('token')) {
      return {
        ...ERROR_MESSAGES.INSUFFICIENT_TOKENS,
        message: error,
      }
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('offline')) {
      return {
        ...ERROR_MESSAGES.NETWORK_ERROR,
        message: error,
      }
    }
    
    return {
      title: 'Error',
      message: error,
    }
  }

  // Error instance
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('offline')) {
      return parseNetworkError(error)
    }
    
    // Token errors
    if (message.includes('token') || message.includes('insufficient')) {
      return {
        ...ERROR_MESSAGES.INSUFFICIENT_TOKENS,
        message: error.message,
        originalError: error,
      }
    }

    // Auth errors
    if (message.includes('unauthorized') || message.includes('session') || message.includes('sign in')) {
      return {
        ...ERROR_MESSAGES.UNAUTHORIZED,
        message: error.message,
        originalError: error,
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        title: 'Validation Error',
        message: error.message,
        isValidation: true,
        originalError: error,
      }
    }

    return {
      title: 'Error',
      message: error.message,
      originalError: error,
    }
  }

  // Object error (API response)
  if (typeof error === 'object') {
    return parseApiError(error)
  }

  // Fallback
  return {
    title: 'Unknown Error',
    message: String(error),
    originalError: error,
  }
}

/**
 * Format error for display in toast
 */
export function formatErrorForToast(error: unknown): { title: string; message: string } {
  const parsed = parseError(error)
  return {
    title: parsed.title,
    message: parsed.message,
  }
}
