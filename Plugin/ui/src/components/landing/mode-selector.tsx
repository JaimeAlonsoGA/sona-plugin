/**
 * Mode Selector Section
 * 
 * Designer, Producer, and Creator mode cards with hover effects
 */

import { Headphones, Disc, Music, AudioLines } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ModeConfig {
  id: string
  badge: string
  title: string
  description: string
  icon: LucideIcon
}

const MODES: ModeConfig[] = [
  {
    id: 'designer',
    badge: 'DESIGNER MODE',
    title: 'SFX & Foley',
    description: 'Perfect for game audio and film. Generate impacts, textures, and atmospheric noise with precise control over duration and timbre.',
    icon: AudioLines,
  },
  {
    id: 'producer',
    badge: 'PRODUCER MODE',
    title: 'One-shots & Loops',
    description: 'BPM-locked loops and one-shots ready to drag into your project. Drums, basslines, and melodies that instantly fit your groove.',
    icon: Headphones,
  },
  {
    id: 'creator',
    badge: 'CREATOR MODE',
    title: 'Compositions',
    description: 'Generate full musical ideas and stems. Great for starting points, backing tracks, or exploring new genres.',
    icon: Disc,
  },
]

export function ModeSelector() {
  return (
    <section className="py-16 md:py-24 bg-landing-surface-light dark:bg-landing-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-medium mb-3 md:mb-4">Three modes, one plugin</h2>
          <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-base md:text-lg">
            Optimized engines for all audio biomas: Motion Picture, Game Audio, Sound Design, Music Production, Content Creation.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <DesignerCard mode={MODES[0]} />
          <ProducerCard mode={MODES[1]} />
          <CreatorCard mode={MODES[2]} />
        </div>
      </div>
    </section>
  )
}

function DesignerCard({ mode }: { mode: ModeConfig }) {
  const Icon = mode.icon
  
  return (
    <div className="group bg-landing-bg-light dark:bg-landing-bg-dark rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 hover:border-[var(--sona-designer)]/50 transition-all relative overflow-hidden h-72 sm:h-80 md:h-96 flex flex-col justify-between">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-6 md:p-8 opacity-20 group-hover:opacity-100 transition-opacity">
        <Icon className="w-12 h-12 md:w-16 md:h-16 text-[var(--sona-designer)]" />
      </div>

      {/* Content */}
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--sona-designer)]/10 text-[var(--sona-designer)] text-xs font-bold mb-3 md:mb-4">
          {mode.badge}
        </span>
        <h3 className="font-display text-xl md:text-2xl font-bold mb-2">{mode.title}</h3>
        <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-xs sm:text-sm leading-relaxed">
          {mode.description}
        </p>
      </div>

      {/* Visual Element */}
      <div className="w-full h-20 md:h-24 bg-sona-designer/5 rounded-xl relative overflow-hidden flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-sona-designer/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
        <span className="text-sona-designer font-mono text-xs z-10 mx-auto text-center w-full">FINAL_BOSS_SFX</span>
      </div>
    </div>
  )
}

function ProducerCard({ mode }: { mode: ModeConfig }) {
  const Icon = mode.icon
  
  return (
    <div className="group bg-landing-bg-light dark:bg-landing-bg-dark rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 hover:border-sona-producer/50 transition-all relative overflow-hidden h-72 sm:h-80 md:h-96 flex flex-col justify-between">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-6 md:p-8 opacity-20 group-hover:opacity-100 transition-opacity">
        <Icon className="w-12 h-12 md:w-16 md:h-16 text-[var(--sona-producer)]" />
      </div>

      {/* Content */}
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--sona-producer)]/10 text-[var(--sona-producer)] text-xs font-bold mb-3 md:mb-4">
          {mode.badge}
        </span>
        <h3 className="font-display text-xl md:text-2xl font-bold mb-2">{mode.title}</h3>
        <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-xs sm:text-sm leading-relaxed">
          {mode.description}
        </p>
      </div>

      {/* Visual Element - Equalizer Bars */}
      <div className="w-full h-20 md:h-24 bg-sona-producer/5 rounded-xl relative overflow-hidden flex items-center justify-center">
        <div className="flex items-end gap-1 h-12 w-full justify-center px-4">
          <div className="w-1 bg-sona-producer h-3 group-hover:h-8 transition-all duration-300 rounded-full" />
          <div className="w-1 bg-sona-producer h-5 group-hover:h-4 transition-all duration-300 delay-75 rounded-full" />
          <div className="w-1 bg-sona-producer h-8 group-hover:h-6 transition-all duration-300 delay-100 rounded-full" />
          <div className="w-1 bg-sona-producer h-4 group-hover:h-9 transition-all duration-300 delay-150 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ mode }: { mode: ModeConfig }) {
  const Icon = mode.icon
  
  return (
    <div className="group bg-landing-bg-light dark:bg-landing-bg-dark rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 hover:border-sona-creator/50 transition-all relative overflow-hidden h-72 sm:h-80 md:h-96 flex flex-col justify-between sm:col-span-2 md:col-span-1">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-6 md:p-8 opacity-20 group-hover:opacity-100 transition-opacity">
        <Icon className="w-12 h-12 md:w-16 md:h-16 text-[var(--sona-creator)]" />
      </div>

      {/* Content */}
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--sona-creator)]/10 text-[var(--sona-creator)] text-xs font-bold mb-3 md:mb-4">
          {mode.badge}
        </span>
        <h3 className="font-display text-xl md:text-2xl font-bold mb-2">{mode.title}</h3>
        <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-xs sm:text-sm leading-relaxed">
          {mode.description}
        </p>
      </div>

      {/* Visual Element */}
      <div className="w-full h-20 md:h-24 bg-sona-creator/5 rounded-xl relative overflow-hidden flex items-center justify-center">
        <Music className="text-sona-creator w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  )
}
