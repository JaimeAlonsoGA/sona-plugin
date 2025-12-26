export function ModeSelector() {
  return (
    <div className="flex gap-2">
      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
        Text-to-Audio
      </button>
      <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
        Audio-to-Audio
      </button>
    </div>
  )
}
