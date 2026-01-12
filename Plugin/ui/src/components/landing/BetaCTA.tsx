/**
 * Beta CTA Section
 * 
 * Closed beta request access with benefits
 */

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Zap, 
  HeadphonesIcon, 
  Gift,
  ArrowRight,
  Check
} from 'lucide-react'

interface BetaCTAProps {
  onRequestAccess: () => void
}

const BETA_BENEFITS = [
  {
    icon: <Gift className="w-5 h-5" />,
    title: '500 Free Tokens',
    description: 'Start creating immediately with generous free credits',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Early Access',
    description: 'Be among the first to experience AI audio generation',
  },
  {
    icon: <HeadphonesIcon className="w-5 h-5" />,
    title: 'Priority Support',
    description: 'Direct access to our team for feedback and assistance',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'All Features Unlocked',
    description: 'Access every current and upcoming feature during beta',
  },
]

export function BetaCTA({ onRequestAccess }: BetaCTAProps) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] rounded-full blur-[150px] opacity-20"
          style={{ background: 'linear-gradient(180deg, var(--sona-ember) 0%, var(--sona-producer) 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sona-ember-soft)] border border-[var(--sona-ember)]/30 text-[var(--sona-ember)] text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sona-ember)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--sona-ember)]"></span>
            </span>
            Closed Beta
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Join the beta program
          </h2>
          <p className="text-lg text-[var(--sona-text-muted)] max-w-xl mx-auto">
            Limited spots available. Get exclusive access to SONA before public release
            and help shape the future of AI audio generation.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-4 mb-12"
        >
          {BETA_BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex items-start gap-4 p-5 rounded-xl bg-[var(--sona-surface)] border border-[var(--sona-border)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--sona-gold-glow)] flex items-center justify-center shrink-0">
                <span className="text-[var(--sona-gold)]">{benefit.icon}</span>
              </div>
              <div>
                <h4 className="text-[var(--sona-cream)] font-medium mb-1">{benefit.title}</h4>
                <p className="text-sm text-[var(--sona-text-muted)]">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative p-8 md:p-12 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--sona-surface) 0%, var(--sona-elevated) 100%)',
            border: '1px solid var(--sona-border)',
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sona-ember-glow)] rounded-full blur-[100px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--sona-designer-glow)] rounded-full blur-[80px] opacity-20" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-display font-medium text-[var(--sona-cream)] mb-4">
              Ready to create with AI?
            </h3>
            <p className="text-[var(--sona-text-muted)] mb-8 max-w-md mx-auto">
              Request access now and start generating professional audio in minutes.
              No credit card required for beta testers.
            </p>
            
            <button
              onClick={onRequestAccess}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-[var(--sona-void)] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                boxShadow: '0 4px 20px var(--sona-ember-glow), 0 0 60px var(--sona-ember-glow)',
              }}
            >
              Request Beta Access
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[var(--sona-text-subtle)]">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--sona-sage)]" />
                Free to join
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--sona-sage)]" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--sona-sage)]" />
                No spam
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
