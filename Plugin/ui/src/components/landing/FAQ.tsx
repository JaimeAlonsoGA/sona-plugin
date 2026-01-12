/**
 * FAQ Section
 * 
 * Frequently asked questions about SONA
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: 'What is SONA?',
    answer: 'SONA is an AI-powered audio generation plugin that works as a VST3 and Standalone application. It uses Stable Audio 2.5 to generate professional-quality sound effects, ambiences, loops, and musical elements from text descriptions.',
  },
  {
    question: 'How does the token system work?',
    answer: 'Tokens are the currency used for generations. Each generation costs tokens based on duration and quality settings. Standard quality uses fewer tokens, while High Quality provides better results at a higher cost. Tokens never expire and can be purchased in packs.',
  },
  {
    question: 'What audio formats does SONA export?',
    answer: 'SONA generates high-quality 44.1kHz, 16-bit WAV files suitable for professional audio production. The audio is ready to use in any DAW or video editing software without additional conversion.',
  },
  {
    question: 'What is UCS naming convention?',
    answer: 'UCS (Universal Category System) is an industry-standard naming convention for sound effects. SONA can automatically generate filenames following UCS or custom naming conventions, making organization and searching easier.',
  },
  {
    question: 'What\'s the difference between Designer and Producer modes?',
    answer: 'Designer Mode is optimized for sound designers creating SFX, ambiences, and foley, with duration in seconds. Producer Mode is for music production, allowing you to set BPM, time signature, and bars for tempo-synced loops and stems.',
  },
  {
    question: 'Can I use generated audio commercially?',
    answer: 'Yes! All audio generated with SONA can be used in commercial projects including games, films, music releases, and content creation. The audio you generate is yours to use.',
  },
  {
    question: 'What DAWs is SONA compatible with?',
    answer: 'SONA works as a VST3 plugin compatible with major DAWs including Ableton Live, FL Studio, Logic Pro, Pro Tools, Cubase, Reaper, and Studio One. It also runs as a standalone application.',
  },
  {
    question: 'How do I get the best results?',
    answer: 'Be descriptive in your prompts! Include details about texture, mood, tempo, and style. SONA\'s AI enhances your prompts automatically, but more detail helps. Experiment with both quality settings and different prompt styles.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 px-6 bg-[var(--sona-deep)]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-[var(--sona-text-muted)]">
            Everything you need to know about SONA
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-[var(--sona-text-muted)] mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@sona.audio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[var(--sona-text)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)] transition-colors"
          >
            Contact us
          </a>
        </motion.div>
      </div>
    </section>
  )
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div 
      className="rounded-xl overflow-hidden transition-colors"
      style={{ 
        background: 'var(--sona-surface)',
        border: `1px solid ${isOpen ? 'var(--sona-ember)' : 'var(--sona-border)'}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-[var(--sona-cream)] pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-[var(--sona-text-muted)] shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 pt-0">
              <p className="text-[var(--sona-text-muted)] text-sm leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
