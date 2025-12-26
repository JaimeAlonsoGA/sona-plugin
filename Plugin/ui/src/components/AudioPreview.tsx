export function AudioPreview() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
      <div className="text-center text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p>Audio preview will appear here</p>
      </div>
    </div>
  )
}
