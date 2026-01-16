/**
 * Contact Page
 * 
 * Contact information with different purposes and channels.
 * Website Style - Based on feedback page design.
 */

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Code2, ExternalLink, Coffee, Blend } from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { Link, useNavigate } from 'react-router-dom'

// Contact channels
const CONTACT_OPTIONS = [
    {
        id: 'hello',
        title: 'Say Hello',
        description: 'General inquiries, press, or just want to chat about AI and audio',
        email: 'hello@sona.audio',
        icon: MessageSquare,
        color: 'black',
        cta: 'Send a message',
    },
    {
        id: 'developer',
        title: 'Talk to the Developer',
        description: 'Interested in AIWASAMISTAKE.ai? Want to collaborate on AI tools for creators? Speak directly with Jaime Alonso.',
        email: 'jaime.alonso@sona.audio',
        icon: Code2,
        color: 'black',
        cta: 'Contact Jaime',
        badge: 'AIWASAMISTAKE.ai',
    },
    {
        id: 'support',
        title: 'Get Support',
        description: 'Having issues with SONA? Need technical help or have questions about your account?',
        email: 'support@sona.audio',
        icon: Mail,
        color: 'black',
        cta: 'Get help',
        altAction: {
            label: 'Or submit feedback',
            href: '/feedback',
        },
    },
    {
        id: 'donate',
        title: 'Patron the Mission',
        description: 'Want to patron the mission of powering generative AI tools for creators? Your support helps us keep building.',
        icon: Blend,
        color: 'primary',
        cta: 'Invest',
        isExternal: true,
        href: 'https://aiwasamistake.ai/donate',
    },
]

// Social links
// const SOCIAL_LINKS = [
//     { label: 'Twitter / X', href: 'https://x.com/sonaaudio', icon: '𝕏' },
//     { label: 'Discord', href: 'https://discord.gg/sona', icon: '💬' },
//     { label: 'GitHub', href: 'https://github.com/jaimealonsoga', icon: '🐙' },
// ]

export default function ContactPage() {
    const navigate = useNavigate()

    const handleEmailClick = (email: string) => {
        window.location.href = `mailto:${email}`
    }

    const handleExternalLink = (href: string) => {
        window.open(href, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
            {/* Grain overlay */}
            <div className="grain-overlay" />

            <LandingNav />

            {/* Header */}
            <section className="bg-gradient-to-br from-[var(--sona-designer)] to-black relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[var(--sona-producer)]/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-32">
                    <h1 className="font-display text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-4">
                        Let's Talk
                    </h1>

                    <p className="text-landing-subtext-dark text-base md:text-lg mb-6 md:mb-8 px-2">
                        We'd love to hear from you. Choose the best way to reach us.
                    </p>

                    {/* Quick email */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-surface-light backdrop-blur-sm border border-white/20">
                        {/* <Mail className="w-4 h-4" /> */}
                        <span className="text-sm">hello@sona.audio</span>
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <main className="relative z-10 pt-16 sm:pt-32 pb-16 md:pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {CONTACT_OPTIONS.map((option, index) => (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-primary/30 transition-all group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${option.color}20` }}
                                    >
                                        <option.icon className="w-6 h-6" style={{ color: option.color }} />
                                    </div>
                                    {option.badge && (
                                        <span
                                            className="text-xs font-medium px-2 py-1 rounded-full"
                                            style={{ backgroundColor: `${option.color}20`, color: option.color }}
                                        >
                                            {option.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                                <p className="min-h-20 text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-4">
                                    {option.description}
                                </p>

                                {/* Email display */}
                                {option.email && (
                                    <div className="mb-4 p-3 rounded-xl bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/5">
                                        <span className="text-sm font-mono" style={{ color: option.color }}>
                                            {option.email}
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col gap-2 justify-between">
                                    {option.email ? (
                                        <button
                                            onClick={() => handleEmailClick(option.email!)}
                                            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                            style={{
                                                backgroundColor: `${option.color}15`,
                                                color: option.color,
                                            }}
                                        >
                                            {/* <Send className="w-4 h-4" /> */}
                                            {/* {option.cta} */}
                                        </button>
                                    ) : option.isExternal && option.href ? (
                                        <button
                                            onClick={() => handleExternalLink(option.href!)}
                                            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                            style={{
                                                backgroundColor: `${option.color}15`,
                                                color: option.color,
                                            }}
                                        >
                                            {option.cta}
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    ) : null}

                                    {option.altAction && (
                                        <button
                                            onClick={() => navigate(option.altAction!.href)}
                                            className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark hover:text-primary transition-colors"
                                        >
                                            {option.altAction.label} →
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
                            <Coffee className="w-4 h-4" />
                            <span>We are humans behind the machine, your answer will come —some time</span>
                        </div>

                        {/* Social Links */}
                        {/* <div className="flex items-center justify-center gap-4 mt-6">
                            {SOCIAL_LINKS.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => handleExternalLink(link.href)}
                                    className=" w-10 h-10 rounded-full bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                                    title={link.label}
                                >
                                    <span>{link.icon}</span>
                                </button>
                            ))}
                        </div> */}
                    </motion.div>

                    {/* AIWASAMISTAKE.ai Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-16 bg-gradient-to-r from-[var(--sona-producer)]/10 to-primary/10 border border-[var(--sona-producer)]/20 rounded-2xl p-8 text-center"
                    >
                        <h3 className="font-display text-2xl font-bold mb-3">
                            About aiwasamistake.ai
                        </h3>
                        <p className="text-justify text-landing-subtext-light dark:text-landing-subtext-dark max-w-xl mx-auto mb-6">
                            SONA is built by aiwasamistake.ai — an initiative focused on creating accessible AI tools for creators. Our mission is to build on top of next-gen generative AI and unravel the future with ethics.
                        </p>
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-[var(--sona-producer)]/90 transition-colors"
                        >
                            Learn More
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
