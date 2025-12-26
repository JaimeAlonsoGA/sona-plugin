/**
 * Example component demonstrating audio generation with React Query
 * 
 * This component can be imported and used to test the generateAudio function.
 */

import { useState } from 'react'
import { useGenerateAudio, useIsAuthenticated } from '../lib/hooks'

export function AudioGenerationExample() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('ambient')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const generateAudio = useGenerateAudio()
  const isAuthenticated = useIsAuthenticated()

  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    generateAudio.mutate(
      { prompt: prompt.trim(), mode },
      {
        onSuccess: (audioData) => {
          // Create a blob from the ArrayBuffer
          const blob = new Blob([audioData], { type: 'audio/wav' })
          const url = URL.createObjectURL(blob)
          
          // Clean up previous URL if exists
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
          }
          
          setAudioUrl(url)
        },
      }
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Please sign in to generate audio</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Audio Generation</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Describe the audio you want to generate..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Mode
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ambient">Ambient</option>
          <option value="music">Music</option>
          <option value="sfx">Sound Effects</option>
        </select>
      </div>

      {generateAudio.error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded">
          <p className="text-red-200 text-sm">
            {(generateAudio.error as Error).message}
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generateAudio.isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {generateAudio.isPending ? 'Generating...' : 'Generate Audio'}
      </button>

      {audioUrl && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Generated Audio:</p>
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  )
}
