/**
 * Feedback Page
 * 
 * Form for beta testers to submit feedback
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Send, Check } from 'lucide-react'
import { IconButton } from '../components/shared'
import { SonaLogo } from '../components/shared/sona-logo'
import { useSession } from '../lib/hooks'

type FeedbackType = 'bug' | 'feature' | 'general' | 'prompting'

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Submit to Supabase
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

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

      <div className="max-w-xl mx-auto px-6 py-12">
        {isSubmitted ? (
          // Success state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--sona-sage-soft)] flex items-center justify-center">
              <Check className="w-10 h-10 text-[var(--sona-sage)]" />
            </div>
            <h2 className="text-2xl font-display font-medium text-[var(--sona-cream)] mb-3">
              Thank you for your feedback!
            </h2>
            <p className="text-[var(--sona-text-muted)] mb-8">
              Your input helps us make SONA better for everyone.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setMessage('')
                setFeedbackType('general')
              }}
              className="px-6 py-3 rounded-xl font-medium text-[var(--sona-text)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)] transition-colors"
            >
              Send more feedback
            </button>
          </motion.div>
        ) : (
          // Form
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-medium text-[var(--sona-cream)] mb-2">
              Send Feedback
            </h1>
            <p className="text-[var(--sona-text-muted)] mb-8">
              Help us improve SONA. Report bugs, request features, or share your thoughts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback type */}
              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-3">
                  Type of feedback
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'general', label: 'General' },
                    { value: 'bug', label: 'Bug Report' },
                    { value: 'feature', label: 'Feature Request' },
                    { value: 'prompting', label: 'Prompting Tips' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value as FeedbackType)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        feedbackType === type.value
                          ? 'text-[var(--sona-void)]'
                          : 'text-[var(--sona-text-muted)] border border-[var(--sona-border)] hover:border-[var(--sona-muted)]'
                      }`}
                      style={feedbackType === type.value ? {
                        background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                      } : undefined}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[var(--sona-text)] placeholder-[var(--sona-text-subtle)]"
                  style={{
                    background: 'var(--sona-surface)',
                    border: '1px solid var(--sona-border)',
                  }}
                  placeholder="For follow-up questions"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs text-[var(--sona-text-subtle)] uppercase tracking-wider mb-2">
                  Your message *
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl text-[var(--sona-text)] placeholder-[var(--sona-text-subtle)] resize-none"
                  style={{
                    background: 'var(--sona-surface)',
                    border: '1px solid var(--sona-border)',
                  }}
                  placeholder={
                    feedbackType === 'bug'
                      ? "Describe the bug you encountered. Include steps to reproduce if possible..."
                      : feedbackType === 'feature'
                      ? "Describe the feature you'd like to see..."
                      : feedbackType === 'prompting'
                      ? "Share prompting tips that worked well for you..."
                      : "Share your thoughts about SONA..."
                  }
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 rounded-xl font-medium text-[var(--sona-void)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--sona-ember) 0%, #B86E55 100%)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[var(--sona-void)]/30 border-t-[var(--sona-void)] rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
