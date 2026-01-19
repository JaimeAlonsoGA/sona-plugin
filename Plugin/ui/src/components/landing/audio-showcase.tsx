/**
 * Audio Showcase Section
 * 
 * Displays community-donated audio generations from public jobs.
 * Features smooth transitions, clean audio players, and real-time data from Supabase.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Loader2, Volume2 } from 'lucide-react'
import { usePublicShowcaseJobs } from '../../lib/hooks'
import type { PublicShowcaseJob } from '../../lib/api/jobs'

/**
 * Mode type matching database values
 */
type AudioMode = 'designer' | 'producer' | 'creator'

/**
 * Category styling configuration
 */
const CATEGORY_COLORS: Record<AudioMode, {
    border: string
    bg: string
    text: string
    glow: string
    hover: string
}> = {
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

/**
 * Default category for unknown modes
 */
const DEFAULT_CATEGORY: AudioMode = 'designer'

/**
 * Get category from mode string
 */
function getModeCategory(mode: string): AudioMode {
    const normalizedMode = mode.toLowerCase()
    if (normalizedMode in CATEGORY_COLORS) {
        return normalizedMode as AudioMode
    }
    return DEFAULT_CATEGORY
}

/**
 * Format duration in seconds to display string
 */
function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`
    }
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(0)
    return `${mins}:${secs.padStart(2, '0')}`
}

/**
 * Format time for player display
 */
function formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Loading skeleton for audio player
 */
function AudioPlayerSkeleton({ index }: { index: number }) {
    return (
        <div
            className="relative bg-landing-surface-dark dark:bg-landing-surface-dark rounded-xl md:rounded-2xl p-4 md:p-6 animate-pulse"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Play Button Skeleton */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700/50" />
                
                {/* Content Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-16 bg-gray-700/50 rounded" />
                        <div className="h-3 w-32 bg-gray-700/30 rounded hidden sm:block" />
                    </div>
                    <div className="h-4 w-full bg-gray-700/30 rounded" />
                    <div className="h-1 w-full bg-gray-700/50 rounded-full" />
                    <div className="flex justify-between">
                        <div className="h-3 w-8 bg-gray-700/30 rounded" />
                        <div className="h-3 w-8 bg-gray-700/30 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Empty state when no public jobs are available
 */
function EmptyShowcase() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Volume2 className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-landing-subtext-light dark:text-landing-subtext-dark mb-2">
                No audio samples yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Community members haven't donated any audio yet. Be the first to share your creations!
            </p>
        </div>
    )
}

/**
 * Audio Showcase Section Component
 */
export const AudioShowcase: React.FC<{ handleOpenModal: () => void }> = ({ handleOpenModal }) => {
    const { data: jobs, isLoading, error } = usePublicShowcaseJobs(12)
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)

    // Handle stopping playback when another player starts
    const handlePlay = useCallback((jobId: string) => {
        setCurrentlyPlayingId(jobId)
    }, [])

    const handleStop = useCallback((jobId: string) => {
        if (currentlyPlayingId === jobId) {
            setCurrentlyPlayingId(null)
        }
    }, [currentlyPlayingId])

    return (
        <section className="audio-showcase-section relative py-16 md:py-24 bg-gradient-to-b from-landing-surface-light dark:from-landing-surface-dark to-landing-bg-light dark:to-landing-bg-dark overflow-hidden">
            {/* Gradient transition overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-landing-surface-light dark:from-landing-surface-dark to-transparent" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Minimalist Header */}
                <div className="mb-12 md:mb-20 text-center">
                    <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-medium mb-3 md:mb-4">
                        Listen to the Community
                    </h2>
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark text-sm md:text-lg px-2">
                        Audio generated with SONA, donated by the users. Each unique, each professional.
                    </p>
                </div>

                {/* Audio Players Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 6 }).map((_, index) => (
                            <AudioPlayerSkeleton key={index} index={index} />
                        ))
                    ) : error ? (
                        // Error state
                        <div className="col-span-full text-center py-8">
                            <p className="text-red-400">Failed to load audio samples. Please try again later.</p>
                        </div>
                    ) : !jobs || jobs.length === 0 ? (
                        // Empty state
                        <EmptyShowcase />
                    ) : (
                        // Audio players
                        jobs.map((job, index) => (
                            <AudioPlayer
                                key={job.id}
                                job={job}
                                index={index}
                                isOtherPlaying={currentlyPlayingId !== null && currentlyPlayingId !== job.id}
                                onPlay={() => handlePlay(job.id)}
                                onStop={() => handleStop(job.id)}
                            />
                        ))
                    )}
                </div>
            </div>
            
            {/* CTA Button */}
            <div className='mt-8 md:mt-12 flex flex-col w-full gap-2 px-4'>
                <button
                    onClick={handleOpenModal}
                    className="mx-auto bg-landing-surface-dark text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-medium transition-all shadow-primary/25 flex items-center justify-center gap-2 group animate-fadeIn"
                >
                    Join the BETA
                </button>
            </div>
        </section>
    )
}

/**
 * Individual Audio Player Props
 */
interface AudioPlayerProps {
    job: PublicShowcaseJob
    index: number
    isOtherPlaying: boolean
    onPlay: () => void
    onStop: () => void
}

/**
 * Individual Audio Player Component
 */
function AudioPlayer({ job, index, isOtherPlaying, onPlay, onStop }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [audioDuration, setAudioDuration] = useState<number | null>(null)
    const [hasError, setHasError] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const category = getModeCategory(job.mode)
    const colors = CATEGORY_COLORS[category]
    
    // Use actual audio duration if loaded, otherwise use job duration
    const displayDuration = audioDuration ?? job.duration

    // Stop playback when another player starts
    useEffect(() => {
        if (isOtherPlaying && isPlaying && audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }, [isOtherPlaying, isPlaying])

    const handlePlayPause = async () => {
        if (!audioRef.current) return

        if (hasError) {
            // Reset error state and try again
            setHasError(false)
        }

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
            onStop()
        } else {
            setIsLoading(true)
            try {
                await audioRef.current.play()
                setIsPlaying(true)
                onPlay()
            } catch (error) {
                console.error('Audio playback failed:', error)
                setHasError(true)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateProgress = () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100
                setProgress(progress)
                setCurrentTime(audio.currentTime)
            }
        }

        const handleLoadedMetadata = () => {
            setAudioDuration(audio.duration)
            setIsLoading(false)
        }

        const handleCanPlay = () => {
            setIsLoading(false)
        }

        const handleEnd = () => {
            setIsPlaying(false)
            setProgress(0)
            setCurrentTime(0)
            onStop()
        }

        const handleError = () => {
            setHasError(true)
            setIsLoading(false)
            setIsPlaying(false)
        }

        const handleWaiting = () => {
            setIsLoading(true)
        }

        const handlePlaying = () => {
            setIsLoading(false)
        }

        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('ended', handleEnd)
        audio.addEventListener('error', handleError)
        audio.addEventListener('waiting', handleWaiting)
        audio.addEventListener('playing', handlePlaying)

        return () => {
            audio.removeEventListener('timeupdate', updateProgress)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('canplay', handleCanPlay)
            audio.removeEventListener('ended', handleEnd)
            audio.removeEventListener('error', handleError)
            audio.removeEventListener('waiting', handleWaiting)
            audio.removeEventListener('playing', handlePlaying)
        }
    }, [onStop])

    // Display text
    const promptText = job.enhanced_prompt || job.prompt
    const filename = job.filename || `SONA_${job.mode}_audio`

    return (
        <div
            className={`group relative bg-landing-surface-dark dark:bg-landing-surface-dark ${colors.hover} rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-500 ${colors.glow}`}
            style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0,
            }}
        >
            <audio
                ref={audioRef}
                src={job.audioUrl}
                preload="metadata"
                crossOrigin="anonymous"
            />

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Play Button */}
                <button
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${colors.border} ${colors.bg} ${colors.text} flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying ? 'shadow-lg' : ''}`}
                >
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : hasError ? (
                        <span className="text-xs">!</span>
                    ) : isPlaying ? (
                        <Pause className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                    ) : (
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Mode Badge & Filename */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <span className={`text-[10px] sm:text-xs font-mono ${colors.text} tracking-wider`}>
                            {category.toUpperCase()}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-gray-500 dark:text-gray-500 truncate hidden sm:inline">
                            {filename}
                        </span>
                    </div>

                    {/* Prompt */}
                    <p className="text-xs sm:text-sm text-landing-subtext-light dark:text-landing-subtext-dark font-light mb-2 sm:mb-3 line-clamp-1">
                        "{promptText}"
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
                            {formatDuration(displayDuration)}
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

// Add animation keyframes in global CSS if not already present
if (typeof document !== 'undefined') {
    const styleId = 'audio-showcase-animations'
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
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
    }
}
