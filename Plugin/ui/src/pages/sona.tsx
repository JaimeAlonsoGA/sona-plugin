import { useMemo, useState, useRef, useEffect } from "react"
import { Play, Pause, Save, Copy, Bolt } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsAuthenticated, useJobPolling, useSubmitJob } from "../lib/hooks"
import { CreateJobInput } from "../types/jobs"
import { getStorageUrl } from "../lib/utils"
import WaveSurfer from "wavesurfer.js"
import { useNavigate } from "react-router-dom"

type QualityLevel = "sorcerer" | "creator"

// Format seconds to mm:ss
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SonaPage() {
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState("")
    const [mode, setMode] = useState<"designer" | "producer">("designer")
    const [currentJobId, setCurrentJobId] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState<boolean>(false)

    // Audio generation settings
    const [duration, setDuration] = useState<number>(10)
    const [quality, setQuality] = useState<QualityLevel>("sorcerer")

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
    // masterUrl is available for future use (high quality export)
    // const masterUrl = useMemo(() => getStorageUrl(job?.master_path ?? null), [job?.master_path])

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current) return

        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#133A28',
            progressColor: '#F6E092',
            cursorColor: '#E47640',
            cursorWidth: 2,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            height: 48,
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

    // Audio player controls
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
            link.download = `sona-audio-${Date.now()}.mp3`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to save audio:', error)
        }
    }

    const handleCopyAudio = async () => {
        if (!previewUrl) return

        try {
            const response = await fetch(previewUrl)
            const blob = await response.blob()
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ])
            console.log('Audio copied to clipboard')
        } catch (error) {
            // Fallback: copy the URL instead
            try {
                await navigator.clipboard.writeText(previewUrl)
                console.log('Audio URL copied to clipboard')
            } catch (fallbackError) {
                console.error('Failed to copy audio:', fallbackError)
            }
        }
    }

    // Map quality levels to API values
    const getApiQuality = (q: QualityLevel): 'low' | 'medium' | 'high' => {
        return q === "creator" ? "high" : "medium"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!prompt.trim()) return

        const input: CreateJobInput = {
            prompt: prompt.trim(),
            duration: duration,
            quality: getApiQuality(quality),
            mode: mode,
        }

        try {
            const response = await submitJobMutation.mutateAsync(input)
            setCurrentJobId(response.job_id)
            console.log('Audio job submitted:', response.job_id)
        } catch (error) {
            console.error('Failed to submit job:', error)
        }
    }

    const state = job?.status === "queued" ? "Queued"
        : job?.status === "processing" ? "Processing"
            : job?.status === "failed" ? "Failed"
                : undefined

    // Duration presets
    const durationPresets = [1, 3, 10, 15, 30, 60]

    if (!isAuthenticated) {
        return (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-yellow-400">
                <p>Please sign in to generate audio.</p>
            </div>
        )
    }

    return (
        <div className="page bg-[#467A5D] flex items-center justify-between p-6">
            <div className="flex flex-row w-full items-center justify-between mb-8">
                {/* User & Tier */}
                <button onClick={() => navigate("/profile")} className="flex items-start gap-3 pl-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#692A12] to-[#E47640]" />
                    {/* <span className="text-[#2A3E40] text-5xl font-bold tracking-tight">pro</span> */}
                </button>

                <div>
                    <AnimatePresence mode="wait">
                        {state && (
                            <motion.p
                                key={state}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 10, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-[#EFEDD7]/60 font-medium border rounded-lg px-2 py-1 text-center bg-[#133A28]/30 border-[#EFEDD7]/20"
                            >
                                {state}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Waveform & Controls - Audio Player */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlayPause}
                        disabled={!previewUrl || !isWaveformReady}
                        className={`hover:opacity-80 transition-opacity ${!previewUrl || !isWaveformReady ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        {isPlaying ? (
                            <Pause className="text-[#692A12]" fill="#692A12" size={40} />
                        ) : (
                            <Play className="text-[#692A12]" fill="#692A12" size={40} />
                        )}
                    </button>
                    {job?.status === "failed" && (
                        <div className="text-red-400 font-medium">
                            Error: {job.error_message || 'Unknown error'}
                        </div>
                    )}

                    <div className="flex-1 rounded-md p-2 bg-[#4A6456]/40 relative min-w-[300px]">
                        {/* WaveSurfer container */}
                        <div
                            ref={waveformRef}
                            className={`w-full ${!previewUrl ? 'opacity-40' : ''}`}
                        />
                        {/* Loading indicator */}
                        {previewUrl && !isWaveformReady && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-[#F6E092] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {/* Time display */}
                        {previewUrl && isWaveformReady && (
                            <div className="absolute bottom-0 right-2 text-[#F6E092]/80 text-xs font-mono z-10">
                                {formatTime(currentTime)} / {formatTime(audioDuration)}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSaveAudio}
                        disabled={!previewUrl}
                        className={`text-[#133A28] hover:opacity-70 transition-opacity ${!previewUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title="Save audio"
                    >
                        <Save size={32} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={handleCopyAudio}
                        disabled={!previewUrl}
                        className={`text-[#133A28] hover:opacity-70 transition-opacity ${!previewUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title="Copy audio to clipboard"
                    >
                        <Copy size={32} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center w-full gap-10">
                {/* Plugin Name (SONA) */}
                <div className="flex flex-col items-center">
                    <span
                        className="text-[#F6E092] text-6xl font-bold tracking-wider"
                        style={{ writingMode: "vertical-lr", textOrientation: "sideways" }}
                    >
                        SONA
                    </span>
                </div>

                <div className="flex flex-row w-full items-center justify-between">
                    {/* Circular Prompt Input / Settings Panel */}
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            className="absolute w-56 h-56 bg-[#133A28] rounded-full mr-2 z-10"
                            animate={{
                                boxShadow: quality === "creator"
                                    ? "-10px 0px 20px 5px rgba(246, 224, 146, 0.4)"
                                    : "none"
                            }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.div
                            className="z-20 w-52 h-52 rounded-full bg-[#36795E] flex items-center justify-center overflow-hidden"
                            animate={isGenerating ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                            transition={isGenerating ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
                        >
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    // Settings Panel
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, rotateY: 90 }}
                                        animate={{ opacity: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, rotateY: -90 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col items-center justify-center gap-4 p-4 w-full"
                                    >
                                        {/* Duration Setting */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-[#EFEDD7]">
                                                {/* <Clock size={16} /> */}
                                                <span className="text-sm font-semibold">Duration</span>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {durationPresets.map((d) => (
                                                    <button
                                                        key={d}
                                                        onClick={() => setDuration(d)}
                                                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${duration === d
                                                            ? "bg-[#E8D199] text-[#133A28]"
                                                            : "bg-[#133A28]/50 text-[#EFEDD7] hover:bg-[#133A28]/70"
                                                            }`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quality Setting */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-[#EFEDD7]">
                                                {/* <Sparkles size={16} /> */}
                                                <span className="text-sm font-semibold">Quality</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setQuality("sorcerer")}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${quality === "sorcerer"
                                                        ? "bg-gradient-to-r from-[#6B7782] to-[#E47640] text-[#EFEDD7]"
                                                        : "bg-[#133A28]/50 text-[#EFEDD7] hover:bg-[#133A28]/70"
                                                        }`}
                                                >
                                                    Sorcerer
                                                </button>
                                                <button
                                                    onClick={() => setQuality("creator")}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${quality === "creator"
                                                        ? "bg-gradient-to-r from-[#F6E092] to-[#FFFFFF] text-[#133A28]"
                                                        : "bg-[#133A28]/50 text-[#EFEDD7] hover:bg-[#133A28]/70"
                                                        }`}
                                                >
                                                    Creator
                                                </button>
                                            </div>
                                        </div>

                                        {/* Current Settings Summary */}
                                        <div className="text-[#EFEDD7]/60 text-xs text-center mt-1">
                                            {duration}s • {quality === "creator" ? "High" : "Medium"} quality
                                        </div>
                                    </motion.div>
                                ) : (
                                    // Prompt Input
                                    <motion.textarea
                                        key="prompt"
                                        initial={{ opacity: 0, rotateY: -90 }}
                                        animate={{ opacity: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, rotateY: 90 }}
                                        transition={{ duration: 0.3 }}
                                        value={prompt}
                                        disabled={isGenerating}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Write your prompt here..."
                                        className="overflow-y-hidden p-8 bg-transparent text-[#EFEDD7] placeholder:text-[#EFEDD7]/60 resize-none outline-none font-bold leading-relaxed text-2xl text-pretty"
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <motion.button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${isEditing
                            ? "bg-[#E47640]/80"
                            : "bg-[#574a64]"
                            }`}
                        animate={{ rotate: isEditing ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isEditing ? "Back to prompt" : "Settings"}
                    >
                        <Bolt className="text-[#F8F2CF]/60 hover:opacity-70 transition-opacity" size={20} />
                    </motion.button>

                    {/* Generate Button */}
                    <div className="relative ml-8">
                        <motion.button
                            disabled={!prompt || isGenerating}
                            onClick={handleSubmit}
                            className={`${prompt && !isGenerating ? "bg-[#E47640] text-[#F8F2CF]" : "bg-[#6B7782] text-[#F8F2CF]/40 cursor-not-allowed"} w-52 h-52 rounded-3xl flex items-center justify-center`}
                            whileHover={prompt && !isGenerating ? { scale: 1.05 } : {}}
                            whileTap={prompt && !isGenerating ? { scale: 0.98 } : {}}
                            animate={isGenerating ? {
                                scale: [1, 1.02, 1],
                                opacity: [1, 0.8, 1]
                            } : {}}
                            transition={isGenerating ? {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            } : { duration: 0.2 }}
                        >
                            <div className="text-4xl font-bold leading-tight text-center tracking-wider">
                                GENE
                                <br />
                                RATE
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="flex w-full items-center justify-between mt-6">
                {/* Mode Switch */}
                <div className="flex items-center gap-3 bg-[#4A6456]/40 rounded-full p-1.5">
                    <button
                        onClick={() => setMode("designer")}
                        className={`px-5 py-1.5 rounded-full font-semibold transition-all text-sm ${mode === "designer" ? "bg-[#E8D199] text-[#3C5C4D]" : "text-[#E8D199] hover:bg-[#3C5C4D]/30"
                            }`}
                    >
                        Designer
                    </button>
                    <button
                        disabled
                        onClick={() => setMode("producer")}
                        className={`px-5 py-1.5 rounded-full font-semibold transition-all text-sm ${mode === "producer" ? "bg-[#E8D199] text-[#3C5C4D]" : "text-[#E8D199]/40 hover:bg-[#3C5C4D]/30"
                            }`}
                    >
                        Producer
                    </button>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="text-[#EFEDD7]/40">44.1kHz</p>
                    <p className="text-[#133A28]/40">•</p>
                    <p className="text-[#EFEDD7]/40">16-bit</p>
                </div>

                {/* Company Name (PROTOTIP inverted) */}
                <div className="text-[#2A3E40] text-4xl font-extrabold tracking-wider" style={{ transform: "scaleX(-1)" }}>
                    PROTOTIP
                </div>
            </div>
        </div>
    )
}
