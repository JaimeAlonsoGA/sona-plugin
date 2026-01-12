/**
 * Compact Audio Player
 * 
 * Minimal player for sound library cards
 */

import { useEffect, useCallback, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import WaveSurfer from 'wavesurfer.js'
import { IconButton } from '../shared/icon-button'
import { PlayIcon, PauseIcon, DownloadIcon } from '../shared/icons'
import { formatTime } from '../../lib/formatters'
import { downloadAudio } from '../../lib/audio'

interface CompactPlayerProps {
  audioUrl: string | null
  filename?: string
}

export function CompactPlayer({ audioUrl, filename = 'sona-audio' }: CompactPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(70, 122, 93, 0.3)',
      progressColor: '#F6E092',
      cursorColor: 'transparent',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 28,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      setIsReady(true)
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))

    wavesurferRef.current = wavesurfer

    return () => wavesurfer.destroy()
  }, [])

  // Load audio
  useEffect(() => {
    if (wavesurferRef.current && audioUrl) {
      setIsReady(false)
      wavesurferRef.current.load(audioUrl)
    }
  }, [audioUrl])

  const toggle = useCallback(() => {
    wavesurferRef.current?.playPause()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return
    try {
      await downloadAudio(audioUrl, filename)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [audioUrl, filename])

  return (
    <div className="flex items-center gap-2 bg-[var(--sona-surface)] rounded-lg p-2">
      {/* Play/Pause */}
      <motion.button
        onClick={toggle}
        disabled={!isReady}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isReady
            ? 'bg-[var(--sona-ember)] text-white'
            : 'bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] cursor-not-allowed'
          }
        `}
      >
        {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
      </motion.button>

      {/* Waveform */}
      <div ref={containerRef} className="flex-1 cursor-pointer" />

      {/* Time */}
      <span className="text-[var(--sona-text-muted)] text-[10px] font-mono w-16 text-right flex-shrink-0">
        {formatTime(currentTime)}/{formatTime(duration)}
      </span>

      {/* Download */}
      <IconButton
        icon={<DownloadIcon size={14} />}
        onClick={handleDownload}
        disabled={!audioUrl}
        size="sm"
        label="Download"
      />
    </div>
  )
}
