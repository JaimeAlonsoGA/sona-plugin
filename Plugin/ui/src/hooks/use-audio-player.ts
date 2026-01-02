/**
 * Audio Player Hook
 * 
 * Manages WaveSurfer instance and audio playback state
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'

export interface WaveformConfig {
  waveColor?: string
  progressColor?: string
  cursorColor?: string
  cursorWidth?: number
  barWidth?: number
  barGap?: number
  barRadius?: number
  height?: number
}

const defaultConfig: WaveformConfig = {
  waveColor: 'rgba(70, 122, 93, 0.4)',
  progressColor: '#F6E092',
  cursorColor: '#E47640',
  cursorWidth: 2,
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
  height: 64,
}

export function useAudioPlayer(config: WaveformConfig = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mergedConfig = { ...defaultConfig, ...config }

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: mergedConfig.waveColor,
      progressColor: mergedConfig.progressColor,
      cursorColor: mergedConfig.cursorColor,
      cursorWidth: mergedConfig.cursorWidth,
      barWidth: mergedConfig.barWidth,
      barGap: mergedConfig.barGap,
      barRadius: mergedConfig.barRadius,
      height: mergedConfig.height,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      setIsReady(true)
      setIsLoading(false)
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('seeking', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('finish', () => {
      setIsPlaying(false)
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))

    wavesurferRef.current = wavesurfer

    return () => {
      wavesurfer.destroy()
    }
  }, []) // Only run once on mount

  // Load audio when URL changes
  const loadAudio = useCallback((url: string | null) => {
    if (!wavesurferRef.current) return
    
    setAudioUrl(url)
    
    if (url) {
      setIsLoading(true)
      setIsReady(false)
      wavesurferRef.current.load(url)
    } else {
      wavesurferRef.current.empty()
      setIsReady(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [])

  const play = useCallback(() => {
    wavesurferRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    wavesurferRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    wavesurferRef.current?.playPause()
  }, [])

  const seek = useCallback((time: number) => {
    if (wavesurferRef.current && duration > 0) {
      wavesurferRef.current.seekTo(time / duration)
    }
  }, [duration])

  const seekToPercent = useCallback((percent: number) => {
    wavesurferRef.current?.seekTo(percent)
  }, [])

  const setVolume = useCallback((volume: number) => {
    wavesurferRef.current?.setVolume(volume)
  }, [])

  const skip = useCallback((seconds: number) => {
    if (wavesurferRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      wavesurferRef.current.seekTo(newTime / duration)
    }
  }, [currentTime, duration])

  return {
    containerRef,
    isPlaying,
    currentTime,
    duration,
    isReady,
    isLoading,
    audioUrl,
    loadAudio,
    play,
    pause,
    toggle,
    seek,
    seekToPercent,
    setVolume,
    skip,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  }
}
