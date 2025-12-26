import { useState, useEffect } from 'react'
import { useBridge } from './lib/bridge'

function App() {
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
    <div className="h-full flex flex-col bg-sona-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-sona-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Sona</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Connected' : 'Initializing...'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 gap-6 overflow-auto">
        {/* Prompt Input */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-300">
            Describe the sound you want to generate
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A warm analog synth pad with subtle movement and reverb..."
            className="w-full h-32 px-4 py-3 bg-sona-surface border border-sona-border rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-sona-accent transition-colors"
          />
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Duration</label>
            <select className="px-4 py-2 bg-sona-surface border border-sona-border rounded-lg text-white focus:outline-none focus:border-sona-accent">
              <option value="5">5 seconds</option>
              <option value="10" selected>10 seconds</option>
              <option value="30">30 seconds</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Quality</label>
            <select className="px-4 py-2 bg-sona-surface border border-sona-border rounded-lg text-white focus:outline-none focus:border-sona-accent">
              <option value="fast">Fast</option>
              <option value="balanced" selected>Balanced</option>
              <option value="high">High Quality</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 bg-sona-accent hover:bg-sona-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Sound
            </>
          )}
        </button>

        {/* Waveform Preview Placeholder */}
        <div className="flex-1 min-h-[200px] bg-sona-surface border border-sona-border rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Waveform preview will appear here</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-sona-border flex items-center justify-between text-sm text-gray-500">
        <span>Sona v1.0.0</span>
        <span>Powered by Stable Audio</span>
      </footer>
    </div>
  )
}

export default App
