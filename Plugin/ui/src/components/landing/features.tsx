/**
 * Features Section
 * 
 * AI Prompt Enhancer and Automatic Naming features
 * with visual demonstrations
 */

import { CheckCircle, MoreVertical } from 'lucide-react'
import generateImage from '../../assets/website-assets/generation.webp'

export function Features() {
  return (
    <section className="bg-gradient-to-b from-transparent to-landing-surface-light py-16 md:py-32 overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* AI Prompt Enhancer */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Visual Demo */}
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="relative aspect-square bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl md:rounded-3xl p-4 sm:p-8 border border-gray-200 dark:border-white/5 overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <img src={generateImage} alt="Generate Audio" className="w-full h-auto rounded-lg" />
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="max-w-md mx-auto md:mx-0">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">
                The Core
              </span>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium mb-4 md:mb-6">Generate audio, for everything</h3>
              <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Yes, for everything. From Game Audio Sound Design to Podcast Backgrounds, from Punchy House Kick loops to Cinematic Orquestral Sountracks.
              </p>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center gap-3 text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Thought for professionals</span>
                </li>
                <li className="flex items-center gap-3 text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Built versatile integrating 3 generative models</span>
                </li>
                <li className="flex items-center gap-3 text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Keep 100% of the rights to your creations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Automatic Naming */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Content */}
          <div className="w-full md:w-1/2">
            <div className="max-w-md mx-auto md:ml-auto md:mr-0">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">
                Workflow
              </span>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium mb-4 md:mb-6">Automatic Naming</h3>
              <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Never lose a sample named "Audio_01.wav" again. SONA analyzes the generated audio and applies intelligent naming conventions with user-custom parameters or built-in standard conventions like UCS or AES.
              </p>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-video md:aspect-square bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl md:rounded-3xl p-4 sm:p-8 border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col justify-center gap-3 sm:gap-4 group">
              <div className="absolute inset-0 bg-gradient-to-bl from-sona-gold/5 to-transparent" />

              {/* File Card 1 */}
              <div className="relative z-10 bg-landing-bg-light dark:bg-landing-bg-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-lg transform transition-all duration-500 group-hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* <FileAudio className="w-5 h-5 text-sona-gold" /> */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">ANIMALS_CatMiau_Sona_TangoFlux.wav</span>
                      <span className="text-xs text-gray-500">2.4MB • WAV 16bit</span>
                    </div>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* File Card 2 */}
              <div className="relative z-10 bg-landing-bg-light dark:bg-landing-bg-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-lg opacity-60 transform scale-95 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* <FileAudio className="w-5 h-5 text-sona-gold" /> */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Loop_House_kick_Cmin_128.wav</span>
                      <span className="text-xs text-gray-500">8.1MB • WAV 16bit</span>
                    </div>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* File Card 3 */}
              <div className="relative z-10 bg-landing-bg-light dark:bg-landing-bg-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-lg opacity-60 transform scale-95 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* <FileAudio className="w-5 h-5 text-sona-gold" /> */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">SP_DarkPsytranceForest_Master_44k_16b.wav</span>
                      <span className="text-xs text-gray-500">20.2MB • WAV 16bit</span>
                    </div>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Visual Demo */}
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="relative aspect-square bg-landing-surface-light dark:bg-landing-surface-dark rounded-2xl md:rounded-3xl p-4 sm:p-8 border border-gray-200 dark:border-white/5 overflow-hidden flex items-center justify-center group">
              {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" /> */}
              <div className="w-3/4 space-y-4 relative z-10 transition-transform duration-500 group-hover:scale-105">
                {/* Prompt Input */}
                <div className="h-10 bg-landing-bg-light dark:bg-landing-bg-dark rounded-lg w-full flex items-center px-4 border border-gray-200 dark:border-white/10 shadow-lg">
                  <span className="text-xs text-gray-400 font-mono">Atmospheric pad in key of...</span>
                </div>
                {/* Waveform Visualization */}
                <div className="h-24 bg-landing-bg-light dark:bg-landing-bg-dark rounded-lg w-full border border-gray-200 dark:border-white/10 shadow-lg p-3 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-1 bg-primary h-4 rounded-full" />
                    <div className="w-1 bg-primary h-8 rounded-full" />
                    <div className="w-1 bg-primary h-6 rounded-full" />
                    <div className="w-1 bg-primary h-10 rounded-full" />
                    <div className="w-1 bg-primary h-5 rounded-full" />
                    <div className="w-1 bg-primary h-3 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="max-w-md mx-auto md:mx-0">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">
                Extras
              </span>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium mb-4 md:mb-6">AI Prompt Enhancer</h3>
              <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Stuck on a sound? Describe it loosely, and our GPT-powered engine expands your prompt into detailed sonic instructions, ensuring rich, textured results every time.
              </p>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center gap-3 text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Context-aware suggestions</span>
                </li>
                <li className="flex items-center gap-3 text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Technical terminology expansion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
