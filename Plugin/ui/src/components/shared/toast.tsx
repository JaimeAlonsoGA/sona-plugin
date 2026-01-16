/**
 * Toast Notification System
 * 
 * A lightweight, accessible toast notification system for displaying
 * errors, warnings, success messages, and info throughout the app.
 */

import React, { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from 'lucide-react'
import { openWebPage, WEBSITE_ROUTES } from '@/lib/navigation'

// ============================================
// TYPES
// ============================================

export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    /** Duration in ms before auto-dismiss. Set to 0 for persistent. */
    duration?: number
    /** Whether the toast can be dismissed by the user */
    dismissible?: boolean
    /** Optional action button */
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextValue {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => string
    removeToast: (id: string) => void
    clearAll: () => void
    // Convenience methods
    error: (title: string, message?: string, options?: Partial<Toast>) => string
    warning: (title: string, message?: string, options?: Partial<Toast>) => string
    success: (title: string, message?: string, options?: Partial<Toast>) => string
    info: (title: string, message?: string, options?: Partial<Toast>) => string
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================
// HOOK
// ============================================

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// ============================================
// PROVIDER
// ============================================

const DEFAULT_DURATION = {
    error: 8000,    // Errors stay longer
    warning: 6000,
    success: 4000,
    info: 5000,
}

let toastIdCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
        const id = `toast-${++toastIdCounter}`
        const duration = toast.duration ?? DEFAULT_DURATION[toast.type]

        const newToast: Toast = {
            ...toast,
            id,
            duration,
            dismissible: toast.dismissible ?? true,
        }

        setToasts(prev => {
            // Limit to 5 toasts, remove oldest if needed
            const updated = [...prev, newToast]
            if (updated.length > 5) {
                return updated.slice(-5)
            }
            return updated
        })

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration)
        }

        return id
    }, [removeToast])

    const clearAll = useCallback(() => {
        setToasts([])
    }, [])

    // Convenience methods
    const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'error', title, message, ...options })
    }, [addToast])

    const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'warning', title, message, ...options })
    }, [addToast])

    const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'success', title, message, ...options })
    }, [addToast])

    const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'info', title, message, ...options })
    }, [addToast])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<ToastContextValue>(() => ({
        toasts,
        addToast,
        removeToast,
        clearAll,
        error,
        warning,
        success,
        info,
    }), [toasts, addToast, removeToast, clearAll, error, warning, success, info])

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    )
}

// ============================================
// TOAST CONTAINER
// ============================================

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: string) => void }) {
    return (
        <div
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
            role="region"
            aria-label="Notifications"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    )
}

// ============================================
// TOAST ITEM
// ============================================

const TOAST_STYLES: Record<ToastType, {
    icon: typeof AlertTriangle
    iconColor: string
    borderColor: string
    bgColor: string
}> = {
    error: {
        icon: AlertCircle,
        iconColor: 'text-[var(--sona-ember)]',
        borderColor: 'border-[var(--sona-ember)]/50',
        bgColor: 'bg-[var(--sona-ember)]/10',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-[var(--sona-gold)]',
        borderColor: 'border-[var(--sona-gold)]/50',
        bgColor: 'bg-[var(--sona-gold)]/10',
    },
    success: {
        icon: CheckCircle,
        iconColor: 'text-[var(--sona-sage)]',
        borderColor: 'border-[var(--sona-sage)]/50',
        bgColor: 'bg-[var(--sona-sage)]/10',
    },
    info: {
        icon: Info,
        iconColor: 'text-[var(--sona-designer)]',
        borderColor: 'border-[var(--sona-designer)]/50',
        bgColor: 'bg-[var(--sona-designer)]/10',
    },
}

function ToastItem({ toast, onDismiss }: { toast: Toast, onDismiss: (id: string) => void }) {
    const style = TOAST_STYLES[toast.type]
    const Icon = style.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
        pointer-events-auto max-w-sm w-80
        bg-[var(--sona-surface)] border ${style.borderColor}
        rounded-xl shadow-lg shadow-black/20 overflow-hidden
      `}
            role="alert"
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
            <div className="p-3">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`shrink-0 p-1.5 rounded-lg ${style.bgColor}`}>
                        <Icon size={14} className={style.iconColor} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-xs font-medium ${style.iconColor}`}>
                            {toast.title}
                        </p>
                        {toast.message && (
                            <p className="text-[11px] text-[var(--sona-text-muted)] mt-0.5 leading-relaxed">
                                {toast.message}
                            </p>
                        )}
                        {toast.action && (
                            <button
                                onClick={toast.action.onClick}
                                className={`mt-2 text-[10px] font-medium ${style.iconColor} hover:underline`}
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>

                    {/* Dismiss button */}
                    {toast.dismissible && (
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="shrink-0 p-1 rounded-lg text-[var(--sona-text-muted)] 
                         hover:text-[var(--sona-text)] hover:bg-[var(--sona-surface-alt)]
                         transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    className={`h-0.5 ${style.bgColor}`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                />
            )}
        </motion.div>
    )
}

// ============================================
// ERROR BOUNDARY
// ============================================

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--sona-ember)]/10 flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-[var(--sona-ember)]" />
                    </div>
                    <h2 className="text-sm font-medium text-[var(--sona-text)] mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-xs text-[var(--sona-text-muted)] mb-4 max-w-xs">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 text-xs font-medium rounded-lg
                       bg-[var(--sona-surface)] border border-[var(--sona-border)]
                       text-[var(--sona-text)] hover:bg-[var(--sona-surface-alt)]
                       transition-colors"
                    >
                        Try again
                    </button>

                    {/* Support info */}
                    <div className="mt-6 pt-4 border-t border-[var(--sona-border)] text-[10px] text-[var(--sona-text-subtle)] max-w-xs">
                        <p className="mb-2">
                            If the error persists, contact us at{' '}
                            <a
                                href="mailto:support@sona.audio"
                                className="text-[var(--sona-designer)] hover:underline"
                            >
                                support@sona.audio
                            </a>
                        </p>
                        <p>
                            Think this is a bug?{' '}
                            <button
                                onClick={() => openWebPage(WEBSITE_ROUTES.FEEDBACK)}
                                className="text-[var(--sona-designer)] hover:underline"
                            >
                                Send feedback
                            </button>
                        </p>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
