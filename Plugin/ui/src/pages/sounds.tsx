/**
 * Sounds Page
 * 
 * Shows all previously generated sounds with instant playback.
 * Fetches real data from Supabase using TanStack Query.
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Music, Calendar, Clock, RefreshCw, Wand2 } from 'lucide-react'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.2) }}
            className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] overflow-hidden"
        >
            {/* Sound Info */}
            <div className="p-3 pb-2">
                <p className="text-[#EFEDD7] text-sm font-medium leading-snug mb-2 line-clamp-2">
                    {job.prompt}
                </p>
                <div className="flex items-center gap-3 text-[#EFEDD7]/40 text-xs">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(job.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(job.created_at)}
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#467A5D]/20 text-[#467A5D] rounded text-[10px] uppercase font-medium">
                        {job.quality}
                    </span>
                </div>
            </div>

            {/* Audio Player */}
            <div className="px-3 pb-3">
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
        <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] overflow-hidden animate-pulse">
            <div className="p-3 pb-2">
                <div className="h-4 bg-[#3a3a3a] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#3a3a3a] rounded w-1/2" />
            </div>
            <div className="px-3 pb-3">
                <div className="h-10 bg-[#3a3a3a] rounded-lg" />
            </div>
        </div>
    )
}

export default function SoundsPage() {
    const navigate = useNavigate()
    const { data: completedJobs, isLoading, isError, refetch, isFetching, completedCount } = useCompletedJobs()

    return (
        <div className="page bg-[#1a1a1a] flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-4 px-5 py-3 border-b border-[#2a2a2a]">
                <button
                    onClick={() => navigate(ROUTES.PROFILE)}
                    className="text-[#EFEDD7]/60 hover:text-[#EFEDD7] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-[#EFEDD7]">Generated Sounds</h1>
                    <p className="text-[#EFEDD7]/40 text-xs">
                        {isLoading ? 'Loading...' : `${completedCount} sounds in your library`}
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-2 text-[#EFEDD7]/40 hover:text-[#EFEDD7] hover:bg-[#2a2a2a] rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    {/* Error State */}
                    {isError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center"
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
                        <>
                            <SoundCardSkeleton />
                            <SoundCardSkeleton />
                            <SoundCardSkeleton />
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && completedJobs?.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-10 text-center"
                        >
                            <Music className="w-12 h-12 mx-auto mb-4 text-[#EFEDD7]/20" />
                            <h3 className="text-[#EFEDD7] font-medium mb-2">No sounds yet</h3>
                            <p className="text-[#EFEDD7]/40 text-sm mb-4">
                                Generate your first sound to get started
                            </p>
                            <button
                                onClick={() => navigate(ROUTES.HOME)}
                                className="inline-flex items-center gap-2 bg-[#E47640] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#E47640]/90 transition-colors"
                            >
                                <Wand2 className="w-4 h-4" />
                                Create Sound
                            </button>
                        </motion.div>
                    )}

                    {/* Sounds List */}
                    {!isLoading && !isError && completedJobs && completedJobs.length > 0 && (
                        completedJobs.map((job, index) => (
                            <SoundCard key={job.id} job={job} index={index} />
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="px-5 py-2 border-t border-[#2a2a2a]">
                <button
                    onClick={() => navigate(ROUTES.HOME)}
                    className="w-full text-center text-[#EFEDD7]/40 hover:text-[#E47640] text-xs transition-colors py-1"
                >
                    ← Back to Generator
                </button>
            </footer>
        </div>
    )
}
