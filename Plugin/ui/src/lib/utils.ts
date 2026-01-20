import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const STORAGE_BUCKET = 'audio-files'

/**
 * Build a public URL from a storage path
 * 
 * @deprecated The audio-files bucket is private. Use useJobAudioUrl hook instead.
 */
export function getStorageUrl(path: string | null): string | null {
  if (!path) return null
  // This won't work for private buckets - use signed URLs instead
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}
