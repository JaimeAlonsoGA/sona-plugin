/**
 * Product Introduction Section
 * 
 * "SONA isn't just a synthesizer" statement with feature badges
 */

import { Headphones, GripVertical, FileHeadphone, Pickaxe } from 'lucide-react'

const FEATURE_BADGES = [
  {
    icon: Headphones,
    label: 'VST3 / AU',
    color: 'text-black'
  },
  {
    icon: Pickaxe,
    label: 'Generate and Regenerate',
    color: 'text-black',
  },
  {
    icon: FileHeadphone,
    label: 'Cloud Sync',
    color: 'text-black',
  },
  {
    icon: GripVertical,
    label: 'Drag & Drop',
    color: 'text-black',
  },
]

export function ProductIntro() {
  return (
    <section className="py-16 md:py-24 bg-landing-surface-light dark:bg-landing-surface-dark relative" id="product">
      <div className="flex flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 items-center">
        <h2 className="text-center font-display text-2xl sm:text-3xl md:text-5xl font-normal leading-tight mb-8 md:mb-12 text-landing-text-light dark:text-landing-text-dark">
          Congratulations, you just found
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          your new profesional AI generative audio plugin {' '}
          <span className="text-landing-subtext-light dark:text-landing-subtext-dark opacity-60">
            . Evolve your audio workflow into the AI era.
          </span>
        </h2>

        <div className="flex flex-wrap gap-2 sm:gap-4 mx-auto justify-center">
          {FEATURE_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/5 shadow-lg shadow-[var(--sona-creator)]"
            >
              <badge.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${badge.color}`} />
              <span className="text-xs sm:text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
