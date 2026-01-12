/**
 * Sona Audio Player
 * 
 * Professional audio player with modern UX features:
 * - Waveform visualization
 * - Volume control with slider
 * - Loop toggle
 * - Skip forward/backward
 * - Keyboard shortcuts
 * - Time display with progress
 */

import { useEffect, useCallback, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Repeat, Volume2, VolumeX, Volume1 } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/use-audio-player'
import { formatTime } from '../../lib/formatters'
import { downloadAudio } from '../../lib/audio'
import { IconButton } from '../shared/icon-button'
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
} from '../shared/icons'

interface SonaPlayerProps {
  audioUrl: string | null
  filename?: string
  onReady?: () => void
}

export function SonaPlayer({ audioUrl, filename = 'sona-audio', onReady }: SonaPlayerProps) {
  const [volume, setVolume] = useState(0.8)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [copied, setCopied] = useState(false)
  const volumeTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    containerRef,
    isPlaying,
    currentTime,
    duration,
    isReady,
    isLoading,
    loadAudio,
    toggle,
    skip,
    setVolume: setPlayerVolume,
    setLoop,
    seekToPercent,
  } = useAudioPlayer({
    waveColor: 'rgba(123, 163, 142, 0.35)',
    progressColor: '#E8D5A3',
    cursorColor: '#D4856A',
    height: 64,
    barWidth: 2,
    barGap: 2,
    barRadius: 2,
  })

  // Load audio when URL changes
  useEffect(() => {
    loadAudio(audioUrl)
    if (audioUrl && onReady) {
      // onReady will be called via useAudioPlayer when waveform is ready
    }
  }, [audioUrl, loadAudio])

  // Handle volume changes
  useEffect(() => {
    setPlayerVolume(isMuted ? 0 : volume)
  }, [volume, isMuted, setPlayerVolume])

  // Handle loop
  useEffect(() => {
    setLoop(isLooping)
  }, [isLooping, setLoop])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          toggle()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(5)
          break
        case 'KeyM':
          e.preventDefault()
          setIsMuted((m) => !m)
          break
        case 'KeyL':
          e.preventDefault()
          setIsLooping((l) => !l)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle, skip])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0) setIsMuted(false)
  }, [])

  const handleVolumeMouseEnter = useCallback(() => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current)
    setShowVolumeSlider(true)
  }, [])

  const handleVolumeMouseLeave = useCallback(() => {
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeSlider(false), 300)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return
    try {
      await downloadAudio(audioUrl, filename)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [audioUrl, filename])

  const handleCopyToClipboard = useCallback(async () => {
    if (!audioUrl) return
    try {
      // Fetch the audio as a blob
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      
      // Try to copy as audio file (works in some browsers)
      // Fallback to copying URL if audio blob not supported
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
      } catch {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(audioUrl)
      }
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [audioUrl])

  const getVolumeLevel = (): 'mute' | 'low' | 'high' => {
    if (isMuted || volume === 0) return 'mute'
    if (volume < 0.5) return 'low'
    return 'high'
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="sona-glass p-5">
      {/* Filename Display - Fixed height to prevent layout shift */}
      <div className="h-6 mb-3 flex items-center justify-between">
        {audioUrl && filename ? (
          <>
            <span className="text-[var(--sona-text)] text-sm font-mono truncate">
              {filename}
            </span>
            <span className="text-[var(--sona-text-muted)] text-xs ml-2 shrink-0">
              .wav
            </span>
          </>
        ) : (
          <span className="text-[var(--sona-text-subtle)] text-xs">
            Ready to create
          </span>
        )}
      </div>

      {/* Waveform Container - Fixed height */}
      <div className="relative h-16 mb-5">
        <div 
          ref={containerRef} 
          className="sona-waveform w-full h-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            if (!isReady) return
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            seekToPercent(Math.max(0, Math.min(1, percent)))
          }}
        />
        
        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[var(--sona-surface)]/90 rounded-2xl"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[var(--sona-sage)] rounded-full"
                    animate={{
                      height: ['8px', '20px', '8px'],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.12,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!audioUrl && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[var(--sona-text-subtle)] text-sm">
              Your creation will appear here
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-px bg-[var(--sona-border)] rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--sona-sage)]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Controls - Single row */}
      <div className="flex items-center gap-2">
        {/* Left: Loop & Volume */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Repeat size={14} />}
            onClick={() => setIsLooping(!isLooping)}
            disabled={!audioUrl}
            variant={isLooping ? 'sage' : 'ghost'}
            size="sm"
            label="Loop (L)"
          />
          <div 
            className="relative flex items-start"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            <IconButton
              icon={
                getVolumeLevel() === 'mute' ? <VolumeX size={14} /> :
                getVolumeLevel() === 'low' ? <Volume1 size={14} /> :
                <Volume2 size={14} />
              }
              onClick={() => setIsMuted(!isMuted)}
              disabled={!audioUrl}
              size="sm"
              label="Mute (M)"
            />
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 60 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="absolute left-6 ml-1 overflow-hidden"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-[var(--sona-border)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-2
                      [&::-webkit-slider-thumb]:h-2
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[var(--sona-sage)]
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Time + Playback controls + Duration */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono text-[var(--sona-text-muted)] w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <IconButton
            icon={<SkipBackIcon size={14} />}
            onClick={() => skip(-5)}
            disabled={!isReady}
            size="sm"
            label="Back 5s"
          />

          <motion.button
            onClick={toggle}
            disabled={!isReady}
            whileTap={{ scale: 0.95 }}
            className={`
              w-9 h-9 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isReady
                ? 'bg-[var(--sona-ember)] text-[var(--sona-cream)] hover:bg-[var(--sona-gold)] hover:text-[var(--sona-void)]'
                : 'bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] cursor-not-allowed'
              }
            `}
          >
            {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </motion.button>

          <IconButton
            icon={<SkipForwardIcon size={14} />}
            onClick={() => skip(5)}
            disabled={!isReady}
            size="sm"
            label="Forward 5s"
          />

          <span className="text-[10px] font-mono text-[var(--sona-text-muted)] w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: Copy & Download */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            onClick={handleCopyToClipboard}
            disabled={!audioUrl}
            variant={copied ? 'sage' : 'ghost'}
            size="sm"
            label={copied ? 'Copied!' : 'Copy'}
          />
          <IconButton
            icon={<DownloadIcon size={14} />}
            onClick={handleDownload}
            disabled={!audioUrl}
            size="sm"
            label="Download"
          />
        </div>
      </div>
    </div>
  )
}
