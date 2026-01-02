/**
 * Sona Footer Component
 * 
 * Minimal status indicator
 */

interface SonaFooterProps {
  version?: string
}

export function SonaFooter({ version = '0.1.0' }: SonaFooterProps) {
  return (
    <footer className="flex items-center justify-center px-5 py-3 text-[10px] text-[var(--sona-text-subtle)] tracking-wider">
      <span>sona · v{version}</span>
    </footer>
  )
}
