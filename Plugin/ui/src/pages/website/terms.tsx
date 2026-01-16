/**
 * Terms of Service Page
 */

import { motion } from 'framer-motion'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function TermsPage() {
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
                        Terms of Service
                    </h1>

                    <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-lg mb-4">
                        The rules and regulations for using SONA.
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
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Acceptance of Terms</h2>
                        <p>
                            By accessing and using SONA, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">User Rights & Ownership</h2>
                        <p>
                            As a user of SONA, you retain full ownership of the audio content you generate ("Generations"). We claim no ownership rights over your Generations. You are free to use your Generations for commercial and non-commercial purposes, subject to applicable laws.
                        </p>
                        <p className="mt-4">
                            Exceptions to this occur only if you explicitly choose to donate your Generations to us or the public domain.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Usage License</h2>
                        <p>
                            You grant us a limited, non-exclusive, worldwide license to use your data (including Generations and prompts) internally for the sole purpose of operating, developing, and improving the SONA application and its underlying AI models. This data is not sold to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Analytics</h2>
                        <p>
                            We collect anonymous usage data and analytics to help us improve the application. This data is used solely for internal analysis and product development.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Disclaimer</h2>
                        <p>
                            The materials on SONA's website and application are provided on an 'as is' basis. Makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-landing-text-light dark:text-landing-text-dark">Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:hello@sona.audio" className="text-primary hover:underline">hello@sona.audio</a>.
                        </p>
                    </section>
                </motion.div>
            </main>

            <LandingFooter />
        </div>
    )
}
