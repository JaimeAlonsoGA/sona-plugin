/**
 * Landing Hero Section
 * 
 * Impactful opening with gradient text, version badge, 
 * and plugin mockup with animated generating indicator
 */

import { Download, Play } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import demo from '../../assets/website-assets/sona-plugin.webp'

interface HeroProps {
  onDownload?: () => void
  onWatchDemo?: () => void
}

export function Hero({ onDownload, onWatchDemo }: HeroProps) {
  const [progress, setProgress] = useState(50)
  const [isComplete, setIsComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Intersection Observer to detect when progress bar is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    if (progressBarRef.current) {
      observer.observe(progressBarRef.current)
    }

    return () => {
      if (progressBarRef.current) {
        observer.unobserve(progressBarRef.current)
      }
    }
  }, [isVisible])

  // Progress animation - only starts when visible
  useEffect(() => {
    if (!isVisible) return

    if (progress >= 100) {
      setIsComplete(true)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 8 + 2 // Random increment between 2-8
        const newProgress = Math.min(prev + increment, 100)
        return newProgress
      })
    }, 400) // Update every 400ms

    return () => clearInterval(interval)
  }, [progress, isVisible])

  const handleListenToDemos = () => {
    // Scroll to AudioShowcase section
    const showcaseSection = document.querySelector('.audio-showcase-section')
    if (showcaseSection) {
      showcaseSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] dark:bg-primary/20" />
        <div className="absolute bottom-0 right-1/4 w-[350px] sm:w-[500px] lg:w-[600px] h-[350px] sm:h-[500px] lg:h-[600px] bg-sona-gold/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] dark:bg-sona-gold/10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Version Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full">
          {/* <img src={icon} alt="SONA Icon" className="w-32" /> */}
          <span className='sona-logo text-lg sm:text-xl'>sona</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 sm:mb-8 leading-[1.1]">
          Experience AI audio <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          <span className="bg-gradient-to-r from-primary to-sona-gold text-gradient bg-clip-text">
            reimagined.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-landing-subtext-light dark:text-landing-subtext-dark mb-8 sm:mb-12 font-light leading-relaxed px-2 sm:px-0">
          The first generative audio plugin for designers, producers, and creators. Generate sound instantly within your DAW, powered by next-gen AI.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          <button
            onClick={onDownload}
            className="bg-primary text-white px-8 py-4 rounded-full text-base font-medium hover:bg-amber-700 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group"
          >
            Download Plugin
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <button
            onClick={onWatchDemo}
            className="bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10 text-landing-text-light dark:text-landing-text-dark px-8 py-4 rounded-full text-base font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </div>

        {/* Plugin Mockup */}
        <div className="relative max-w-5xl mx-auto">
          {/* Gradient fade at bottom */}
          <div className="rounded-2xl absolute inset-0 bg-gradient-to-t from-landing-bg-light/10 dark:from-landing-bg-dark via-transparent to-transparent z-10 h-full w-full pointer-events-none bottom-0" />

          <div className="bg-black/90 rounded-2xl border border-white/10 p-2 md:p-4 glow-effect overflow-hidden">
            {/* Plugin Screenshot Placeholder */}
            {/* <div
              className="rounded-xl w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center"
              style={{ minHeight: '400px', maxHeight: '600px' }}
            > */}
            <div className="text-center p-2">
              <img src={demo} alt="SONA Plugin Demo" className="rounded--t-xl" />
              {/* <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Plugin Interface Preview</p>
                */}
              {/* </div> */}
            </div>

            {/* Generating Indicator Overlay / Listen to Demos Button */}
            <div ref={progressBarRef} className="absolute bottom-14 left-0 right-0 px-8 pb-8 flex flex-col items-center z-20">
              {!isComplete ? (
                <div className="w-full max-w-2xl bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-2xl">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-sona-gold transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    GENERATING... {Math.round(progress)}%
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleListenToDemos}
                  className="bg-landing-surface-dark text-primary px-10 py-4 rounded-full text-base font-medium  transition-all shadow-primary/25 flex items-center justify-center gap-2 group animate-fadeIn"
                >
                  {/* <Volume2 className="w-5 h-5" /> */}
                  Listen to Demos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
