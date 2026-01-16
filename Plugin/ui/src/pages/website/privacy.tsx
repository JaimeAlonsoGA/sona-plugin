/**
 * Privacy Policy Page
 */

import { motion } from 'framer-motion'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function PrivacyPage() {
    return (
        <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
            {/* Grain overlay */}
            <div className="grain-overlay" />

            <LandingNav />

            <section className="bg-gradient-to-br from-[var(--sona-designer)] to-black relative pt-32 lg:pt-40 overflow-hidden pb-16">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-display text-4xl md:text-7xl font-bold mb-4">
                        Privacy Policy
                    </h1>

                    <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-lg mb-4">
                        How we handle your data and protect your privacy.
                    </p>
                </div>
            </section>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose dark:prose-invert max-w-none text-justify space-y-8 text-lg text-landing-text-light/80 dark:text-landing-text-dark/80 leading-relaxed"
                >
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Introduction</h2>
                        <p>
                            At SONA, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our AI audio generation tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Data Usage</h2>
                        <p>
                            Your data, including audio generations and text prompts, is used internally within the application to provide and improve the service. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Ownership of Generations</h2>
                        <p>
                            Your generations are exclusively yours. You retain full ownership and intellectual property rights over any audio content you generate using SONA, unless you explicitly choose to donate them to the public domain or to us for research purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Data Retention & Analytics</h2>
                        <p>
                            The application only stores data for the purpose of creating analytics to improve the application's performance and user experience. We analyze usage patterns to understand how our tools are being used and to identify areas for enhancement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@sona.audio" className="text-primary hover:underline">hello@sona.audio</a>.
                        </p>
                    </section>
                </motion.div>
            </main>

            <LandingFooter />
        </div>
    )
}
