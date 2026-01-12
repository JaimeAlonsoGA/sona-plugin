/**
 * Features Section
 * 
 * Showcase Designer/Producer modes and key features
 */

import { motion } from 'framer-motion'
import { 
  AudioLines, 
  Headphones, 
  Tags, 
  Sliders, 
  History, 
  Sparkles,
  Music,
  Clock,
  FileAudio
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Two modes. One powerful workflow.
          </h2>
          <p className="text-[var(--sona-text-muted)] max-w-2xl mx-auto">
            Whether you're designing cinematic soundscapes or producing musical loops, 
            SONA adapts to your creative process.
          </p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* Designer Mode */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 rounded-2xl border overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, var(--sona-designer-soft) 0%, var(--sona-surface) 100%)',
              borderColor: 'var(--sona-designer)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, var(--sona-designer-glow) 0%, transparent 70%)' }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--sona-designer)]/20 flex items-center justify-center">
                  <AudioLines className="w-6 h-6 text-[var(--sona-designer)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--sona-cream)]">Designer Mode</h3>
                  <p className="text-sm text-[var(--sona-text-subtle)]">For sound designers & SFX artists</p>
                </div>
              </div>
              
              <p className="text-[var(--sona-text-muted)] mb-6">
                Generate sound effects, ambiences, foley, and cinematic textures. 
                Control duration in seconds and let AI optimize your prompts.
              </p>
              
              <ul className="space-y-3">
                <FeatureItem icon={<Clock className="w-4 h-4" />} text="Duration: 3s to 60s" color="designer" />
                <FeatureItem icon={<Tags className="w-4 h-4" />} text="UCS naming convention" color="designer" />
                <FeatureItem icon={<FileAudio className="w-4 h-4" />} text="44.1kHz / 16bit WAV" color="designer" />
              </ul>
            </div>
          </motion.div>

          {/* Producer Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 rounded-2xl border overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, var(--sona-producer-soft) 0%, var(--sona-surface) 100%)',
              borderColor: 'var(--sona-producer)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, var(--sona-producer-glow) 0%, transparent 70%)' }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--sona-producer)]/20 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-[var(--sona-producer)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--sona-cream)]">Producer Mode</h3>
                  <p className="text-sm text-[var(--sona-text-subtle)]">For music producers & composers</p>
                </div>
              </div>
              
              <p className="text-[var(--sona-text-muted)] mb-6">
                Create loops, stems, and musical elements synced to your project. 
                Set BPM, time signature, and bars for perfect timing.
              </p>
              
              <ul className="space-y-3">
                <FeatureItem icon={<Music className="w-4 h-4" />} text="BPM & Time signature sync" color="producer" />
                <FeatureItem icon={<Sliders className="w-4 h-4" />} text="Key & scale selection" color="producer" />
                <FeatureItem icon={<Clock className="w-4 h-4" />} text="1-32 bars duration" color="producer" />
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Enhanced Prompts"
            description="AI-optimized prompts for better, more consistent results. Your ideas, perfected."
          />
          <FeatureCard
            icon={<Tags className="w-5 h-5" />}
            title="UCS Naming"
            description="Auto-generate filenames using Universal Category System or custom conventions."
          />
          <FeatureCard
            icon={<History className="w-5 h-5" />}
            title="Generation History"
            description="Access all your past creations. Download, replay, and iterate anytime."
          />
          <FeatureCard
            icon={<Sliders className="w-5 h-5" />}
            title="Quality Control"
            description="Choose between Standard and High Quality generation modes."
          />
          <FeatureCard
            icon={<Music className="w-5 h-5" />}
            title="Musical Key"
            description="Set root note and scale for harmonically coherent generations."
          />
          <FeatureCard
            icon={<FileAudio className="w-5 h-5" />}
            title="Pro Audio Output"
            description="44.1kHz / 16bit WAV files ready for professional workflows."
          />
        </motion.div>
      </div>
    </section>
  )
}

function FeatureItem({ 
  icon, 
  text, 
  color 
}: { 
  icon: React.ReactNode
  text: string
  color: 'designer' | 'producer' 
}) {
  const colorClass = color === 'designer' ? 'text-[var(--sona-designer)]' : 'text-[var(--sona-producer)]'
  
  return (
    <li className="flex items-center gap-3">
      <span className={colorClass}>{icon}</span>
      <span className="text-sm text-[var(--sona-text-muted)]">{text}</span>
    </li>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-xl bg-[var(--sona-surface)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)] transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--sona-ember-glow)] flex items-center justify-center mb-4">
        <span className="text-[var(--sona-ember)]">{icon}</span>
      </div>
      <h4 className="text-[var(--sona-cream)] font-medium mb-2">{title}</h4>
      <p className="text-sm text-[var(--sona-text-muted)]">{description}</p>
    </motion.div>
  )
}
