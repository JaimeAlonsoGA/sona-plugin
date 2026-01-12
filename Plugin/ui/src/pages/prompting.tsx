/**
 * Prompting Guide Page
 * 
 * Tips and best practices for writing effective prompts
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Lightbulb, AudioLines, Headphones, Sparkles } from 'lucide-react'
import { IconButton } from '../components/shared'
import { SonaLogo } from '../components/shared/sona-logo'

const DESIGNER_TIPS = [
  {
    title: 'Structure Matters',
    example: '"Core Sound, Details, Mood, Technical Specs"',
    description: 'Order your prompt logically for the best results.',
  },
  {
    title: 'Be specific about texture',
    example: '"Metallic impact with grainy distortion and short decay"',
    description: 'Describe the character and quality of the sound.',
  },
  {
    title: 'Include environment context',
    example: '"Forest ambience with distant birds, close rustling leaves"',
    description: 'Specify spatial relationships and depth.',
  },
  {
    title: 'Describe the emotional quality',
    example: '"Tense, unsettling drone with subtle pulsing"',
    description: 'Mood phrases like "mysterious" or "heroic" guide the generation.',
  },
]

const PRODUCER_TIPS = [
  {
    title: 'Follow the Formula',
    example: '"Genre, Instruments, Mood, Details, BPM"',
    description: 'Stable Audio 2.5 prefers this specific ordering.',
  },
  {
    title: 'Specify the proper Genre',
    example: '""Classic Rock", "Lo-fi Hip Hop", "Techno""',
    description: 'Use specific subgenres rather than broad terms.',
  },
  {
    title: 'Set the BPM',
    example: '"128 BPM", "85 BPM", "174 BPM"',
    description: 'Essential for rhythmic coherence in music generation.',
  },
  {
    title: 'Instrument Details',
    example: '"Stratocaster guitar, 808 kick, analog synth brass"',
    description: 'Name specific instruments and their characteristics.',
  },
]

const GENERAL_TIPS = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Let SONA enhance your prompt',
    description: 'SONA automatically restructures your prompt for Stable Audio 2.5 optimization.',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Think in Layers',
    description: 'Describe the foreground (main sound), midground (texture/action), and background (ambience).',
  },
  {
    icon: <AudioLines className="w-5 h-5" />,
    title: 'Combine Concepts',
    description: '"Underwater explosion" or "crystalline percussion" - unexpected combinations yield unique results.',
  },
]

export default function PromptingGuidePage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--sona-void)' }}
    >
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--sona-border)]">
        <IconButton
          icon={<ChevronLeft className="w-5 h-5" />}
          onClick={() => navigate(-1)}
          label="Back"
        />
        <SonaLogo size="sm" animate={false} />
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Prompting Guide
          </h1>
          <p className="text-lg text-[var(--sona-text-muted)] mb-12 max-w-2xl">
            Learn how to write effective prompts for AI audio generation.
            Better prompts lead to better results.
          </p>

          {/* General tips */}
          <section className="mb-16">
            <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-6">
              General Principles
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {GENERAL_TIPS.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'var(--sona-surface)',
                    border: '1px solid var(--sona-border)',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--sona-ember-glow)] flex items-center justify-center mb-4 text-[var(--sona-ember)]">
                    {tip.icon}
                  </div>
                  <h3 className="text-[var(--sona-cream)] font-medium mb-2">{tip.title}</h3>
                  <p className="text-sm text-[var(--sona-text-muted)]">{tip.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Designer Mode Tips */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--sona-designer-soft)] flex items-center justify-center">
                <AudioLines className="w-5 h-5 text-[var(--sona-designer)]" />
              </div>
              <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)]">
                Designer Mode Tips
              </h2>
            </div>
            <div className="space-y-4">
              {DESIGNER_TIPS.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: 'var(--sona-surface)',
                    border: '1px solid var(--sona-border)',
                  }}
                >
                  <h3 className="text-[var(--sona-cream)] font-medium mb-2">{tip.title}</h3>
                  <p className="text-sm text-[var(--sona-text-muted)] mb-3">{tip.description}</p>
                  <code className="block px-4 py-2 rounded-lg text-sm text-[var(--sona-designer)] bg-[var(--sona-designer-soft)]">
                    {tip.example}
                  </code>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Producer Mode Tips */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--sona-producer-soft)] flex items-center justify-center">
                <Headphones className="w-5 h-5 text-[var(--sona-producer)]" />
              </div>
              <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)]">
                Producer Mode Tips
              </h2>
            </div>
            <div className="space-y-4">
              {PRODUCER_TIPS.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: 'var(--sona-surface)',
                    border: '1px solid var(--sona-border)',
                  }}
                >
                  <h3 className="text-[var(--sona-cream)] font-medium mb-2">{tip.title}</h3>
                  <p className="text-sm text-[var(--sona-text-muted)] mb-3">{tip.description}</p>
                  <code className="block px-4 py-2 rounded-lg text-sm text-[var(--sona-producer)] bg-[var(--sona-producer-soft)]">
                    {tip.example}
                  </code>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Example prompts */}
          <section className="p-8 rounded-2xl" style={{ background: 'var(--sona-surface)', border: '1px solid var(--sona-border)' }}>
            <h2 className="text-xl font-display font-medium text-[var(--sona-cream)] mb-4">
              Try These Prompts
            </h2>
            <div className="space-y-3">
              {[
                'Massive cinematic impact with deep sub rumble and metallic debris',
                'Cozy coffee shop ambience with quiet chatter and soft jazz in background',
                'Funky slap bass groove, 110 BPM, vintage Motown feel',
                'Ethereal synth pad with slow attack and lush reverb, D minor',
                'Glitchy electronic percussion, broken beats, IDM style',
              ].map((prompt, index) => (
                <div
                  key={index}
                  className="px-4 py-3 rounded-lg text-sm text-[var(--sona-text-muted)] bg-[var(--sona-elevated)] font-mono"
                >
                  "{prompt}"
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
