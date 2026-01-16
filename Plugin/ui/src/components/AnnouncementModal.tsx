/**
 * Beta Announcement Modal Component
 * 
 * Professional onboarding modal for beta testers.
 * Communicates:
 * - Closed beta status and gratitude
 * - Welcome token package (1000 tokens)
 * - Content ownership guarantee
 * - Reporting expectations (bugs, feedback, suggestions)
 * - Future features roadmap
 * - Token purchase and billing information
 * 
 * Preference to hide is stored in localStorage and persists across sessions.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../lib/hooks'
import { Checkbox } from './ui/checkbox'

const ANNOUNCEMENT_VERSION = '1.0.0'
const STORAGE_KEY = `sona-beta-announcement-hidden-${ANNOUNCEMENT_VERSION}`

export function AnnouncementModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [dontShowAgain, setDontShowAgain] = useState(false)
    const { data: session, isLoading } = useSession()

    useEffect(() => {
        // Show modal on first visit unless user opted out
        if (!isLoading && session?.user) {
            const isHidden = localStorage.getItem(STORAGE_KEY) === 'true'
            if (!isHidden) {
                setIsOpen(true)
            }
        }
    }, [session, isLoading])

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true')
        }
        setIsOpen(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[var(--sona-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--sona-border)] overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-[var(--sona-border)]">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-[var(--sona-cream)]">Welcome to SONA Beta</h2>
                                    <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider bg-[var(--sona-ember)]/20 text-[var(--sona-ember)] rounded-full">
                                        Closed Beta
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--sona-text-muted)]">
                                    Thank you for being part of our journey in AI audio generation
                                </p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {/* Section 1: Welcome Package */}
                            <Section
                                title="Your Welcome Package"
                                description="Get started immediately with a generous token allocation"
                            >
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[var(--sona-gold)]/20 to-[var(--sona-gold)]/5 border border-[var(--sona-gold)]">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--sona-gold)]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">1000</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[var(--sona-gold)]"> Free Tokens</p>
                                        <p className="text-xs text-[var(--sona-text-muted)] mt-1">
                                            Complimentary tokens to explore all generation modes and features
                                        </p>
                                    </div>
                                </div>
                            </Section>

                            {/* Section 2: Your Rights */}
                            <Section
                                title="Your Creations Are Yours"
                                description="Full ownership and commercial rights"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[var(--sona-sage)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs text-[var(--sona-sage)]">✓</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-[var(--sona-cream)]">100% Ownership</p>
                                            <p className="text-xs text-[var(--sona-text-muted)] mt-0.5">All audio you generate belongs entirely to you</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[var(--sona-sage)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs text-[var(--sona-sage)]">✓</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-[var(--sona-cream)]">Commercial Use</p>
                                            <p className="text-xs text-[var(--sona-text-muted)] mt-0.5">Use in games, music, films, or any project</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[var(--sona-sage)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs text-[var(--sona-sage)]">✓</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-[var(--sona-cream)]">No Attribution Required</p>
                                            <p className="text-xs text-[var(--sona-text-muted)] mt-0.5">Use anonymously or credit SONA—it's your choice</p>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Section 3: Your Role as Tester */}
                            <Section
                                title="Help Us Improve"
                                description="Your feedback shapes SONA's future"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-xs">
                                        <span className="text-[var(--sona-ember)] font-semibold mt-1">•</span>
                                        <span className="text-[var(--sona-text-muted)]">Report bugs and unexpected behavior</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs">
                                        <span className="text-[var(--sona-ember)] font-semibold mt-1">•</span>
                                        <span className="text-[var(--sona-text-muted)]">Share feature requests and ideas</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs">
                                        <span className="text-[var(--sona-ember)] font-semibold mt-1">•</span>
                                        <span className="text-[var(--sona-text-muted)]">Suggest improvements and workflows</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs">
                                        <span className="text-[var(--sona-ember)] font-semibold mt-1">•</span>
                                        <span className="text-[var(--sona-text-muted)]">Provide general feedback and questions</span>
                                    </div>
                                </div>
                            </Section>

                            {/* Section 4: What's Coming */}
                            <Section
                                title="Looking Ahead"
                                description="Exciting features coming soon"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <FeatureCard title="Audio to Audio" status="coming" />
                                    <FeatureCard title="Finest DAW integration" status="coming" />
                                    <FeatureCard title="Inpaint Generation" status="future" />
                                    <FeatureCard title="More models, more options" status="future" />
                                </div>
                            </Section>

                            {/* Section 5: Billing Info */}
                            <Section
                                title="Token Management"
                                description="Extend your creative possibilities"
                            >
                                <p className="text-sm text-[var(--sona-text-muted)] mb-3">
                                    When you run out of tokens, purchase more at competitive rates through the billing panel
                                </p>
                                <div className="p-3 rounded-lg bg-[var(--sona-elevated)] border border-[var(--sona-border)]">
                                    <p className="text-xs text-[var(--sona-text-muted)]">
                                        Access billing anytime from the main interface to purchase additional tokens and manage your account
                                    </p>
                                </div>
                            </Section>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[var(--sona-border)] bg-[var(--sona-elevated)] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <Checkbox
                                        id="dont-show-announcement"
                                        checked={dontShowAgain}
                                        onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                                    />
                                    <span className="text-xs text-[var(--sona-text-subtle)] group-hover:text-[var(--sona-text-muted)] transition-colors select-none">
                                        Don't show again
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3 px-4 text-sm font-semibold bg-gradient-to-r from-[var(--sona-ember)] to-[var(--sona-gold)] hover:from-[var(--sona-ember)]/90 hover:to-[var(--sona-gold)]/90 text-[var(--sona-cream)] rounded-lg transition-all duration-200 hover:shadow-lg"
                            >
                                Start Creating with SONA
                            </button>

                            <p className="text-center text-[9px] text-[var(--sona-text-subtle)]">
                                <span className="font-medium">SONA</span> v{ANNOUNCEMENT_VERSION} · Closed Beta
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

interface SectionProps {
    title: string
    description: string
    children: React.ReactNode
}

function Section({ title, description, children }: SectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
        >
            <div>
                <h3 className="text-sm font-semibold text-[var(--sona-cream)]">{title}</h3>
                <p className="text-xs text-[var(--sona-text-muted)] mt-1">{description}</p>
            </div>
            {children}
        </motion.div>
    )
}

interface FeatureCardProps {
    title: string
    status: 'coming' | 'future'
}

function FeatureCard({ title, status }: FeatureCardProps) {
    const isComingSoon = status === 'coming'
    return (
        <div className={`p-3 rounded-lg border ${isComingSoon ? 'bg-[var(--sona-gold)]/10 border-[var(--sona-gold)]' : 'bg-[var(--sona-elevated)] border-[var(--sona-border)]'}`}>
            <p className="text-xs font-medium text-[var(--sona-cream)]">{title}</p>
            <p className={`text-[10px] mt-1 ${isComingSoon ? 'text-[var(--sona-gold)]' : 'text-[var(--sona-text-muted)]'}`}>
                {isComingSoon ? 'Coming Soon' : 'Future'}
            </p>
        </div>
    )
}
