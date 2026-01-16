/**
 * Call to Action Section
 * 
 * "Ready to break the silence?" final conversion section
 */

interface CTAProps {
  onDownload?: () => void
}

export function CTA({ onDownload }: CTAProps) {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="bg-sona-void rounded-2xl md:rounded-[2.5rem] p-8 sm:p-12 md:p-24 relative overflow-hidden text-center border border-white/5">
          {/* Stardust Pattern Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='stars'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23stars)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-medium text-white mb-6 md:mb-8">
              Ready to break the silence?
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 md:mb-12 px-4 sm:px-0">
              Join thousands of creators using SONA to unravel the future finding new inspiration within the next generative AI-generation.
            </p>
            <button
              onClick={onDownload}
              className="bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
            >
              Download Now
            </button>
            <p className="mt-4 md:mt-6 text-xs text-gray-600">
              Available for macOS & Windows • VST3 / AU 
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
