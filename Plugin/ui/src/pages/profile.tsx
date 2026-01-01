/**
 * Profile Page
 * 
 * Shows user account information, subscription, and generated sounds.
 * Fetches real data from Supabase using TanStack Query.
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession, useSignOut, useCompletedJobs } from '../lib/hooks'
import { ROUTES } from '../routes'
import { ChevronLeft, ChevronRight, LogOut, Music, Loader2 } from 'lucide-react'

// Mock subscription data - TODO: replace with real subscription data
const mockSubscription = {
    tier: 'Creator',
    tokensUsed: 0,
    tokensTotal: Infinity,
    renewsAt: '2030-01-15',
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const { data: session } = useSession()
    const signOutMutation = useSignOut({
        onSuccess: () => navigate(ROUTES.AUTH),
    })

    // Fetch user's jobs - this data is shared with /sounds page via TanStack Query cache
    const { completedCount, isLoading: isLoadingJobs } = useCompletedJobs()

    const user = session?.user
    const userInitial = user?.email?.charAt(0).toUpperCase() || '?'
    const tokensLeft = mockSubscription.tokensTotal - mockSubscription.tokensUsed
    const tokensPercentage = (mockSubscription.tokensUsed / mockSubscription.tokensTotal) * 100

    return (
        <div className="page bg-[#1a1a1a] flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-4 px-5 py-3 border-b border-[#2a2a2a]">
                <button
                    onClick={() => navigate(ROUTES.HOME)}
                    className="text-[#EFEDD7]/60 hover:text-[#EFEDD7] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-[#EFEDD7]">Profile</h1>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-5">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* User Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#E47640] to-[#692A12] rounded-full flex items-center justify-center text-white text-lg font-bold">
                                {userInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[#EFEDD7] font-medium truncate">
                                    {user?.email}
                                </p>
                                <p className="text-[#EFEDD7]/40 text-sm">
                                    Member since {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString()
                                        : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Generated Sounds */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => navigate(ROUTES.SOUNDS)}
                        className="w-full bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a] hover:border-[#E47640]/30 transition-colors text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#467A5D]/20 rounded-lg flex items-center justify-center">
                                    <Music className="w-5 h-5 text-[#467A5D]" />
                                </div>
                                <div>
                                    <p className="text-[#EFEDD7] font-medium">Generated Sounds</p>
                                    <p className="text-[#EFEDD7]/40 text-sm">
                                        {isLoadingJobs ? 'Loading...' : `${completedCount} sounds in library`}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#EFEDD7]/30 group-hover:text-[#E47640] group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </motion.button>

                    {/* Subscription Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[#EFEDD7] font-medium">Subscription</h2>
                            <span className="bg-gradient-to-r from-[#F6E092] to-[#E47640] text-[#1a1a1a] text-xs font-bold px-2.5 py-1 rounded-full">
                                {mockSubscription.tier}
                            </span>
                        </div>

                        {/* Tokens */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#EFEDD7]/60 text-sm">Tokens Remaining</span>
                                <span className="text-[#F6E092] font-semibold">{tokensLeft === Infinity ? '∞' : tokensLeft}</span>
                            </div>
                            <div className="h-2 bg-[#3a3a3a] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - tokensPercentage}%` }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-[#467A5D] to-[#E47640] rounded-full"
                                />
                            </div>
                        </div>

                        <p className="text-[#EFEDD7]/30 text-xs">
                            Renews {mockSubscription.renewsAt}
                        </p>
                    </motion.div>

                    {/* Coming Soon */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-[#2a2a2a]/50 rounded-xl p-4 border border-dashed border-[#3a3a3a]"
                    >
                        <p className="text-[#EFEDD7]/60 text-sm text-center">
                            <span className="text-[#F6E092]">More features coming soon</span>
                            <br />
                            <span className="text-xs text-[#EFEDD7]/40">This is a Beta version of SONA</span>
                        </p>
                    </motion.div>

                    {/* Sign Out */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => signOutMutation.mutate()}
                        disabled={signOutMutation.isPending}
                        className="w-full bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a] hover:border-red-500/30 transition-colors text-left group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3">
                            {signOutMutation.isPending ? (
                                <Loader2 className="w-5 h-5 text-[#EFEDD7]/60 animate-spin" />
                            ) : (
                                <LogOut className="w-5 h-5 text-[#EFEDD7]/60 group-hover:text-red-400 transition-colors" />
                            )}
                            <span className="text-[#EFEDD7]/60 group-hover:text-red-400 transition-colors">
                                {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                            </span>
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Footer */}
            <footer className="px-5 py-3 border-t border-[#2a2a2a] text-center">
                <p className="text-[#EFEDD7]/20 text-xs">
                    SONA v0.1.0 • by Prototip • Powered by Stable Audio
                </p>
            </footer>
        </div>
    )
}
