/**
 * Community Page
 * 
 * Public page showing:
 * - Community stats (total users, generations)
 * - Activity feed (beta joins with witty messages)
 * - User posts section (tips, prompts, audio showcases)
 * 
 * Note: Nav, Footer, and BetaModal are provided by WebsiteLayout
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    AudioWaveform,
    MessageCircle,
    Send,
    Music2,
    Sparkles,
    Clock,
    Play,
    Pause,
    Trash2,
    X,
    Check,
    Link2,
    Loader2
} from 'lucide-react'
import { useAccessGate } from '@/hooks/use-access-gate'
import { useSession, useLatestJob } from '@/lib/hooks'
import {
    useCommunityStats,
    useCommunityActivity,
    useCommunityPostsList,
    useCreateCommunityPost,
    useDeleteCommunityPost,
} from '@/lib/hooks/use-community'
import type { CommunityPost } from '@/lib/api/community'

// ============================================
// STATS SECTION
// ============================================

function StatsSection() {
    const { data: stats, isLoading } = useCommunityStats()

    const statCards = [
        {
            label: 'Beta Testers',
            value: stats?.total_users ?? 0,
            icon: Users,
            color: 'var(--sona-designer)',
        },
        {
            label: 'Sounds Generated',
            value: stats?.total_generations ?? 0,
            icon: AudioWaveform,
            color: 'var(--sona-producer)',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex flex-col items-center border-8 border-primary bg-landing-surface-dark dark:bg-landing-surface-light rounded-xl md:rounded-2xl p-4 md:p-6 dark:border-white/10"
                >
                    <span className="uppercase text-center text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                        {stat.label}
                    </span>
                    <div className="text-3xl md:text-4xl font-bold font-mono text-landing-surface-light">
                        {isLoading ? (
                            <span className="animate-pulse">---</span>
                        ) : (
                            stat.value.toLocaleString()
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// ============================================
// ACTIVITY FEED SECTION
// ============================================

function ActivityFeed() {
    const { data: activities, isLoading } = useCommunityActivity(15)

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-landing-surface-light dark:bg-landing-surface-dark rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-landing-subtext-light dark:text-landing-subtext-dark">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for the first beta testers...</p>
            </div>
        )
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence mode="popLayout">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-landing-surface-light/50 dark:bg-landing-surface-dark/50 border border-gray-100 dark:border-white/5"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--sona-designer)] to-[var(--sona-creator)] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                                {activity.display_name.charAt(0).toUpperCase()}
                            </span>
                        </div>  
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-landing-text-light/80 dark:text-landing-text-dark">
                                {activity.message_template}
                            </p>
                            <p className="text-xs text-landing-subtext-dark dark:text-landing-subtext-dark flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(activity.created_at)}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

// ============================================
// POST CARD COMPONENT
// ============================================

function PostCard({
    post,
    currentUserId,
    onDelete
}: {
    post: CommunityPost
    currentUserId?: string
    onDelete: (id: string) => void
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const handlePlayPause = () => {
        if (!audioRef.current || !post.audio_url) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const isOwner = currentUserId && post.user_id === currentUserId

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-4 md:p-5 border border-gray-200 dark:border-white/10"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--sona-producer)] to-[var(--sona-creator)] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {post.author_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-sm">{post.author_name}</span>
                        <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                            {formatRelativeTime(post.created_at)}
                        </p>
                    </div>
                </div>
                {isOwner && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-landing-subtext-light dark:text-landing-subtext-dark hover:text-red-500 transition-colors"
                        title="Delete post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Message */}
            <p className="text-sm md:text-base text-landing-text-light dark:text-landing-text-dark mb-3 whitespace-pre-wrap">
                {post.message}
            </p>

            {/* Audio attachment */}
            {post.has_audio && post.audio_url && (
                <div className="bg-landing-bg-light dark:bg-landing-bg-dark rounded-lg p-3 border border-gray-100 dark:border-white/5">
                    <audio ref={audioRef} src={post.audio_url} onEnded={() => setIsPlaying(false)} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePlayPause}
                            className="w-10 h-10 rounded-full bg-[var(--sona-producer)]/10 text-[var(--sona-producer)] flex items-center justify-center hover:bg-[var(--sona-producer)]/20 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4" fill="currentColor" />
                            ) : (
                                <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                            )}
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark truncate">
                                <Music2 className="w-3 h-3 inline mr-1" />
                                {post.audio_prompt || 'Generated audio'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

// ============================================
// CREATE POST FORM
// ============================================

function CreatePostForm({ onClose }: { onClose: () => void }) {
    const [message, setMessage] = useState('')
    const [includeAudio, setIncludeAudio] = useState(false)

    const { data: latestJob, isLoading: isLoadingJob } = useLatestJob()
    const createPost = useCreateCommunityPost()

    // Truncate prompt for display
    const truncatePrompt = (prompt: string, maxLength = 50) => {
        if (prompt.length <= maxLength) return prompt
        return prompt.substring(0, maxLength) + '...'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (message.trim().length < 10) return

        const result = await createPost.mutateAsync({
            message: message.trim(),
            attached_job_id: includeAudio && latestJob ? latestJob.id : null,
        })

        if (result.success) {
            setMessage('')
            setIncludeAudio(false)
            onClose()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl p-4 md:p-5 border border-primary/30 mb-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Share with the community</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a tip, prompt, or showcase your audio creation..."
                    className="w-full h-24 md:h-32 p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10 resize-none text-sm focus:outline-none focus:border-primary/50"
                    maxLength={1000}
                />

                <div className="flex items-center justify-between mt-3 text-xs text-landing-subtext-light dark:text-landing-subtext-dark">
                    <span>{message.length}/1000</span>
                    <span className={message.length < 10 ? 'text-red-500' : ''}>
                        Min 10 characters
                    </span>
                </div>

                {/* Audio attachment - same pattern as feedback page */}
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                        Attach audio (optional)
                    </label>

                    {isLoadingJob ? (
                        <div className="p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-landing-subtext-light dark:text-landing-subtext-dark" />
                                <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                    Loading your latest generation...
                                </span>
                            </div>
                        </div>
                    ) : latestJob ? (
                        <button
                            type="button"
                            onClick={() => setIncludeAudio(!includeAudio)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                                includeAudio
                                    ? 'bg-primary/10 border-2 border-primary'
                                    : 'bg-landing-bg-light dark:bg-landing-bg-dark border-2 border-transparent hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    includeAudio
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300 dark:border-white/30'
                                }`}>
                                    {includeAudio && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Music2 className="w-4 h-4 text-landing-subtext-light dark:text-landing-subtext-dark" />
                                        <span className="text-sm font-medium">
                                            Include last generation
                                        </span>
                                    </div>
                                    <p className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark mb-2">
                                        Share your most recent audio with your post
                                    </p>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-black/20">
                                        <Link2 className="w-3 h-3 text-landing-subtext-light dark:text-landing-subtext-dark flex-shrink-0" />
                                        <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark truncate">
                                            "{truncatePrompt(latestJob.prompt)}"
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="p-3 rounded-lg bg-landing-bg-light dark:bg-landing-bg-dark border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <Music2 className="w-4 h-4 text-landing-subtext-light dark:text-landing-subtext-dark" />
                                <span className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                    No recent generations to attach
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={message.trim().length < 10 || createPost.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {createPost.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Post
                            </>
                        )}
                    </button>
                </div>

                {createPost.isError && (
                    <p className="mt-2 text-sm text-red-500">
                        {(createPost.error as Error)?.message || 'Failed to create post'}
                    </p>
                )}
            </form>
        </motion.div>
    )
}

// ============================================
// POSTS SECTION
// ============================================

function PostsSection() {
    const [showCreateForm, setShowCreateForm] = useState(false)

    const { data: session } = useSession()
    const { hasAccess, openModal } = useAccessGate()
    const { data: posts, isLoading } = useCommunityPostsList(30)
    const deletePost = useDeleteCommunityPost()

    const handleCreateClick = () => {
        if (!session) {
            openModal()
            return
        }
        if (!hasAccess) {
            openModal()
            return
        }
        setShowCreateForm(true)
    }

    const handleDelete = async (postId: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost.mutateAsync(postId)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    {/* <MessageCircle className="w-5 h-5 text-[var(--sona-creator)]" /> */}
                    Community Posts
                </h2>
                {!showCreateForm && (
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        Share
                    </button>
                )}
            </div>

            {/* Beta requirement notice */}
            {!hasAccess && (
                <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-4">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Join the beta to share posts with the community
                </p>
            )}

            {/* Create form */}
            <AnimatePresence>
                {showCreateForm && hasAccess && (
                    <CreatePostForm onClose={() => setShowCreateForm(false)} />
                )}
            </AnimatePresence>

            {/* Posts list */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-landing-surface-light dark:bg-landing-surface-dark rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={session?.user?.id}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-landing-surface-light/50 dark:bg-landing-surface-dark/50 rounded-xl">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-landing-subtext-light dark:text-landing-subtext-dark">
                        No posts yet. Be the first to share!
                    </p>
                </div>
            )}
        </div>
    )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function CommunityPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[var(--sona-creator)] via-[var(--sona-producer)] to-[var(--sona-designer)] relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[var(--sona-creator)]/20 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[var(--sona-producer)]/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
                    <h2 className="font-display text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-4">
                        The Community
                    </h2>

                    <p className="text-landing-subtext-light text-base md:text-lg mb-4 px-2">
                        Join fellow sound designers, producers, and creators exploring AI audio generation.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                {/* Stats */}
                <StatsSection />

                {/* Two column layout on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed - Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-24">
                            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                                {/* <Sparkles className="w-5 h-5 text-[var(--sona-designer)]" /> */}
                                Recent Joins
                            </h2>
                            <ActivityFeed />
                        </div>
                    </div>

                    {/* Posts - Main content */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <PostsSection />
                    </div>
                </div>
            </main>
        </>
    )
}
