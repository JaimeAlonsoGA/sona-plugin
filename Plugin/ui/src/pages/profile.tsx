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
        <div className="page bg-[#467A5D] p-4 flex flex-col">
            <div className="max-w-4xl mx-auto flex flex-col flex-1 gap-3 w-full overflow-hidden">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <button
                        onClick={() => navigate(ROUTES.HOME)}
                        className="text-[#EFEDD7]/60 hover:text-[#EFEDD7] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-[#F6E092]">Profile</h1>
                </motion.div>

                {/* Top Card - Generated Sounds (Link to /sounds) */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate(ROUTES.SOUNDS)}
                    className="w-full bg-[#36795E] rounded-2xl p-5 shadow-xl text-left hover:bg-[#36795E]/90 transition-colors group"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#F6E092] flex items-center gap-2">
                            Generated Sounds
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[#EFEDD7]/50 text-sm">
                                {isLoadingJobs ? '...' : `${completedCount} sounds`}
                            </span>
                            <svg
                                className="w-5 h-5 text-[#EFEDD7]/40 group-hover:text-[#F6E092] group-hover:translate-x-1 transition-all"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-[#EFEDD7]/50 text-sm mt-2">
                        View and download your previously generated audio
                    </p>
                    {/* {totalGenerations > completedCount && (
                        <p className="text-[#EFEDD7]/30 text-xs mt-1">
                            {totalGenerations - completedCount} jobs pending or failed
                        </p>
                    )} */}
                </motion.button>

                {/* Bottom Grid - User Info & Subscription */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch flex-1">
                    {/* Left Column - Account Card + PROTOTIP */}
                    <div className="flex flex-col justify-between mb-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#36795E] rounded-2xl shadow-xl w-full"
                        >
                            <h2 className="text-lg font-semibold text-[#F6E092] mb-4 flex items-center gap-2">
                                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg> */}
                                Account
                            </h2>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-[#E47640] rounded-full flex items-center justify-center text-[#EFEDD7] text-xl font-bold shadow-lg">
                                    {userInitial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#EFEDD7] font-medium truncate">
                                        {user?.email}
                                    </p>
                                    <p className="text-[#EFEDD7]/50 text-sm">
                                        Since {user?.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            {/* Account ID */}
                            <div className="bg-[#133A28]/30 rounded-lg p-3 mb-4">
                                <p className="text-[#EFEDD7]/40 text-xs mb-1">Account ID</p>
                                <p className="text-[#EFEDD7]/80 text-xs font-mono truncate">
                                    {user?.id}
                                </p>
                            </div>

                            {/* Sign Out Button */}
                            <button
                                onClick={() => signOutMutation.mutate()}
                                disabled={signOutMutation.isPending}
                                className="w-full bg-[#133A28] hover:bg-[#133A28]/80 disabled:opacity-50 text-[#EFEDD7] font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                {signOutMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing out...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </>
                                )}
                            </button>
                        </motion.div>
                        <div className='flex flex-row gap-4 items-end'>
                            <span
                                className="text-[#F6E092] text-7xl font-bold tracking-wider">
                                SONA
                            </span>
                            <p className='text-xs text-[#F6E092]/40'>Designer Edition v.0.1.0 Powered by Stable Audio</p>
                        </div>
                        <div className="text-[#2A3E40] text-5xl font-extrabold tracking-wider">
                            PROTOTIP
                        </div>
                    </div>

                    {/* Right - Subscription Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#36795E] rounded-2xl p-5 shadow-xl"
                    >
                        <h2 className="text-lg font-semibold text-[#F6E092] mb-4 flex items-center gap-2">
                            {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> */}
                            Subscription
                        </h2>

                        {/* Current Tier */}
                        <div className="bg-gradient-to-r from-[#692A12]/40 to-[#F6E092]/80 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[#EFEDD7]/60 text-sm">Current Plan</span>
                                <span className="bg-gradient-to-r from-[#F6E092] to-[#FFFFFF] text-[#133A28] text-xs font-bold px-2 py-0.5 rounded-full">
                                    {mockSubscription.tier}
                                </span>
                            </div>
                            <p className="text-[#EFEDD7]/40 text-xs">
                                Renews {mockSubscription.renewsAt}
                            </p>
                        </div>

                        {/* Tokens */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#EFEDD7] text-sm font-medium">Tokens Remaining</span>
                                <span className="text-[#F6E092] font-bold">{tokensLeft}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-3 bg-[#133A28]/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - tokensPercentage}%` }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-[#F6E092] to-[#E47640] rounded-full"
                                />
                            </div>
                            <p className="text-[#EFEDD7]/40 text-xs mt-1">
                                {mockSubscription.tokensUsed} of {mockSubscription.tokensTotal} used this period
                            </p>
                        </div>

                        {/* Tier Options */}
                        <div className="relative">
                            <div className="absolute inset-0 flex flex-col px-10 items-center justify-center gap-2 bg-[#133A28]/20 rounded-lg">
                                <p className='font-bold animate-pulse'>
                                    Coming Soon
                                </p>
                                <p className='text-xs text-center font-mono text-[#EFEDD7]/80'>
                                    This is a Beta version of SONA. Complete features will be available in future updates.
                                </p>
                            </div>
                            <div className='space-y-2 blur-lg'>
                                <p className="text-[#EFEDD7]/60 text-xs font-medium uppercase tracking-wide">Available Tiers</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[#133A28]/30 rounded-lg p-2.5 text-center border border-transparent hover:border-[#F6E092]/30 transition-colors cursor-pointer">
                                        <p className="text-[#EFEDD7] text-sm font-medium">Starter</p>
                                        <p className="text-[#EFEDD7]/40 text-xs">100 tokens</p>
                                    </div>
                                    <div className="bg-[#133A28]/30 rounded-lg p-2.5 text-center border-2 border-[#E47640] cursor-pointer">
                                        <p className="text-[#F6E092] text-sm font-medium">Creator</p>
                                        <p className="text-[#EFEDD7]/40 text-xs">500 tokens</p>
                                    </div>
                                    <div className="bg-[#133A28]/30 rounded-lg p-2.5 text-center border border-transparent hover:border-[#F6E092]/30 transition-colors cursor-pointer">
                                        <p className="text-[#EFEDD7] text-sm font-medium">Pro</p>
                                        <p className="text-[#EFEDD7]/40 text-xs">2000 tokens</p>
                                    </div>
                                    <div className="bg-[#133A28]/30 rounded-lg p-2.5 text-center border border-transparent hover:border-[#F6E092]/30 transition-colors cursor-pointer">
                                        <p className="text-[#EFEDD7] text-sm font-medium">Studio</p>
                                        <p className="text-[#EFEDD7]/40 text-xs">Unlimited</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Version Info */}
                {/* <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-[#EFEDD7]/30 text-xs"
                >
                    Sona v0.1.0 • Powered by Stable Audio
                </motion.p> */}
            </div>
        </div>
    )
}
