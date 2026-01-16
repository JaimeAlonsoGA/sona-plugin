/**
 * Pricing Section
 * 
 * Token-based pricing with three tiers
 */

import { Coins, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for testing the waters',
    price: '5',
    tokens: '400 Generation Tokens',
    features: ['Approx. 500 Sound Effects', 'All features unlocked'],
    popular: false,
  },
  {
    id: 'producer',
    name: 'Producer Pack',
    description: 'Enough for an EP',
    price: '10',
    tokens: '900 Generation Tokens',
    features: ['Approx. 100 Loops', 'All features unlocked'],
    popular: true,
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    description: 'For power users',
    price: '20',
    tokens: '2000 Generation Tokens',
    features: ['Approx. 80 Songs', 'All features unlocked'],
    popular: false,
  },
]

interface PricingProps {
  onBuyTokens?: (tier: string) => void
}

export function Pricing({ onBuyTokens }: PricingProps) {
  return (
    <section className="py-16 md:py-32 relative overflow-hidden" id="pricing">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Header */}
        <span className="text-primary font-bold tracking-wider text-sm uppercase mb-3 md:mb-4 block">
          Fair Pricing
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium mb-4 md:mb-6">Pay as you produce</h2>
        <p className="max-w-xl mx-auto text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base mb-10 md:mb-16 px-2">
          1000 Free tokens for beta-testing. Purchase tokens that never expire and use them across all generation modes.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} onBuy={() => onBuyTokens?.(tier.id)} />
          ))}
        </div>
        <span className='text-sm mt-6 w-full flex items-center justify-center gap-1 font-serif'>Check out the complete pricing <Link className='text-blue-500 decoration-blue-500 hover:underline' to="/pricing">here</Link></span>
      </div>
    </section>
  )
}

interface PricingCardProps {
  tier: typeof PRICING_TIERS[0]
  onBuy?: () => void
}

function PricingCard({ tier, onBuy }: PricingCardProps) {
  return (
    <div
      className={`
        bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl md:rounded-2xl p-6 md:p-8 
        text-left flex flex-col relative
        ${tier.popular
          ? 'border-2 border-primary transform md:-translate-y-4 shadow-xl shadow-primary/10 sm:col-span-2 md:col-span-1'
          : 'border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all'
        }
      `}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
        <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="text-4xl font-mono mb-6">
        <span className='font-bold'>{tier.price}</span>
        <span className="text-sm font-normal text-landing-subtext-light dark:text-landing-subtext-dark">
          $ one-time
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        <li className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span>{tier.tokens}</span>
        </li>
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
            <Check className="w-4 h-4 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onBuy}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${tier.popular
            ? 'bg-primary text-white hover:bg-amber-700 shadow-lg shadow-primary/20'
            : 'border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5'
          }
        `}
      >
        {tier.popular ? 'Buy Tokens' : 'Get Started'}
      </button>
    </div>
  )
}
