/**
 * Changelog Page
 * 
 * Version history and release notes - Website Style
 * Following Keep a Changelog (https://keepachangelog.com/) standards
 * 
 * Note: Nav, Footer, and BetaModal are provided by WebsiteLayout
 */

import { motion } from 'framer-motion'
import { Clock, Plus, Wrench, Bug, Trash2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type ChangeType = 'added' | 'changed' | 'fixed' | 'removed' | 'improved'

interface Change {
    type: ChangeType
    text: string
}

interface Release {
    version: string
    date: string
    title?: string
    changes: Change[]
}

const CHANGE_CONFIG: Record<ChangeType, { icon: typeof Plus; label: string; color: string }> = {
    added: { icon: Plus, label: 'Added', color: 'green-500' },
    changed: { icon: Wrench, label: 'Changed', color: '[var(--sona-creator)]' },
    fixed: { icon: Bug, label: 'Fixed', color: '[var(--sona-designer)]' },
    removed: { icon: Trash2, label: 'Removed', color: '#ef4444' },
    improved: { icon: Sparkles, label: 'Improved', color: 'var(--sona-producer)' },
}

// Changelog entries - newest first
const RELEASES: Release[] = [
    {
        version: '0.3.0',
        date: '2026-01-15',
        title: 'Prompting Guide & Website Updates',
        changes: [
            { type: 'added', text: 'Comprehensive prompting guide based on the models documentation' },
            { type: 'added', text: 'Mode-specific tips with tabbed interface (Designer, Producer, Creator)' },
            { type: 'added', text: 'Changelog page following Keep a Changelog standards' },
            { type: 'improved', text: 'Quick tips in plugin now based on official AI model documentation' },
            { type: 'changed', text: 'Website pages now use consistent hero section design' },
            { type: 'fixed', text: 'Feedback form authentication flow' },
        ],
    },
    {
        version: '0.2.0',
        date: '2026-01-10',
        title: 'Closed Beta Launch',
        changes: [
            { type: 'added', text: 'Closed beta system with email verification' },
            { type: 'added', text: 'Feedback collection system for beta testers' },
            { type: 'added', text: 'Download page with platform-specific installers' },
            { type: 'added', text: 'Email confirmation flow with Resend integration' },
            { type: 'improved', text: 'Landing page design and animations' },
            { type: 'changed', text: 'Routing structure for website pages' },
        ],
    },
    {
        version: '0.1.0',
        date: '2026-12-06',
        title: 'Initial Alpha Release',
        changes: [
            { type: 'added', text: 'Designer Mode for sound effects and foley' },
            { type: 'added', text: 'Producer Mode for loops and samples' },
            { type: 'added', text: 'Creator Mode for full compositions' },
            { type: 'added', text: 'GPT-powered prompt enhancement engine' },
            { type: 'added', text: 'UCS-compliant file naming system' },
            { type: 'added', text: 'VST3 and Standalone plugin formats' },
            { type: 'added', text: 'Audio player with waveform visualization' },
            { type: 'added', text: 'Generation history management' },
        ],
    },
    {
        version: '0.0.1',
        date: '2025-12-23',
        title: 'Private Alpha Release',
        changes: [
            { type: 'added', text: 'Initial private alpha release to select testers' },
            { type: 'added', text: 'Basic Designer Mode functionality' },
            { type: 'added', text: 'Core audio generation features' },
            { type: 'added', text: 'Basic UI and UX flows' },
        ],
    },
]

function ChangeItem({ change }: { change: Change }) {
    const config = CHANGE_CONFIG[change.type]
    const Icon = config.icon

    return (
        <li className="flex items-start gap-2 sm:gap-3 py-1.5 sm:py-2">
            <span
                className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium shrink-0 mt-0.5"
                style={{
                    // backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                    // color: config.color,
                }}
            >
                <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{config.label}</span>
            </span>
            <span className="text-sm sm:text-base text-landing-text-light/80 dark:text-landing-text-dark/80">
                {change.text}
            </span>
        </li>
    )
}

function ReleaseCard({ release, index }: { release: Release; index: number }) {
    const isLatest = index === 0

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="relative"
        >
            {/* Timeline connector */}
            {index < RELEASES.length - 1 && (
                <div className="absolute left-[11px] top-14 bottom-0 w-px bg-landing-text-light/10 dark:bg-landing-text-dark/10" />
            )}

            <div className="flex gap-3 sm:gap-6 items-start">
                {/* Timeline dot */}
                <div className="relative shrink-0">
                    <div
                        className={`rounded-full flex items-center justify-center 
                            ${'bg-landing-text-light dark:bg-landing-text-dark'}`}
                    >
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-landing-text-dark p-1 sm:p-1.5" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8 sm:pb-12">
                    <header className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <h2 className="text-xl sm:text-2xl font-bold">v{release.version}</h2>
                            {isLatest && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-landing-surface-dark text-white">
                                    Latest
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-landing-text-light/60 dark:text-landing-text-dark/60">
                            <time dateTime={release.date}>
                                {new Date(release.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                            {release.title && (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="w-full sm:w-auto">{release.title}</span>
                                </>
                            )}
                        </div>
                    </header>

                    <ul className="space-y-1">
                        {release.changes.map((change, i) => (
                            <ChangeItem key={i} change={change} />
                        ))}
                    </ul>
                </div>
            </div>
        </motion.article>
    )
}

export default function ChangelogPage() {
    return (
        <>
            {/* Hero Section */}

            <section className="bg-gradient-to-br from-[var(--sona-designer)] via-[var(--sona-creator)] to-[var(--sona-producer)] relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-32">
                    <h1 className="font-display text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-4">
                        The Bitacora
                    </h1>

                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-base md:text-lg mb-4 px-2">
                        The changelog of SONA - A hint on what's behind the plugin.
                    </p>

                    <div className="mt-6 mb-16 sm:mb-32 flex flex-col ">
                        <Link to="/community" className="text-blue-500  hover:underline decoration-blue-500">Vote Upcoming Features ↗</Link>
                    </div>
                </div>
            </section >

            {/* Changelog Content */}
            < main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16" >
                <div className="space-y-0">
                    {RELEASES.map((release, index) => (
                        <ReleaseCard key={release.version} release={release} index={index} />
                    ))}
                </div>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 pt-8 border-t border-landing-text-light/10 dark:border-landing-text-dark/10 text-center text-sm text-landing-text-light/50 dark:text-landing-text-dark/50"
                >
                    <p>
                        This changelog follows{' '}
                        <Link
                            to="https://keepachangelog.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 decoration-blue-500 hover:underline"
                        >
                            Keep a Changelog
                        </Link>{' '}
                        and{' '}
                        <Link
                            to="https://semver.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 decoration-blue-500 hover:underline"
                        >
                            Semantic Versioning
                        </Link>
                        .
                    </p>
                </motion.div>
            </main >
        </>
    )
}
