/**
 * Audio utilities for Sona
 */

/**
 * Download audio file from URL
 */
export async function downloadAudio(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${filename}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download audio:', error)
    throw error
  }
}

/**
 * Copy audio URL to clipboard
 */
export async function copyAudioUrl(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
  } catch (error) {
    console.error('Failed to copy URL:', error)
    throw error
  }
}

/**
 * Get quality API value from UI quality level
 */
export function getApiQuality(quality: 'standard' | 'high'): 'low' | 'medium' | 'high' {
  return quality === 'high' ? 'high' : 'medium'
}
