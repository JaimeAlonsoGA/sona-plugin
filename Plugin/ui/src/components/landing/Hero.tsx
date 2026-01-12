/**
 * Hero Section
 * 
 * Impactful opening with tagline and CTA
 */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  onRequestAccess: () => void
}

export function Hero({ onRequestAccess }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, var(--sona-ember) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--sona-designer) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-15"
          style={{ background: 'radial-gradient(ellipse, var(--sona-producer) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[var(--sona-cream)] mb-6 leading-tight"
        >
          Transform Imagination
          <br />
          <span className="text-[var(--sona-ember)]">Into Sound</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-[var(--sona-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered audio generation plugin for{' '}
          <span className="text-[var(--sona-designer)]">sound designers</span>,{' '}
          <span className="text-[var(--sona-producer)]">music producers</span>, and{' '}
          <span className="text-[var(--sona-sage)]">content creators</span>.
          VST3 & Standalone.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onRequestAccess}
            className="group flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-[var(--sona-void)] transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
              boxShadow: '0 4px 20px var(--sona-ember-glow), 0 0 40px var(--sona-ember-glow)',
            }}
          >
            Request Beta Access
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <a
            href="#demo"
            className="px-8 py-4 rounded-xl font-medium text-[var(--sona-text-muted)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)] hover:text-[var(--sona-text)] transition-all duration-300"
          >
            Listen to demos
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 md:gap-16 text-center"
        >
          <div>
            <p className="text-2xl md:text-3xl font-semibold text-[var(--sona-gold)]">500</p>
            <p className="text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mt-1">Free tokens</p>
          </div>
          <div className="w-px h-10 bg-[var(--sona-border)]" />
          <div>
            <p className="text-2xl md:text-3xl font-semibold text-[var(--sona-sage)]">2.5</p>
            <p className="text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mt-1">Stable Audio</p>
          </div>
          <div className="w-px h-10 bg-[var(--sona-border)]" />
          <div>
            <p className="text-2xl md:text-3xl font-semibold text-[var(--sona-designer)]">UCS</p>
            <p className="text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mt-1">Naming support</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[var(--sona-border)] flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--sona-ember)]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
