/**
 * Announcement Modal Component
 * 
 * Shows announcements and news to users on first visit.
 * Uses localStorage to track if the user has seen the announcement.
 * Only shows when the user is authenticated.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../lib/hooks'

const ANNOUNCEMENT_VERSION = '0.1.0 BETA'
const STORAGE_KEY = `sona-announcement-seen-${ANNOUNCEMENT_VERSION}`

const VERSION_FEATURES = [
    'AI-powered audio generation with Stable Audio',
    'Real-time waveform visualization',
    'Download generated sounds as WAV or MP3',
    'Sound library to manage your creations',
    'VST3 and Standalone support',
]

export function AnnouncementModal() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session, isLoading } = useSession()

    useEffect(() => {
        // Only show announcement when user is authenticated and session is loaded
        if (!isLoading && session?.user) {
            const hasSeenAnnouncement = localStorage.getItem(STORAGE_KEY)
            if (!hasSeenAnnouncement) {
                setIsOpen(true)
            }
        }
    }, [session, isLoading])

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setIsOpen(false)
    }

    const handleReadReleaseNotes = () => {
        window.open('https://github.com/your-repo/sona/releases/tag/v0.1.0', '_blank')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[#36795E] rounded-2xl p-6 shadow-2xl max-w-md w-full border border-[#F6E092]/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="text-center mb-5">
                            {/* <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E47640] rounded-full mb-3">
                                <svg className="w-7 h-7 text-[#EFEDD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div> */}
                            <h2 className="text-xl font-bold text-[#F6E092]">Welcome to Sona!</h2>
                            <p className="text-[#EFEDD7]/60 text-sm mt-1">Thanks for testing v{ANNOUNCEMENT_VERSION}</p>
                        </div>

                        {/* Creator Tier Message */}
                        <div className="bg-gradient-to-r from-[#692A12]/40 to-[#F6E092]/80 rounded-xl p-4 mb-5">
                            <div className="flex items-center gap-3">
                                {/* <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-[#F6E092]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div> */}
                                <div className='flex flex-col w-full'>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="text-[#F6E092] font-semibold">Beta Tester Tier Upgrade</p>
                                        <span className="bg-gradient-to-r from-[#F6E092] to-[#FFFFFF] text-[#133A28] text-xs font-bold px-2 py-0.5 rounded-full">
                                            Creator
                                        </span>
                                    </div>
                                    <p className="text-[#EFEDD7]/70 text-sm">
                                        You have <span className="text-[#F6E092] font-medium">unlimited</span> audio generation!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="mb-5">
                            <p className="text-[#EFEDD7]/60 text-xs font-medium uppercase tracking-wide mb-3">
                                What's new in v{ANNOUNCEMENT_VERSION}
                            </p>
                            <ul className="space-y-2">
                                {VERSION_FEATURES.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-[#EFEDD7]/80">
                                        <svg className="w-4 h-4 text-[#F6E092] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-2">
                            <button
                                disabled
                                onClick={handleReadReleaseNotes}
                                className="w-full bg-[#133A28]/30 text-[#EFEDD7]/40 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg> */}
                                Release Notes
                                <span className="text-xs opacity-60">(Coming soon)</span>
                            </button>

                            <button
                                disabled
                                className="w-full bg-[#133A28]/30 text-[#EFEDD7]/40 font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg> */}
                                Sona Policies
                                <span className="text-xs opacity-60">(Coming soon)</span>
                            </button>

                            <button
                                onClick={handleClose}
                                className="w-full bg-[#E47640] hover:bg-[#E47640]/90 text-[#EFEDD7] font-bold py-3 px-4 rounded-xl transition-colors text-sm mt-3"
                            >
                                Let's Go!
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
