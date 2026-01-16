/**
 * Audio Showcase Section
 * 
 * Minimalist audio showcase with impactful design
 * Features smooth transitions and clean audio players
 */

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

interface AudioExample {
    id: string
    title: string
    prompt: string
    category: 'designer' | 'producer' | 'creator'
    categoryLabel: string
    duration: string
    audioUrl: string
}

const AUDIO_EXAMPLES: AudioExample[] = [
    {
        id: 'sfx-impact',
        title: 'IMPACT_MetalResonance_Heavy_Sona_StableAudio.wav',
        prompt: 'Heavy cinematic impact with metallic resonance and deep sub rumble',
        category: 'designer',
        categoryLabel: 'Designer',
        duration: '2.3s',
        audioUrl: '/demo-audio/impact.wav',
    },
    {
        id: 'drum-loop',
        title: 'LOOP_TechHouse_128BPM_Sona_TangoFlux.wav',
        prompt: '128 BPM tech house drum loop with punchy kick and crisp hi-hats',
        category: 'producer',
        categoryLabel: 'Producer',
        duration: '4.0s',
        audioUrl: '/demo-audio/tech-house.wav',
    },
    {
        id: 'ambient-pad',
        title: 'AMB_EtherealPad_Atmospheric_Sona_StableAudio.wav',
        prompt: 'Ethereal atmospheric pad with evolving textures and subtle movement',
        category: 'designer',
        categoryLabel: 'Designer',
        duration: '8.0s',
        audioUrl: '/demo-audio/ambient-pad.wav',
    },
    {
        id: 'bass-oneshot',
        title: 'ONESHOT_DeepBass_Sub_Sona_TangoFlux.wav',
        prompt: 'Deep sub bass one-shot with analog warmth for electronic music',
        category: 'producer',
        categoryLabel: 'Producer',
        duration: '1.5s',
        audioUrl: '/demo-audio/bass-oneshot.wav',
    },
    {
        id: 'orchestral-stem',
        title: 'COMP_EpicOrchestral_Cinematic_Sona_StableAudio.wav',
        prompt: 'Epic orchestral composition featuring strings, brass, and percussion',
        category: 'creator',
        categoryLabel: 'Creator',
        duration: '15.0s',
        audioUrl: '/demo-audio/orchestral.wav',
    },
    {
        id: 'foley-footsteps',
        title: 'FOLEY_Footsteps_Concrete_Sona_StableAudio.wav',
        prompt: 'Realistic footsteps on concrete surface with natural ambience',
        category: 'designer',
        categoryLabel: 'Designer',
        duration: '3.2s',
        audioUrl: '/demo-audio/footsteps.wav',
    },
]

const CATEGORY_COLORS = {
    designer: {
        border: 'border-[var(--sona-designer)]',
        bg: 'bg-sona-designer/5',
        text: 'text-[var(--sona-designer)]',
        glow: 'shadow-sona-designer',
        hover: 'hover:border-sona-designer/40',
    },
    producer: {
        border: 'border-[var(--sona-producer)]',
        bg: 'bg-sona-producer/5',
        text: 'text-[var(--sona-producer)]',
        glow: 'shadow-sona-producer',
        hover: 'hover:border-sona-producer/40',
    },
    creator: {
        border: 'border-[var(--sona-creator)]',
        bg: 'bg-sona-creator/5',
        text: 'text-[var(--sona-creator)]',
        glow: 'shadow-sona-creator',
        hover: 'hover:border-sona-creator/40',
    },
}

export const AudioShowcase: React.FC<{ handleOpenModal: () => void }> = ({ handleOpenModal }) => {
    return (
        <section className="audio-showcase-section relative py-16 md:py-24 bg-gradient-to-b from-landing-surface-light dark:from-landing-surface-dark to-landing-bg-light dark:to-landing-bg-dark overflow-hidden">
            {/* Gradient transition overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-landing-surface-light dark:from-landing-surface-dark to-transparent" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Minimalist Header */}
                <div className="mb-12 md:mb-20 text-center">
                    {/* <div className="inline-block mb-3">
            <div className="h-px w-12 bg-primary mx-auto mb-4" />
          </div> */}
                    <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-medium mb-3 md:mb-4">
                        Listen to the Community
                    </h2>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-lg px-2">
                        Audio generated with SONA, donated by the users. Each unique, each professional.
                    </p>
                </div>

                {/* Audio Players List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                    {AUDIO_EXAMPLES.map((example, index) => (
                        <AudioPlayer key={example.id} example={example} index={index} />
                    ))}
                </div>

                {/* Bottom fade */}
                {/* <div className="mt-20 text-center">
          <div className="inline-block">
            <div className="h-px w-12 bg-gray-300 dark:bg-white/20 mx-auto" />
          </div>
        </div> */}
            </div>
            <div className='mt-8 md:mt-12 flex flex-col w-full gap-2 px-4'>
                {/* <span className='text-sm font-display mx-auto text-center'>Learn how to prompt, share your tips and donate your creations on the growing SONA community.</span> */}
                <button
                    onClick={handleOpenModal}
                    className="mx-auto bg-landing-surface-dark text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-medium  transition-all shadow-primary/25 flex items-center justify-center gap-2 group animate-fadeIn"
                >
                    {/* <Volume2 className="w-5 h-5" /> */}
                    Join the BETA
                </button>
            </div>
        </section>
    )
}

interface AudioPlayerProps {
    example: AudioExample
    index: number
}

function AudioPlayer({ example, index }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    const handlePlayPause = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateProgress = () => {
            const progress = (audio.currentTime / audio.duration) * 100
            setProgress(progress)
            setCurrentTime(audio.currentTime)
        }

        const handleEnd = () => {
            setIsPlaying(false)
            setProgress(0)
            setCurrentTime(0)
        }

        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('ended', handleEnd)

        return () => {
            audio.removeEventListener('timeupdate', updateProgress)
            audio.removeEventListener('ended', handleEnd)
        }
    }, [])

    const colors = CATEGORY_COLORS[example.category]

    return (
        <div
            className={`group relative bg-landing-surface-dark dark:bg-landing-surface-dark  ${colors.hover} rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-500 ${colors.glow}`}
            style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0,
            }}
        >
            <audio ref={audioRef} src={example.audioUrl} preload="metadata" />

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Play Button - Minimalist */}
                <button
                    onClick={handlePlayPause}
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${colors.border} ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 hover:scale-110 ${isPlaying ? 'shadow-lg' : ''
                        }`}
                >
                    {isPlaying ? (
                        <Pause className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                    ) : (
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Mode Badge & Title */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <span className={`text-[10px] sm:text-xs font-mono ${colors.text} tracking-wider`}>
                            {example.categoryLabel.toUpperCase()}
                        </span>
                        {/* <span className="text-xs text-gray-400 dark:text-gray-600">•</span> */}
                        <span className="text-[10px] sm:text-xs font-mono text-gray-500 dark:text-gray-500 truncate hidden sm:inline">
                            {example.title}
                        </span>
                    </div>

                    {/* Prompt */}
                    <p className="text-xs sm:text-sm text-landing-subtext-light dark:text-landing-subtext-dark font-light mb-2 sm:mb-3 line-clamp-1">
                        "{example.prompt}"
                    </p>

                    {/* Progress Bar */}
                    <div className="relative h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full ${colors.bg} transition-all duration-150`}
                            style={{ width: `${progress}%` }}
                        >
                            <div className={`absolute top-0 right-0 w-1 h-full bg-current ${colors.text}`} />
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between mt-1 sm:mt-2">
                        <span className="text-[10px] sm:text-xs font-mono text-gray-400 dark:text-gray-600">
                            {formatTime(currentTime)}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-gray-400 dark:text-gray-600">
                            {example.duration}
                        </span>
                    </div>
                </div>
            </div>

            {/* Subtle glow effect when playing */}
            {isPlaying && (
                <div className={`absolute inset-0 rounded-xl md:rounded-2xl ${colors.bg} opacity-50 blur-xl -z-10 animate-pulse`} />
            )}
        </div>
    )
}

function formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Add animation keyframes in your global CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)
