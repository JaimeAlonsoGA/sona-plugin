import { useState, useEffect } from 'react'
import { useBridge } from './lib/bridge'
import { ModeSelector } from './components/ModeSelector'
import { PromptInput } from './components/PromptInput'
import { GenerateButton } from './components/GenerateButton'
import { AudioPreview } from './components/AudioPreview'
import { StatusBar } from './components/StatusBar'

export function App() {
  const { sendToPlugin, onMessage } = useBridge()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Escuchar mensajes del plugin C++
    const unsubscribe = onMessage((message) => {
      console.log('Message from C++:', message)
      
      if (message.type === 'connected') {
        setConnected(true)
      }
      
      if (message.type === 'generation-complete') {
        setIsGenerating(false)
      }
    })

    // Notificar al plugin que la UI está lista
    sendToPlugin({ type: 'ui-ready' })

    return unsubscribe
  }, [])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    sendToPlugin({
      type: 'generate',
      payload: {
        prompt: prompt.trim(),
        duration: 10,
        steps: 50
      }
    })
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <ModeSelector />
        <PromptInput value={prompt} onChange={setPrompt} />
        <GenerateButton 
          onClick={handleGenerate} 
          isGenerating={isGenerating}
          disabled={!prompt.trim()}
        />
        <AudioPreview />
        <StatusBar connected={connected} />
      </div>
    </div>
  )
}
