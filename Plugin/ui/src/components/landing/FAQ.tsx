/**
 * FAQ Section - Reimagined
 * 
 * Clean, modern accordion with smooth animations
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle, Mail } from 'lucide-react'

const FAQS = [
  {
    question: 'What is SONA?',
    answer: 'SONA is an AI-powered audio generation plugin that works as a VST3 and Standalone application. It uses state-of-the-art AI models specialized on sound effects, foley, loops and songs.',
  },
  {
    question: 'How does the token system work?',
    answer: 'Tokens are the currency used for generations. Each generation costs tokens based on duration and quality settings. Token cost varies by mode and quality level, with draft being cheapest and high quality using more tokens. Tokens never expire and can be purchased in packs starting at $2.',
  },
  {
    question: 'What audio formats does SONA export?',
    answer: 'SONA generates high-quality 44.1kHz, 16-bit WAV files suitable for professional audio production. MP3 previews are also provided for quick listening. The audio is ready to use in any DAW or video editing software.',
  },
  {
    question: 'What is the UCS naming system?',
    answer: 'UCS (Universal Category System) is an industry-standard naming convention for sound effects used by major studios. SONA can automatically generate filenames following UCS categories, or you can create custom naming conventions tailored to your workflow.',
  },
  {
    question: 'What does AI prompt enhancement do?',
    answer: 'The AI prompt enhancement uses GPT-5-nano to optimize your text descriptions for better generation results. It adds relevant details, production terminology, and sonic characteristics based on your chosen mode. This costs 1 token per enhancement.',
  },
  {
    question: 'Can I use generated audio commercially?',
    answer: 'Yes! All audio generated with SONA can be used in commercial projects including games, films, music releases, podcasts, and content creation. The audio you generate is yours to use without restrictions.',
  },
  {
    question: 'What DAWs is SONA compatible with?',
    answer: 'SONA works as a VST3 plugin compatible with all major DAWs including Ableton Live, FL Studio, Logic Pro, Pro Tools, Cubase, Reaper, Studio One, and Bitwig. It also runs as a standalone application for quick generation.',
  },
]

function FAQItem({ 
  question, 
  answer, 
  isOpen, 
  onToggle,
  index
}: { 
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(itemRef, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <motion.div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          background: isOpen ? 'var(--sona-surface)' : 'transparent',
          border: `1px solid ${isOpen ? 'var(--sona-ember)' : 'var(--sona-border)'}`,
        }}
        animate={{
          boxShadow: isOpen ? '0 0 30px rgba(212, 133, 106, 0.1)' : '0 0 0 transparent',
        }}
      >
        <motion.button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-6 text-left"
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <span className={`font-medium pr-4 transition-colors ${
            isOpen ? 'text-[var(--sona-cream)]' : 'text-[var(--sona-text-muted)]'
          }`}>
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              isOpen ? 'bg-[var(--sona-ember-glow)]' : 'bg-[var(--sona-elevated)]'
            }`}
          >
            <ChevronDown 
              className={`w-5 h-5 transition-colors ${
                isOpen ? 'text-[var(--sona-ember)]' : 'text-[var(--sona-text-muted)]'
              }`}
            />
          </motion.div>
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-6 pb-6">
                <p className="text-[var(--sona-text-muted)] leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section 
      ref={sectionRef}
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: 'var(--sona-deep)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -right-40 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--sona-ember) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.1,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'var(--sona-surface)',
              border: '1px solid var(--sona-border)',
            }}
          >
            <HelpCircle className="w-4 h-4 text-[var(--sona-ember)]" />
            <span className="text-sm text-[var(--sona-text-muted)]">Got Questions?</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Frequently asked{' '}
            <span className="text-[var(--sona-ember)]">questions</span>
          </h2>
          <p className="text-lg text-[var(--sona-text-muted)]">
            Everything you need to know about SONA
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {FAQS.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div 
            className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl"
            style={{
              background: 'var(--sona-surface)',
              border: '1px solid var(--sona-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--sona-designer-soft)' }}
              >
                <MessageCircle className="w-6 h-6 text-[var(--sona-designer)]" />
              </div>
              <div className="text-left">
                <p className="text-sm text-[var(--sona-text-subtle)]">Still have questions?</p>
                <p className="text-[var(--sona-cream)] font-medium">We're here to help</p>
              </div>
            </div>
            
            <motion.a
              href="mailto:support@sona.audio"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--sona-elevated)',
                border: '1px solid var(--sona-border)',
                color: 'var(--sona-text)',
              }}
              whileHover={{ 
                borderColor: 'var(--sona-ember)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
