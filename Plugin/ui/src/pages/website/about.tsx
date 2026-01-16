/**
 * About Page
 * 
 * Information about SONA - Website Style
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Zap, Users } from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { Link, useNavigate } from 'react-router-dom'
import { useBeta } from '@/hooks/use-beta'
import { BetaModal } from '@/components/landing/beta-modal'

const VALUES = [
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'Pushing boundaries of AI audio generation to empower creators.',
  },
  {
    icon: Heart,
    title: 'Audiophilia',
    description: 'Woosh, Woooooosh, Boom, Bang, Tss Tss Tss!',
  },
  {
    icon: Zap,
    title: 'Creativity',
    description: 'Unleashing new sonic possibilities for artists and designers.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Growing together with feedback from our amazing power users.',
  },
]

export default function AboutPage() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const navigate = useNavigate()
  const { hasBetaAccess } = useBeta()

  const handleCTA = () => {
    if (hasBetaAccess) {
      navigate('/download')
    } else {
      setIsBetaModalOpen(true)
    }
  }

  return (
    <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <LandingNav />
      <section className="bg-gradient-to-br from-[var(--sona-designer)] to-black relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-32">
          {/* <div className="inline-block mb-4">
                            <div className="h-px w-12 bg-primary mx-auto mb-6" />
                        </div> */}

          <h1 className="font-display text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-4">
            About SONA
          </h1>

          <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-base md:text-lg mb-4 px-2">
            Bringing to the table the AI ethics on the audio industry and why we created SONA.
          </p>

          {/* Changelog */}
          <div className="mt-6 mb-16 sm:mb-32 flex flex-col ">
            <Link to="/changelog" className="text-blue-500  hover:underline decoration-blue-500">View Changelog ↗</Link>
          </div>
        </div>
      </section>
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">

        {/* Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 md:mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
            aiwasamistake.ai - Introduction
          </h2>
          <div className="text-justify space-y-4 md:space-y-6 text-base md:text-lg text-landing-text-light/80 dark:text-landing-text-dark/80 leading-relaxed">
            <p>
              AI Was A Mistake (aiwasamistake.ai) develops generative AI tools for creators.
              SONA was the first, and we would like to thank everyone who tested it, provided feedback, spent time with it, and embraced the next generation of AI without fear.
            </p>
            <p>
              We sincerely believe that SONA is the most advanced and powerful tool of its kind. It has almost no competitors, and it collaborates with top-tier, state-of-the-art AI models and research labs, such as Stability.ai and Declare Lab.
            </p>
            <p>
              If you haven't joined yet, we encourage you to become part of the R&D community ecosystem we are building. When we created SONA, an AI-powered audio plugin, we didn't know what to expect, and we still don't. Its secrets have yet to be discovered, though the developers have put in a lot of effort to make it a great tool that meets industry professional standards.
            </p>
            <p>
              The SONA developers have worked closely with sound designers and music producers. Special thanks to El Bosque Studios for allowing AI Was A Mistake to test the plugin in their treated environment with professional tools.
              Thank you!
            </p>
          </div>
        </motion.section>

        {/* Ethics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center">
            Let's talk Ethics
          </h2>
          <div className="text-justify space-y-4 md:space-y-6 text-base md:text-lg text-landing-text-light/80 dark:text-landing-text-dark/80 leading-relaxed mb-6 md:mb-10">
            <p>
              As human beings sharing this moment in time, let's celebrate!
            </p>
            <p>
              Now, let's talk ethics. We believe AI is the present and the future.
              It's like an arrow we've shot; we can guide it but not stop it. AI is here to stay, so we should start building on top of it instead of trying to disassemble what's obvious.
              That said, SONA has only used models respectful of human artists because we believe in art and human creativity. These models use a fully licensed dataset and are built with commercial safety in mind. They use Freesound and the Free Music Archive, which respect creator rights.
            </p>
            <p>
              Let's build an audio industry that honors the incredible efforts of all the behind-the-scenes professionals, and continues to produce groundbreaking creations that redefine sound design and music production.
              As proud AI users and creators, we will continue to research, discover, design, compose, and arrange the most fascinating forms of expression, with or without AI. But, let's be honest—who wouldn't use a hammer?
            </p>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 md:mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center">
            What Moves Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 md:p-6 rounded-xl md:rounded-2xl backdrop-blur-sm bg-white/5 dark:bg-black/20 border border-landing-text-light/10 dark:border-landing-text-dark/10 hover:border-landing-accent/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* <div className="p-3 rounded-xl bg-landing-accent/10">
                    <value.icon className="w-5 h-5 text-landing-accent" />
                  </div> */}
                  <div>
                    <h3 className="font-medium mb-1 md:mb-2 text-base md:text-lg">
                      {value.title}
                    </h3>
                    <p className="text-sm md:text-base text-landing-text-light/70 dark:text-landing-text-dark/70">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technology */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-10 text-center">
            The Technology
          </h2>
          <div className="text-justify space-y-6 text-lg text-landing-text-light/80 dark:text-landing-text-dark/80 leading-relaxed">
            <p>
              SONA leverages cutting-edge AI models specifically trained for sfx, foley, one-shots, loops, stems and songs generation,
              combined with intelligent prompt enhancement to help you get better results
              with simpler descriptions.
            </p>
            <p className='border p-2 rounded-lg bg-landing-bg-light'>
              Generative audio AIs can be unpredictable when using complex time signatures or very specific genres or sounds,
              the unpredictability of the models, can create undesired results.
              However, with practice and experimentation, one can achieve impressive results, and sometimes found unexpected gems.
              For more information refer to the <Link className='text-blue-500 hover:underline decoration-blue-500' to="/prompting">prompting guide</Link>.
            </p>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-medium mb-6">
                Eager to adventure into next-gen AI?
              </h2>
              <p className="text-landing-subtext-light dark:text-landing-subtext-dark mb-8 max-w-xl mx-auto">
                Join the beta and get 1,000 free tokens to explore all of Sona's AI-powered audio generation capabilities.
              </p>
              <button
                onClick={handleCTA}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {/* <Sparkles className="w-5 h-5" /> */}
                Join the Beta
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* Beta Modal */}
      <BetaModal 
        isOpen={isBetaModalOpen} 
        onClose={() => setIsBetaModalOpen(false)} 
      />
    </div>
  )
}
