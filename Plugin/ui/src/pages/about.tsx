/**
 * About Page
 * 
 * Information about SONA and the team
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Zap, Heart, Shield, Globe } from 'lucide-react'
import { IconButton } from '../components/shared'
import { SonaLogo } from '../components/shared/sona-logo'

const VALUES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Empowering Creativity',
    description: 'We believe AI should augment human creativity, not replace it. SONA is a tool to help you bring your ideas to life faster.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Built for Professionals',
    description: 'Designed by audio professionals, for audio professionals. We understand the workflows and needs of sound designers and producers.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Quality First',
    description: 'We only ship features when they meet our quality bar. Every sound you generate should be production-ready.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Community Driven',
    description: 'Your feedback shapes SONA. We build in the open and prioritize features based on what our users need.',
  },
]

export default function AboutPage() {
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
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-medium text-[var(--sona-cream)] mb-6">
            About SONA
          </h1>
          <p className="text-xl text-[var(--sona-text-muted)] max-w-2xl mx-auto leading-relaxed">
            SONA is an AI-powered audio generation plugin built for the modern creative workflow.
            We're on a mission to make professional sound design accessible to everyone.
          </p>
        </motion.div>

        {/* Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-6">
            Our Story
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-[var(--sona-text-muted)] leading-relaxed mb-4">
              SONA was born from a simple observation: creating original audio content is time-consuming, 
              and stock libraries often lack the unique character our projects need. We believed there had 
              to be a better way.
            </p>
            <p className="text-[var(--sona-text-muted)] leading-relaxed mb-4">
              With advances in AI audio generation, specifically Stable Audio, we saw an opportunity 
              to create a tool that puts the power of AI directly into the hands of creators—right 
              inside their DAW.
            </p>
            <p className="text-[var(--sona-text-muted)] leading-relaxed">
              Today, SONA is in closed beta, being shaped by feedback from sound designers, music producers, 
              and content creators around the world. We're just getting started.
            </p>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-8">
            What We Believe
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'var(--sona-surface)',
                  border: '1px solid var(--sona-border)',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--sona-ember-glow)] flex items-center justify-center mb-4 text-[var(--sona-ember)]">
                  {value.icon}
                </div>
                <h3 className="text-lg font-medium text-[var(--sona-cream)] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[var(--sona-text-muted)]">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technology */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-6">
            The Technology
          </h2>
          <div 
            className="p-8 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--sona-sage-soft) 0%, var(--sona-surface) 100%)',
              border: '1px solid var(--sona-sage)',
            }}
          >
            <h3 className="text-xl font-medium text-[var(--sona-cream)] mb-4">
              Powered by Stable Audio 2.5
            </h3>
            <p className="text-[var(--sona-text-muted)] leading-relaxed mb-4">
              SONA uses Stability AI's Stable Audio 2.5, a state-of-the-art diffusion model 
              trained on high-quality audio. This enables us to generate professional-grade 
              sound effects, musical elements, and textures from simple text descriptions.
            </p>
            <p className="text-[var(--sona-text-muted)] leading-relaxed">
              Combined with our prompt enhancement system and UCS-aware naming, SONA 
              transforms your creative ideas into production-ready audio in seconds.
            </p>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Get in Touch
          </h2>
          <p className="text-[var(--sona-text-muted)] mb-6">
            Have questions, feedback, or just want to say hi?
          </p>
          <a
            href="mailto:hello@sona.audio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[var(--sona-void)]"
            style={{
              background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
            }}
          >
            Contact Us
          </a>
        </motion.section>
      </div>
    </div>
  )
}
