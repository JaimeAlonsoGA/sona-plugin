/**
 * Sounds Page
 * 
 * Shows all previously generated sounds with instant playback.
 * Fetches real data from Supabase using TanStack Query.
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Music, Calendar, Clock, RefreshCw } from 'lucide-react'
import { AudioPlayer } from '../components/audio-player'
import { ROUTES } from '../routes'
import { getStorageUrl } from '../lib/utils'
import { useCompletedJobs } from '../lib/hooks'
import type { Job } from '../types/jobs'

// Sound Card Component with integrated player
function SoundCard({ job, index }: { job: Job & { preview_path: string }; index: number }) {
    // Get audio URL from storage path
    const audioUrl = useMemo(() => {
        return getStorageUrl(job.preview_path)
    }, [job.preview_path])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.3) }}
            className="bg-[#36795E] rounded-2xl overflow-hidden shadow-lg"
        >
            {/* Sound Info */}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[#EFEDD7] text-sm font-medium leading-snug mb-1.5">
                            {job.prompt}
                        </p>
                        <div className="flex items-center gap-3 text-[#EFEDD7]/50 text-xs">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(job.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(job.created_at)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-[#133A28]/50 rounded text-[10px] uppercase">
                                {job.quality}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio Player - Always visible */}
            <div className="px-4 pb-4">
                <AudioPlayer
                    audioUrl={audioUrl}
                    filename={`sona-${job.prompt.slice(0, 20).replace(/\s+/g, '-')}`}
                    showSaveButton={true}
                    showCopyButton={true}
                    compact={true}
                />
            </div>
        </motion.div>
    )
}

// Loading skeleton for sound cards
function SoundCardSkeleton() {
    return (
        <div className="bg-[#36795E] rounded-2xl overflow-hidden shadow-lg animate-pulse">
            <div className="p-4 pb-3">
                <div className="h-4 bg-[#133A28]/30 rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#133A28]/30 rounded w-1/2" />
            </div>
            <div className="px-4 pb-4">
                <div className="h-10 bg-[#133A28]/30 rounded-xl" />
            </div>
        </div>
    )
}

export default function SoundsPage() {
    const navigate = useNavigate()
    const { data: completedJobs, isLoading, isError, refetch, isFetching, completedCount } = useCompletedJobs()

    return (
        <div className="page bg-[#467A5D] p-4 flex flex-col">
            <div className="max-w-3xl mx-auto flex flex-col flex-1 gap-3 w-full overflow-hidden">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <button
                        onClick={() => navigate(ROUTES.PROFILE)}
                        className="text-[#EFEDD7]/60 hover:text-[#EFEDD7] transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-[#F6E092]">Generated Sounds</h1>
                        <p className="text-[#EFEDD7]/50 text-sm">
                            {isLoading ? 'Loading...' : `${completedCount} sounds in your library`}
                        </p>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="text-[#EFEDD7]/60 hover:text-[#EFEDD7] transition-colors p-2 rounded-lg hover:bg-[#133A28]/30"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </motion.div>

                {/* Error State */}
                {isError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center"
                    >
                        <p className="text-red-400 mb-3">Failed to load sounds</p>
                        <button
                            onClick={() => refetch()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-3">
                        <SoundCardSkeleton />
                        <SoundCardSkeleton />
                        <SoundCardSkeleton />
                    </div>
                )}

                {/* Sounds List */}
                {!isLoading && !isError && (
                    <div className="scrollable space-y-3 flex-1 pb-4">
                        {completedJobs && completedJobs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#36795E] rounded-2xl p-12 text-center"
                            >
                                <Music className="w-16 h-16 mx-auto mb-4 text-[#EFEDD7]/30" />
                                <h3 className="text-[#EFEDD7] font-medium mb-2">No sounds yet</h3>
                                <p className="text-[#EFEDD7]/50 text-sm mb-4">
                                    Start generating sounds from the main page
                                </p>
                                <button
                                    onClick={() => navigate(ROUTES.HOME)}
                                    className="bg-[#E47640] text-[#EFEDD7] px-6 py-2 rounded-lg font-medium hover:bg-[#E47640]/90 transition-colors"
                                >
                                    Create Sound
                                </button>
                            </motion.div>
                        ) : (
                            completedJobs?.map((job, index) => (
                                <SoundCard key={job.id} job={job} index={index} />
                            ))
                        )}
                    </div>
                )}

                {/* Back to Generator Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center pt-4"
                >
                    <button
                        onClick={() => navigate(ROUTES.HOME)}
                        className="text-[#EFEDD7]/50 hover:text-[#EFEDD7] text-sm transition-colors"
                    >
                            Explore Sound Generation
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
