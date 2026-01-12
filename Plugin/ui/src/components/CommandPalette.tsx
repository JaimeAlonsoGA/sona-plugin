/**
 * Command Palette Component
 * 
 * Keyboard-accessible command palette (Ctrl+J)
 * Shows all available shortcuts and actions
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  icon: string
  action: () => void
  group: 'navigation' | 'actions' | 'audio'
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const commands: Command[] = [
    // Navigation
    {
      id: 'home',
      label: 'Go to Create',
      shortcut: 'Ctrl+H',
      icon: '🎵',
      action: () => navigate('/sona'),
      group: 'navigation',
    },
    {
      id: 'profile',
      label: 'Go to Profile',
      shortcut: 'Ctrl+P',
      icon: '👤',
      action: () => navigate('/profile'),
      group: 'navigation',
    },
    {
      id: 'billing',
      label: 'Go to Billing',
      shortcut: 'Ctrl+B',
      icon: '💳',
      action: () => navigate('/profile?tab=billing'),
      group: 'navigation',
    },
    {
      id: 'sounds',
      label: 'Go to Sound Library',
      shortcut: 'Ctrl+G',
      icon: '📚',
      action: () => navigate('/sounds'),
      group: 'navigation',
    },
    // Audio Actions
    {
      id: 'copy',
      label: 'Copy Creation to Clipboard',
      shortcut: 'Ctrl+C',
      icon: '📋',
      action: () => {
        // Dispatch custom event that sona-player can listen to
        window.dispatchEvent(new CustomEvent('sona:copy-audio'))
      },
      group: 'audio',
    },
    {
      id: 'save',
      label: 'Save Creation',
      shortcut: 'Ctrl+S',
      icon: '💾',
      action: () => {
        window.dispatchEvent(new CustomEvent('sona:save-audio'))
      },
      group: 'audio',
    },
    {
      id: 'play',
      label: 'Play/Pause Audio',
      shortcut: 'Space',
      icon: '▶️',
      action: () => {
        window.dispatchEvent(new CustomEvent('sona:toggle-play'))
      },
      group: 'audio',
    },
    // Actions
    {
      id: 'new',
      label: 'New Generation',
      shortcut: 'Ctrl+N',
      icon: '✨',
      action: () => {
        navigate('/sona')
        window.dispatchEvent(new CustomEvent('sona:new-generation'))
      },
      group: 'actions',
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: '⚙️',
      action: () => navigate('/profile?tab=settings'),
      group: 'actions',
    },
  ]

  // Main Ctrl+J handler to open palette
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

      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault()
            navigate('/sona')
            break
          case 'p':
            e.preventDefault()
            navigate('/profile')
            break
          case 'b':
            e.preventDefault()
            navigate('/profile?tab=billing')
            break
          case 'g':
            e.preventDefault()
            navigate('/sounds')
            break
          case 'n':
            e.preventDefault()
            navigate('/sona')
            window.dispatchEvent(new CustomEvent('sona:new-generation'))
            break
          // Note: Ctrl+C and Ctrl+S are handled by the player component
          // to avoid interfering with native browser behavior
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
  const audioCommands = commands.filter(c => c.group === 'audio')
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
              <span className="mr-2">{command.icon}</span>
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Audio Controls">
          {audioCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => runCommand(command)}
              className="cursor-pointer"
            >
              <span className="mr-2">{command.icon}</span>
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{command.shortcut}</CommandShortcut>
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
              <span className="mr-2">{command.icon}</span>
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
