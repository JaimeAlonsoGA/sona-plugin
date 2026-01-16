/**
 * Pricing Page
 * 
 * Token-based pricing model with competitive SaaS features - Website Style
 * Pay-as-you-go with no subscriptions
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Infinity as InfinityIcon, Sparkles, AudioLines, Headphones, Disc } from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { Link, useNavigate } from 'react-router-dom'
import { useBeta } from '@/hooks/use-beta'
import { BetaModal } from '@/components/landing/beta-modal'

// Token pricing tiers - synced with TOKEN_PACKAGES in lib/api/tokens.ts
const PRICING_TIERS = [
    {
        id: 'tokens_200',
        name: 'Starter',
        description: 'Perfect for trying out Sona',
        price: 2,
        tokens: 150,
        tokenLabel: 'Generation Tokens',
        estimate: '~60 Sound Effects',
        icon: Sparkles,
        color: 'var(--sona-designer)',
        features: [
            'All generation modes',
            'Prompt enhancer',
            'Built in and custom naming conventions',
            'Limited cloud storage',
        ],
        popular: false,
    },
    {
        id: 'tokens_500',
        name: 'Creator',
        description: 'For amazing sound creation',
        price: 5,
        tokens: 400,
        tokenLabel: 'Generation Tokens',
        estimate: '~200 Sound Effects',
        icon: AudioLines,
        color: 'var(--sona-producer)',
        features: [
            'All generation modes',
            'Prompt enhancer',
            'Built in and custom naming conventions',
            'Limited cloud storage',
        ],
        popular: true,
    },
    {
        id: 'tokens_1000',
        name: 'Producer',
        description: 'Best value for power users',
        price: 10,
        tokens: 900,
        tokenLabel: 'Generation Tokens',
        estimate: '~100 Loops',
        icon: Headphones,
        color: 'var(--sona-creator)',
        features: [
            'All generation modes',
            'Prompt enhancer',
            'Built in and custom naming conventions',
            'Limited cloud storage',
        ],
        popular: false,
    },
    {
        id: 'tokens_2000',
        name: 'Studio',
        description: 'Enterprise package for studios',
        price: 20,
        tokens: 2000,
        tokenLabel: 'Generation Tokens',
        estimate: '~80 Songs',
        icon: Disc,
        color: 'var(--sona-gold)',
        features: [
            'All generation modes',
            'Prompt enhancer',
            'Built in and custom naming conventions',
            'Limited cloud storage',
            'Best value per token'
        ],
        popular: false,
    },
]

// Key benefits of the pricing model
const PRICING_BENEFITS = [
    {
        icon: InfinityIcon,
        title: 'Tokens Never Expire',
        description: 'Use your tokens whenever you need them. No monthly limits, no pressure.',
    },
    {
        icon: Shield,
        title: 'Recharge Safely',
        description: 'SONA is committed to secure and reliable token recharging.',
    },
    {
        icon: Zap,
        title: 'Instant Access',
        description: 'Tokens are available immediately after purchase. Start creating right away.',
    },
    {
        icon: Sparkles,
        title: 'All Features Included',
        description: 'Every token pack unlocks all generation modes and features.',
    },
]

// Token usage breakdown
const TOKEN_USAGE = [
    { mode: 'Designer', cost: '~10 tokens', output: 'Sound Effect', color: 'var(--sona-designer)' },
    { mode: 'Producer', cost: '~15 tokens', output: 'Loop / Sample', color: 'var(--sona-producer)' },
    { mode: 'Creator', cost: '~20 tokens', output: 'Full Composition', color: 'var(--sona-creator)' },
]

// FAQ items
const FAQ_ITEMS = [
    {
        question: 'Do tokens expire?',
        answer: 'No! Your tokens never expire. Use them at your own pace, whether that\'s all at once or spread over months.',
    },
    {
        question: 'Can I use tokens across all modes?',
        answer: 'Yes, tokens work across Designer, Producer, and Creator modes. Different modes consume different amounts based on generation complexity.',
    },
    {
        question: 'What happens to my free beta tokens?',
        answer: 'Beta testers receive 1000 free tokens. These work exactly like purchased tokens and never expire.',
    },
    {
        question: 'Is there a subscription option?',
        answer: 'It will be in the full release, but during the beta we are only offering token-based pricing to keep things simple.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, and PayPal through our secure payment processor.',
    },
    {
        question: 'Can I get a refund?',
        answer: 'No, all token purchases are final. Please contact support if you have any issues with your order.',
    },
]

export default function PricingPage() {
    const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
    const navigate = useNavigate()
    const { hasBetaAccess } = useBeta()

    const handleCTA = () => {
        if (hasBetaAccess) {
            navigate('/download')
        } else {
            setIsBetaModalOpen(true)
        }
    }

    return (
        <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
            <LandingNav />

            {/* Hero Section */}
            <section className="bg-gradient-to-br to-landing-bg-dark/80 from-primary/80 mb-8 md:mb-16 relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* <div className="inline-block mb-4">
                                 <div className="h-px w-12 bg-primary mx-auto mb-6" />
                             </div> */}

                    <h2 className="flex flex-row items-end justify-center gap-2 mx-auto w-full font-display text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-4">
                        Pricing <span className="bg-gradient-to-r from-primary to-sona-gold bg-clip-text text-transparent">Plans</span>
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 flex items-center justify-center"
                        >
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                {/* Outer ring */}
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="22"
                                    stroke="var(--sona-gold)"
                                    strokeWidth="2"
                                    strokeOpacity="0.3"
                                    strokeDasharray="4 4"
                                />
                                {/* Inner ring */}
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="16"
                                    stroke="var(--sona-gold)"
                                    strokeWidth="2"
                                />
                                {/* Center symbol */}
                                <path
                                    d="M24 14v20M18 20l6-6 6 6M18 28l6 6 6-6"
                                    stroke="var(--sona-gold)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>
                    </h2>

                    <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-base md:text-lg mb-16 sm:mb-32 px-2">
                        Beta exclusive token-based pricing. Pay-as-you-go with a simple recharging system.
                    </p>

                    {/* Changelog */}
                    {/* <div className="mt-6 mb-32 flex flex-col ">
                        <Link to="/changelog" className="text-blue-500  hover:underline decoration-blue-500">View Changelog ↗</Link>
                    </div> */}
                </div>
            </section>

            {/* Beta Banner */}
            <section className="pb-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gradient-to-tr from-[var(--sona-designer)] via-[var(--sona-producer)] to-[var(--sona-creator)] rounded-2xl p-6 text-center"
                    >
                        {/* <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="font-bold text-primary">Beta Bonus</span>
                        </div> */}
                        {hasBetaAccess ?
                            <p className="text-lg">
                                You have claimed <span className="font-bold text-primary">1000 tokens</span> for becoming a SONA tester during the beta period. <Link to="/download" className="text-blue-500 hover:underline">Download the plugin</Link> and start generating!
                            </p>
                            :
                            <p className="text-lg">
                                Claim your <span className="font-bold text-[var(--sona-creator)]">1000 free tokens</span> for testing SONA during the beta period!
                            </p>
                        }
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-8 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {PRICING_TIERS.map((tier, index) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className={`
                  relative rounded-xl md:rounded-2xl p-6 md:p-8 flex flex-col
                  bg-landing-surface-light dark:bg-landing-surface-dark
                  ${tier.popular
                                        ? 'border-2 border-primary lg:-translate-y-4 shadow-xl shadow-primary/10'
                                        : 'border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-all'
                                    }
                `}
                            >
                                {/* Popular Badge */}
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${tier.color}20` }}
                                >
                                    <tier.icon className="w-6 h-6" />
                                </div>

                                {/* Header */}
                                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                                <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-6">
                                    {tier.description}
                                </p>

                                {/* Price */}
                                <div className="mb-2">
                                    <span className="text-5xl font-bold">${tier.price}</span>
                                    <span className="text-landing-subtext-light dark:text-landing-subtext-dark ml-2">
                                        one-time
                                    </span>
                                </div>

                                {/* Tokens */}
                                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                                    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                                        {/* Outer ring */}
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="22"
                                            stroke="var(--sona-gold)"
                                            strokeWidth="2"
                                            strokeOpacity="0.3"
                                            strokeDasharray="4 4"
                                        />
                                        {/* Inner ring */}
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="16"
                                            stroke="var(--sona-gold)"
                                            strokeWidth="2"
                                        />
                                        {/* Center symbol */}
                                        <path
                                            d="M24 14v20M18 20l6-6 6 6M18 28l6 6 6-6"
                                            stroke="var(--sona-gold)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="font-medium">{tier.tokens.toLocaleString()} {tier.tokenLabel}</span>
                                </div>

                                {/* Estimate */}
                                <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-4">
                                    Approximately: <span className="font-medium text-landing-text-light dark:text-landing-text-dark">{tier.estimate}</span>
                                </p>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={handleCTA}
                                    className={`
                    w-full py-3 rounded-xl font-medium transition-all
                    ${tier.popular
                                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                                            : 'border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }
                  `}
                                >
                                    Get {tier.name}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Token Usage Breakdown */}
            <section className="py-12 md:py-16 bg-landing-surface-light/50 dark:bg-landing-surface-dark/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4">Token Usage by Mode</h2>
                        <p className="text-sm md:text-base text-landing-subtext-light dark:text-landing-subtext-dark">
                            Different generation modes consume different amounts of tokens based on complexity
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {TOKEN_USAGE.map((item, index) => (
                            <motion.div
                                key={item.mode}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10"
                            >
                                <div
                                    className="text-sm font-medium px-3 py-1 rounded-full inline-block mb-4"
                                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                                >
                                    {item.mode} Mode
                                </div>
                                {/* <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-2">
                                    Powered by {item.model}
                                </p> */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-semibold">{item.cost}</span>
                                    {/* <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">per {item.output}</span> */}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 rounded-2xl p-8 text-center border border-[var(--sona-producer)]/20"
                    >
                        <h2 className="font-display text-2xl font-bold mb-3">Why SONA is not Free?</h2>
                        <p className="text-justify text-landing-subtext-light dark:text-landing-subtext-dark">
                            While we want to maintain the monthly free tokens give-away, the plugin usage incurs significant costs. next-gen AI generation uses resources on each request.
                            To ensure sustainability and continued developement, we are adopting a token-based pricing model for the beta and a subscription-based model for the full release.
                        </p>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PRICING_BENEFITS.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 p-6 rounded-xl bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <benefit.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 md:py-16 bg-landing-surface-light/50 dark:bg-landing-surface-dark/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <h2 className="font-display text-2xl md:text-3xl font-medium mb-4">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="space-y-3 md:space-y-4">
                        {FAQ_ITEMS.map((item, index) => (
                            <motion.div
                                key={item.question}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-6 border border-gray-200 dark:border-white/10"
                            >
                                <h3 className="font-bold mb-2">{item.question}</h3>
                                <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                    {item.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display text-3xl md:text-4xl font-medium mb-6">
                            Ready to start creating?
                        </h2>
                        <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8 max-w-xl mx-auto">
                            Join the beta and get 1000 free tokens to explore all of Sona's AI-powered audio generation capabilities.
                        </p>
                        <button
                            onClick={handleCTA}
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            {/* <Sparkles className="w-5 h-5" /> */}
                            Join the Beta
                        </button>
                    </motion.div>
                </div>
            </section>

            <LandingFooter />

            {/* Beta Modal */}
            <BetaModal
                isOpen={isBetaModalOpen}
                onClose={() => setIsBetaModalOpen(false)}
            />
        </div>
    )
}
