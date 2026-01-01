import { useMemo, useState, useRef, useEffect } from "react"
import { Play, Pause, Download, Clock, Sparkles, User, Loader2, Wand2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsAuthenticated, useJobPolling, useSubmitJob } from "../lib/hooks"
import { CreateJobInput } from "../types/jobs"
import { getStorageUrl } from "../lib/utils"
import WaveSurfer from "wavesurfer.js"
import { useNavigate } from "react-router-dom"

type QualityLevel = "standard" | "high"

// Format seconds to mm:ss
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SonaPage() {
    const navigate = useNavigate()

    const [prompt, setPrompt] = useState("")
    const [currentJobId, setCurrentJobId] = useState<string | null>(null)

    // Audio generation settings
    const [duration, setDuration] = useState<number>(10)
    const [quality, setQuality] = useState<QualityLevel>("standard")

    const isAuthenticated = useIsAuthenticated()
    const submitJobMutation = useSubmitJob()

    // WaveSurfer state
    const waveformRef = useRef<HTMLDivElement>(null)
    const wavesurferRef = useRef<WaveSurfer | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [audioDuration, setAudioDuration] = useState(0)
    const [isWaveformReady, setIsWaveformReady] = useState(false)

    // Polls job status until completed or failed
    const { data: job, isLoading } = useJobPolling(
        currentJobId,
        Boolean(currentJobId)
    )

    const isGenerating = isLoading || (job?.status === "processing") || (job?.status === "queued") || (job?.status !== "completed" && currentJobId !== null)

    // Build URLs from storage paths
    const previewUrl = useMemo(() => getStorageUrl(job?.preview_path ?? null), [job?.preview_path])

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current) return

        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#467A5D',
            progressColor: '#F6E092',
            cursorColor: '#E47640',
            cursorWidth: 2,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            height: 56,
            normalize: true,
            backend: 'WebAudio',
        })

        wavesurfer.on('ready', () => {
            setAudioDuration(wavesurfer.getDuration())
            setIsWaveformReady(true)
        })

        wavesurfer.on('audioprocess', () => {
            setCurrentTime(wavesurfer.getCurrentTime())
        })

        wavesurfer.on('seeking', () => {
            setCurrentTime(wavesurfer.getCurrentTime())
        })

        wavesurfer.on('finish', () => {
            setIsPlaying(false)
            setCurrentTime(0)
        })

        wavesurfer.on('play', () => setIsPlaying(true))
        wavesurfer.on('pause', () => setIsPlaying(false))

        wavesurferRef.current = wavesurfer

        return () => {
            wavesurfer.destroy()
        }
    }, [])

    // Load audio when previewUrl changes
    useEffect(() => {
        if (wavesurferRef.current && previewUrl) {
            setIsWaveformReady(false)
            wavesurferRef.current.load(previewUrl)
        } else if (wavesurferRef.current && !previewUrl) {
            wavesurferRef.current.empty()
            setIsWaveformReady(false)
            setCurrentTime(0)
            setAudioDuration(0)
        }
    }, [previewUrl])

    const togglePlayPause = () => {
        if (!wavesurferRef.current || !previewUrl || !isWaveformReady) return
        wavesurferRef.current.playPause()
    }

    const handleSaveAudio = async () => {
        if (!previewUrl) return

        try {
            const response = await fetch(previewUrl)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `sona-${prompt.slice(0, 30).replace(/\s+/g, '-')}-${Date.now()}.mp3`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to save audio:', error)
        }
    }

    const getApiQuality = (q: QualityLevel): 'low' | 'medium' | 'high' => {
        return q === "high" ? "high" : "medium"
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!prompt.trim() || isGenerating) return

        const input: CreateJobInput = {
            prompt: prompt.trim(),
            duration: duration,
            quality: getApiQuality(quality),
            mode: "designer",
        }

        try {
            const response = await submitJobMutation.mutateAsync(input)
            setCurrentJobId(response.job_id)
        } catch (error) {
            console.error('Failed to submit job:', error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit()
        }
    }

    // Duration presets
    const durationPresets = [
        { value: 3, label: "3s" },
        { value: 10, label: "10s" },
        { value: 30, label: "30s" },
        { value: 60, label: "60s" },
    ]

    if (!isAuthenticated) {
        return (
            <div className="page bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-[#F6E092] text-2xl font-bold mb-2">Welcome to Sona</h2>
                    <p className="text-[#EFEDD7]/60 mb-4">Sign in to start generating sounds</p>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="bg-[#E47640] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E47640]/90 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page bg-[#1a1a1a] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                    <span className="text-[#F6E092] text-2xl font-bold tracking-wide">SONA</span>
                    <span className="text-[#EFEDD7]/30 text-xs">by Prototip</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <AnimatePresence mode="wait">
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2 bg-[#E47640]/20 text-[#E47640] px-3 py-1.5 rounded-full text-xs font-medium"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {job?.status === "queued" ? "Queued" : "Generating"}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => navigate("/profile")}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E47640] to-[#692A12] flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <User className="w-4 h-4 text-white" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
                {/* Prompt Section */}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                    <label className="text-[#EFEDD7]/60 text-xs font-medium uppercase tracking-wider">
                        Describe your sound
                    </label>
                    <div className="flex-1 relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isGenerating}
                            placeholder="A cinematic orchestral hit with deep brass, thundering timpani, and ethereal strings..."
                            className="w-full h-full bg-[#2a2a2a] text-[#EFEDD7] rounded-xl p-4 resize-none outline-none border border-[#3a3a3a] focus:border-[#E47640]/50 transition-colors placeholder:text-[#EFEDD7]/30 text-sm leading-relaxed disabled:opacity-50"
                        />
                        <div className="absolute bottom-3 right-3 text-[#EFEDD7]/30 text-xs">
                            ⌘ + Enter to generate
                        </div>
                    </div>
                </div>

                {/* Settings Row */}
                <div className="flex items-center gap-4">
                    {/* Duration */}
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#EFEDD7]/40" />
                        <div className="flex bg-[#2a2a2a] rounded-lg p-1 gap-1">
                            {durationPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => setDuration(preset.value)}
                                    disabled={isGenerating}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        duration === preset.value
                                            ? "bg-[#467A5D] text-[#EFEDD7]"
                                            : "text-[#EFEDD7]/60 hover:text-[#EFEDD7] hover:bg-[#3a3a3a]"
                                    } disabled:opacity-50`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality */}
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#EFEDD7]/40" />
                        <div className="flex bg-[#2a2a2a] rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setQuality("standard")}
                                disabled={isGenerating}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    quality === "standard"
                                        ? "bg-[#467A5D] text-[#EFEDD7]"
                                        : "text-[#EFEDD7]/60 hover:text-[#EFEDD7] hover:bg-[#3a3a3a]"
                                } disabled:opacity-50`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setQuality("high")}
                                disabled={isGenerating}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    quality === "high"
                                        ? "bg-gradient-to-r from-[#F6E092] to-[#E47640] text-[#1a1a1a]"
                                        : "text-[#EFEDD7]/60 hover:text-[#EFEDD7] hover:bg-[#3a3a3a]"
                                } disabled:opacity-50`}
                            >
                                High
                            </button>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Generate Button */}
                    <motion.button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isGenerating}
                        whileHover={prompt.trim() && !isGenerating ? { scale: 1.02 } : {}}
                        whileTap={prompt.trim() && !isGenerating ? { scale: 0.98 } : {}}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                            prompt.trim() && !isGenerating
                                ? "bg-[#E47640] text-white hover:bg-[#E47640]/90"
                                : "bg-[#3a3a3a] text-[#EFEDD7]/40 cursor-not-allowed"
                        }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4" />
                                Generate
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Audio Player */}
                <div className={`bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a] transition-opacity ${!previewUrl ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4">
                        {/* Play Button */}
                        <button
                            onClick={togglePlayPause}
                            disabled={!previewUrl || !isWaveformReady}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                previewUrl && isWaveformReady
                                    ? "bg-[#E47640] text-white hover:bg-[#E47640]/90"
                                    : "bg-[#3a3a3a] text-[#EFEDD7]/30 cursor-not-allowed"
                            }`}
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4" fill="currentColor" />
                            ) : (
                                <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                            )}
                        </button>

                        {/* Waveform */}
                        <div className="flex-1 relative">
                            <div ref={waveformRef} className="w-full" />
                            {previewUrl && !isWaveformReady && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-[#E47640] animate-spin" />
                                </div>
                            )}
                            {!previewUrl && (
                                <div className="h-14 flex items-center justify-center text-[#EFEDD7]/30 text-sm">
                                    Generated audio will appear here
                                </div>
                            )}
                        </div>

                        {/* Time */}
                        <div className="text-[#EFEDD7]/60 text-xs font-mono min-w-[80px] text-right">
                            {previewUrl && isWaveformReady ? (
                                `${formatTime(currentTime)} / ${formatTime(audioDuration)}`
                            ) : (
                                "0:00 / 0:00"
                            )}
                        </div>

                        {/* Download */}
                        <button
                            onClick={handleSaveAudio}
                            disabled={!previewUrl}
                            className={`p-2 rounded-lg transition-colors ${
                                previewUrl
                                    ? "text-[#EFEDD7]/60 hover:text-[#EFEDD7] hover:bg-[#3a3a3a]"
                                    : "text-[#EFEDD7]/20 cursor-not-allowed"
                            }`}
                            title="Download audio"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {job?.status === "failed" && (
                        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            Error: {job.error_message || 'Generation failed. Please try again.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between px-5 py-2 border-t border-[#2a2a2a] text-xs text-[#EFEDD7]/30">
                <span>Sound Designer Mode</span>
                <span>44.1kHz • 16-bit</span>
                <span>v0.1.0</span>
            </footer>
        </div>
    )
}
