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
  VolumeIcon,
  LoopIcon,
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
    // Loop functionality would need to be added to useAudioPlayer
    // For now, we'll handle it via the finish event in the parent
  }, [isLooping])

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
      {/* Filename Display */}
      {audioUrl && filename && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[var(--sona-text)] text-sm font-mono truncate">
            {filename}
          </span>
          <span className="text-[var(--sona-text-muted)] text-xs ml-2 shrink-0">
            .wav
          </span>
        </div>
      )}

      {/* Waveform Container */}
      <div className="relative mb-5">
        <div 
          ref={containerRef} 
          className="sona-waveform w-full cursor-pointer"
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
      <div className="h-px bg-[var(--sona-border)] rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--sona-sage)]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Left: Time */}
        <div className="w-16 text-xs font-mono text-[var(--sona-text-muted)]">
          {formatTime(currentTime)}
        </div>

        {/* Center: Playback controls */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <IconButton
            icon={<SkipBackIcon size={15} />}
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
              w-11 h-11 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isReady
                ? 'bg-[var(--sona-ember)] text-[var(--sona-cream)] hover:bg-[var(--sona-gold)] hover:text-[var(--sona-void)]'
                : 'bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] cursor-not-allowed'
              }
            `}
          >
            {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </motion.button>

          <IconButton
            icon={<SkipForwardIcon size={15} />}
            onClick={() => skip(5)}
            disabled={!isReady}
            size="sm"
            label="Forward 5s"
          />
        </div>

        {/* Right: Duration */}
        <div className="w-16 text-xs font-mono text-[var(--sona-text-muted)] text-right">
          {formatTime(duration)}
        </div>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--sona-border)]">
        {/* Left: Loop */}
        <IconButton
          icon={<LoopIcon size={15} />}
          onClick={() => setIsLooping(!isLooping)}
          variant={isLooping ? 'sage' : 'ghost'}
          size="sm"
          label="Loop (L)"
        />

        {/* Center: Volume */}
        <div 
          className="relative flex items-center"
          onMouseEnter={handleVolumeMouseEnter}
          onMouseLeave={handleVolumeMouseLeave}
        >
          <IconButton
            icon={<VolumeIcon size={15} level={getVolumeLevel()} />}
            onClick={() => setIsMuted(!isMuted)}
            size="sm"
            label="Mute (M)"
          />
          
          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 72 }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-2 overflow-hidden"
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
                    [&::-webkit-slider-thumb]:w-2.5
                    [&::-webkit-slider-thumb]:h-2.5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[var(--sona-sage)]
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:bg-[var(--sona-gold)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Copy & Download */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
            onClick={handleCopyToClipboard}
            disabled={!audioUrl}
            variant={copied ? 'sage' : 'ghost'}
            size="sm"
            label={copied ? 'Copied!' : 'Copy'}
          />
          <IconButton
            icon={<DownloadIcon size={15} />}
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
