/**
 * Audio Demo Section
 * 
 * Playable Stable Audio 2.5 generation examples
 */

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

interface AudioSample {
  id: string
  title: string
  prompt: string
  mode: 'designer' | 'producer'
  duration: string
  audioUrl: string
}

// Demo samples - these would be real generated audio files
const DEMO_SAMPLES: AudioSample[] = [
  {
    id: 'demo-1',
    title: 'Cinematic Impact',
    prompt: 'Massive cinematic impact hit with metallic resonance and deep sub rumble, epic trailer style',
    mode: 'designer',
    duration: '3s',
    audioUrl: '/demos/cinematic-impact.mp3',
  },
  {
    id: 'demo-2',
    title: 'Synthwave Bass Loop',
    prompt: 'Funky synthwave bass loop with analog warmth, 120 BPM, retro 80s feel',
    mode: 'producer',
    duration: '8 bars',
    audioUrl: '/demos/synthwave-bass.mp3',
  },
  {
    id: 'demo-3',
    title: 'Forest Ambience',
    prompt: 'Peaceful forest ambience with distant birds, gentle wind through leaves, soft natural atmosphere',
    mode: 'designer',
    duration: '30s',
    audioUrl: '/demos/forest-ambience.mp3',
  },
  {
    id: 'demo-4',
    title: 'Lo-Fi Drum Pattern',
    prompt: 'Dusty lo-fi hip hop drum pattern, vinyl crackle, laid back swing, 85 BPM',
    mode: 'producer',
    duration: '4 bars',
    audioUrl: '/demos/lofi-drums.mp3',
  },
  {
    id: 'demo-5',
    title: 'Sci-Fi Whoosh',
    prompt: 'Futuristic sci-fi whoosh with digital glitches and laser sweep, spaceship flyby',
    mode: 'designer',
    duration: '3s',
    audioUrl: '/demos/scifi-whoosh.mp3',
  },
  {
    id: 'demo-6',
    title: 'Ambient Pad',
    prompt: 'Ethereal ambient pad with slow attack, lush reverb, dreamy and atmospheric, C minor',
    mode: 'producer',
    duration: '16 bars',
    audioUrl: '/demos/ambient-pad.mp3',
  },
]

export function AudioDemo() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  return (
    <section id="demo" className="py-24 px-6 bg-[var(--sona-deep)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--sona-sage-soft)] text-[var(--sona-sage)] mb-4">
            STABLE AUDIO 2.5
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-[var(--sona-cream)] mb-4">
            Hear what SONA can create
          </h2>
          <p className="text-[var(--sona-text-muted)] max-w-2xl mx-auto">
            Real examples generated with SONA. From cinematic sound effects to musical loops,
            experience the quality of AI-powered audio generation.
          </p>
        </motion.div>

        {/* Audio grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_SAMPLES.map((sample, index) => (
            <motion.div
              key={sample.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AudioCard
                sample={sample}
                isPlaying={playingId === sample.id}
                onPlay={() => setPlayingId(playingId === sample.id ? null : sample.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-[var(--sona-text-subtle)] mt-8"
        >
          All audio generated with SONA using Stable Audio 2.5 • No post-processing applied
        </motion.p>
      </div>
    </section>
  )
}

interface AudioCardProps {
  sample: AudioSample
  isPlaying: boolean
  onPlay: () => void
}

function AudioCard({ sample, isPlaying, onPlay }: AudioCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const modeColor = sample.mode === 'designer' ? 'var(--sona-designer)' : 'var(--sona-producer)'
  const modeBg = sample.mode === 'designer' ? 'var(--sona-designer-soft)' : 'var(--sona-producer-soft)'

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
    }
    
    const handleEnded = () => {
      setProgress(0)
      onPlay()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onPlay])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {
        // Demo files might not exist yet
        console.log('Demo audio not available')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  return (
    <div 
      className="p-5 rounded-xl border transition-all duration-300 hover:border-[var(--sona-muted)]"
      style={{
        background: 'var(--sona-surface)',
        borderColor: isPlaying ? modeColor : 'var(--sona-border)',
      }}
    >
      <audio ref={audioRef} src={sample.audioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-[var(--sona-cream)] font-medium truncate">{sample.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
              style={{ background: modeBg, color: modeColor }}
            >
              {sample.mode}
            </span>
            <span className="text-xs text-[var(--sona-text-subtle)]">{sample.duration}</span>
          </div>
        </div>
        
        {/* Play button */}
        <button
          onClick={onPlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isPlaying ? modeColor : 'var(--sona-elevated)',
            color: isPlaying ? 'var(--sona-void)' : 'var(--sona-text-muted)',
          }}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>
      
      {/* Prompt */}
      <p className="text-xs text-[var(--sona-text-subtle)] mb-4 line-clamp-2">
        "{sample.prompt}"
      </p>
      
      {/* Progress bar */}
      <div className="h-1 bg-[var(--sona-elevated)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ 
            background: modeColor,
            width: `${progress}%`,
          }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Waveform placeholder */}
      <div className="flex items-center justify-center gap-0.5 mt-3 h-8">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-150"
            style={{
              height: `${Math.random() * 100}%`,
              minHeight: '4px',
              background: progress > (i / 40) * 100 ? modeColor : 'var(--sona-border)',
              opacity: progress > (i / 40) * 100 ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  )
}
