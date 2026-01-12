/**
 * Pricing Section
 * 
 * Token-based pricing with subscription options
 */

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

interface PricingProps {
  onRequestAccess: () => void
}

const TOKEN_PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 1000,
    price: 9,
    popular: false,
    features: [
      '~100 standard generations',
      '~50 high-quality generations',
      'All features included',
      'No expiration',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    tokens: 3000,
    price: 24,
    popular: true,
    bonus: '+500 bonus',
    features: [
      '~300 standard generations',
      '~150 high-quality generations',
      'All features included',
      'No expiration',
      'Priority processing',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    tokens: 10000,
    price: 69,
    popular: false,
    bonus: '+2000 bonus',
    features: [
      '~1000 standard generations',
      '~500 high-quality generations',
      'All features included',
      'No expiration',
      'Priority processing',
      'Early access to new features',
    ],
  },
]

export function Pricing({ onRequestAccess }: PricingProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Simple, token-based pricing
          </h2>
          <p className="text-[var(--sona-text-muted)] max-w-2xl mx-auto">
            Pay only for what you use. No monthly subscriptions required.
            Buy tokens when you need them, use them whenever you want.
          </p>
        </motion.div>

        {/* Beta banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 p-6 rounded-xl text-center"
          style={{
            background: 'linear-gradient(135deg, var(--sona-gold-glow) 0%, var(--sona-ember-soft) 100%)',
            border: '1px solid var(--sona-gold)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[var(--sona-gold)]" />
            <span className="text-lg font-medium text-[var(--sona-gold)]">Beta Offer</span>
          </div>
          <p className="text-[var(--sona-cream)]">
            Join the beta now and get <strong>500 free tokens</strong> to start creating!
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TOKEN_PACKS.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl ${
                pack.popular 
                  ? 'border-2 border-[var(--sona-ember)]' 
                  : 'border border-[var(--sona-border)]'
              }`}
              style={{ background: 'var(--sona-surface)' }}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--sona-ember)] text-[var(--sona-void)]">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-[var(--sona-cream)] mb-2">
                  {pack.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[var(--sona-cream)]">${pack.price}</span>
                </div>
                <p className="text-sm text-[var(--sona-text-muted)] mt-2">
                  {pack.tokens.toLocaleString()} tokens
                  {pack.bonus && (
                    <span className="text-[var(--sona-sage)] ml-1">{pack.bonus}</span>
                  )}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--sona-sage)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--sona-text-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onRequestAccess}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  pack.popular
                    ? 'text-[var(--sona-void)]'
                    : 'text-[var(--sona-text)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)]'
                }`}
                style={pack.popular ? {
                  background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                } : undefined}
              >
                {pack.popular ? 'Get Started' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Token cost breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[var(--sona-text-subtle)] mb-4">
            Token cost per generation
          </p>
          <div className="inline-flex items-center gap-6 p-4 rounded-xl bg-[var(--sona-surface)] border border-[var(--sona-border)]">
            <div className="text-center px-4">
              <p className="text-lg font-semibold text-[var(--sona-cream)]">~10</p>
              <p className="text-xs text-[var(--sona-text-subtle)]">Standard Quality</p>
            </div>
            <div className="w-px h-8 bg-[var(--sona-border)]" />
            <div className="text-center px-4">
              <p className="text-lg font-semibold text-[var(--sona-gold)]">~20</p>
              <p className="text-xs text-[var(--sona-text-subtle)]">High Quality</p>
            </div>
            <div className="w-px h-8 bg-[var(--sona-border)]" />
            <div className="text-center px-4">
              <p className="text-xs text-[var(--sona-text-muted)]">+ duration factor</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
