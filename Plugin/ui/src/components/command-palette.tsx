/**
 * Command Palette Component
 * 
 * Keyboard-accessible command palette (Ctrl/⌘+J)
 * Shows all available shortcuts and actions
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { openWebPage, WEBSITE_ROUTES } from '@/lib/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

interface Command {
  id: string
  label: string
  shortcut?: string
  action: () => void
  group: 'navigation' | 'playback' | 'modes' | 'quality' | 'actions' | 'external'
}

// Detect if user is on Mac
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

// Format shortcut key based on OS
const formatShortcut = (shortcut: string): string => {
  if (isMac) {
    return shortcut
      .replace(/Ctrl\+/g, '⌘')
      .replace(/Alt\+/g, '⌥')
      .replace(/Shift\+/g, '⇧')
  }
  return shortcut
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const commands: Command[] = useMemo(() => [
    // === NAVIGATION ===
    {
      id: 'sounds',
      label: 'Go to Sound Library',
      shortcut: 'Ctrl+G',
      action: () => navigate('/sounds'),
      group: 'navigation',
    },
    {
      id: 'naming',
      label: 'Go to Naming Convention',
      shortcut: 'Ctrl+,',
      action: () => navigate('/profile?tab=naming'),
      group: 'navigation',
    },
    {
      id: 'billing',
      label: 'Go to Billing',
      shortcut: 'Ctrl+B',
      action: () => navigate('/profile?tab=billing'),
      group: 'navigation',
    },

    // === EXTERNAL LINKS (Landing pages) ===
    {
      id: 'prompting',
      label: 'Open Prompting Guide ↗',
      shortcut: 'Ctrl+/',
      action: () => openWebPage(WEBSITE_ROUTES.PROMPTING),
      group: 'external',
    },
    {
      id: 'feedback',
      label: 'Open Feedback Form ↗',
      shortcut: 'Ctrl+F',
      action: () => openWebPage(WEBSITE_ROUTES.FEEDBACK),
      group: 'external',
    },

    // === PLAYBACK ===
    {
      id: 'play',
      label: 'Play / Pause',
      shortcut: 'Space',
      action: () => window.dispatchEvent(new CustomEvent('sona:toggle-play')),
      group: 'playback',
    },
    {
      id: 'copy',
      label: 'Copy Audio to Clipboard',
      shortcut: 'Ctrl+C',
      action: () => window.dispatchEvent(new CustomEvent('sona:copy-audio')),
      group: 'playback',
    },
    {
      id: 'save',
      label: 'Save Audio',
      shortcut: 'Ctrl+S',
      action: () => window.dispatchEvent(new CustomEvent('sona:save-audio')),
      group: 'playback',
    },
    {
      id: 'forward',
      label: 'Skip Forward',
      shortcut: 'Ctrl+→',
      action: () => window.dispatchEvent(new CustomEvent('sona:seek-forward')),
      group: 'playback',
    },
    {
      id: 'backward',
      label: 'Skip Backward',
      shortcut: 'Ctrl+←',
      action: () => window.dispatchEvent(new CustomEvent('sona:seek-backward')),
      group: 'playback',
    },
    {
      id: 'loop',
      label: 'Toggle Loop',
      shortcut: 'L',
      action: () => window.dispatchEvent(new CustomEvent('sona:toggle-loop')),
      group: 'playback',
    },
    {
      id: 'mute',
      label: 'Toggle Mute',
      shortcut: 'M',
      action: () => window.dispatchEvent(new CustomEvent('sona:toggle-mute')),
      group: 'playback',
    },

    // === MODES ===
    {
      id: 'mode-designer',
      label: 'Switch to Designer Mode',
      shortcut: 'Alt+1',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'designer' })),
      group: 'modes',
    },
    {
      id: 'mode-producer',
      label: 'Switch to Producer Mode',
      shortcut: 'Alt+2',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'producer' })),
      group: 'modes',
    },
    {
      id: 'mode-creator',
      label: 'Switch to Creator Mode',
      shortcut: 'Alt+3',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'creator' })),
      group: 'modes',
    },

    // === QUALITY ===
    {
      id: 'quality-draft',
      label: 'Quality: Draft',
      shortcut: '1',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'low' })),
      group: 'quality',
    },
    {
      id: 'quality-standard',
      label: 'Quality: Standard',
      shortcut: '2',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'medium' })),
      group: 'quality',
    },
    {
      id: 'quality-hq',
      label: 'Quality: High',
      shortcut: '3',
      action: () => window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'high' })),
      group: 'quality',
    },

    // === ACTIONS ===
    {
      id: 'enhance',
      label: 'Enhance Prompt',
      shortcut: 'Ctrl+Space',
      action: () => window.dispatchEvent(new CustomEvent('sona:enhance-prompt')),
      group: 'actions',
    },
    {
      id: 'create',
      label: 'Create / Generate',
      shortcut: 'Ctrl+Enter',
      action: () => window.dispatchEvent(new CustomEvent('sona:create')),
      group: 'actions',
    },
    {
      id: 'next-tip',
      label: 'Next Tip',
      shortcut: 'Ctrl+N',
      action: () => window.dispatchEvent(new CustomEvent('sona:next-tip')),
      group: 'actions',
    },
  ], [navigate])

  // Open command palette with Ctrl/⌘+J
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Global keyboard shortcuts handler
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      // Skip if command palette is open or user is typing in an input
      if (open) return
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return

      const isCtrl = e.ctrlKey || e.metaKey
      const isAlt = e.altKey

      // Navigation shortcuts (Ctrl/⌘ + key)
      if (isCtrl && !isAlt) {
        switch (e.key.toLowerCase()) {
          case 'g':
            e.preventDefault()
            navigate('/sounds')
            break
          case ',':
            e.preventDefault()
            navigate('/profile?tab=naming')
            break
          case '/':
            e.preventDefault()
            openWebPage(WEBSITE_ROUTES.PROMPTING)
            break
          case 'f':
            e.preventDefault()
            openWebPage(WEBSITE_ROUTES.FEEDBACK)
            break
          case 'b':
            e.preventDefault()
            navigate('/profile?tab=billing')
            break
          case 'n':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:next-tip'))
            break
          case 'arrowright':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:seek-forward'))
            break
          case 'arrowleft':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:seek-backward'))
            break
          case ' ':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:enhance-prompt'))
            break
          case 'enter':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:create'))
            break
          // Note: Ctrl+C and Ctrl+S are handled by the player component
        }
      }

      // Mode shortcuts (Alt + number)
      if (isAlt && !isCtrl) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'designer' }))
            break
          case '2':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'producer' }))
            break
          case '3':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-mode', { detail: 'creator' }))
            break
        }
      }

      // Quality shortcuts (number keys without modifiers)
      if (!isCtrl && !isAlt && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'low' }))
            break
          case '2':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'medium' }))
            break
          case '3':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:set-quality', { detail: 'high' }))
            break
          case 'l':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:toggle-loop'))
            break
          case 'm':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('sona:toggle-mute'))
            break
        }
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [open, navigate])

  const runCommand = useCallback((command: Command) => {
    setOpen(false)
    command.action()
  }, [])

  const navigationCommands = commands.filter(c => c.group === 'navigation')
  const playbackCommands = commands.filter(c => c.group === 'playback')
  const modeCommands = commands.filter(c => c.group === 'modes')
  const qualityCommands = commands.filter(c => c.group === 'quality')
  const actionCommands = commands.filter(c => c.group === 'actions')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{formatShortcut(command.shortcut)}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Playback">
          {playbackCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{formatShortcut(command.shortcut)}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Modes">
          {modeCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{formatShortcut(command.shortcut)}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quality">
          {qualityCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{formatShortcut(command.shortcut)}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{formatShortcut(command.shortcut)}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
