/**
 * Formatting utilities for Sona
 */

/**
 * Format seconds to mm:ss display
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration for display (3s, 10s, 1m 30s)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Create a filename from prompt text
 */
export function promptToFilename(prompt: string, maxLength = 30): string {
  return `sona-${prompt.slice(0, maxLength).replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
}
