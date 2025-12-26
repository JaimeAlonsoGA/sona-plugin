interface StatusBarProps {
  connected: boolean
}

export function StatusBar({ connected }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-400 px-4 py-3 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span>{connected ? 'Connected' : 'Initializing...'}</span>
      </div>
      <span>Powered by Stable Audio</span>
    </div>
  )
}
