/**
 * Audio Player Component
 * 
 * Modular audio player with WaveSurfer visualization.
 * Supports play/pause, save, and copy functionality.
 */

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Save, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
  audioUrl: string | null
  filename?: string
  showSaveButton?: boolean
  showCopyButton?: boolean
  compact?: boolean
  onReady?: () => void
}

// Format seconds to mm:ss
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({
  audioUrl,
  filename = 'sona-audio',
  showSaveButton = true,
  showCopyButton = true,
  compact = false,
  onReady,
}: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#133A28',
      progressColor: '#F6E092',
      cursorColor: '#E47640',
      cursorWidth: 2,
      barWidth: compact ? 2 : 3,
      barGap: 2,
      barRadius: 3,
      height: compact ? 32 : 48,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      setIsReady(true)
      onReady?.()
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
  }, [compact, onReady])

  // Load audio when URL changes
  useEffect(() => {
    if (wavesurferRef.current && audioUrl) {
      setIsReady(false)
      wavesurferRef.current.load(audioUrl)
    } else if (wavesurferRef.current && !audioUrl) {
      wavesurferRef.current.empty()
      setIsReady(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (!wavesurferRef.current || !audioUrl || !isReady) return
    wavesurferRef.current.playPause()
  }

  const handleSave = async () => {
    if (!audioUrl) return

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save audio:', error)
    }
  }

  const handleCopy = async () => {
    if (!audioUrl) return

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback: copy the URL instead
      try {
        await navigator.clipboard.writeText(audioUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        console.error('Failed to copy audio:', fallbackError)
      }
    }
  }

  const buttonSize = compact ? 32 : 40

  return (
    <div className={`flex items-center gap-3 ${compact ? 'gap-2' : 'gap-4'}`}>
      {/* Play/Pause Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlayPause}
        disabled={!audioUrl || !isReady}
        className={`flex-shrink-0 transition-opacity ${
          !audioUrl || !isReady ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
        }`}
      >
        {isPlaying ? (
          <Pause className="text-[#692A12]" fill="#692A12" size={buttonSize} />
        ) : (
          <Play className="text-[#692A12]" fill="#692A12" size={buttonSize} />
        )}
      </motion.button>

      {/* Waveform */}
      <div className={`flex-1 rounded-md bg-[#4A6456]/40 relative ${compact ? 'p-1.5' : 'p-2'} min-w-[150px]`}>
        <div ref={waveformRef} className="w-full" />
        
        {/* Time display */}
        {isReady && (
          <div className={`absolute ${compact ? 'bottom-0.5 right-1.5 text-[10px]' : 'bottom-1 right-2 text-xs'} text-[#F6E092] z-10`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(showSaveButton || showCopyButton) && (
        <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
          {showSaveButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              disabled={!audioUrl || !isReady}
              className={`p-2 rounded-full bg-[#133A28]/50 hover:bg-[#133A28] transition-colors ${
                !audioUrl || !isReady ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Save audio"
            >
              {saved ? (
                <Check className="text-[#F6E092]" size={compact ? 16 : 20} />
              ) : (
                <Save className="text-[#EFEDD7]" size={compact ? 16 : 20} />
              )}
            </motion.button>
          )}
          
          {showCopyButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              disabled={!audioUrl || !isReady}
              className={`p-2 rounded-full bg-[#133A28]/50 hover:bg-[#133A28] transition-colors ${
                !audioUrl || !isReady ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Copy audio"
            >
              {copied ? (
                <Check className="text-[#F6E092]" size={compact ? 16 : 20} />
              ) : (
                <Copy className="text-[#EFEDD7]" size={compact ? 16 : 20} />
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
