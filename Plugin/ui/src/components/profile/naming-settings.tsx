/**
 * Naming Settings Component
 * 
 * Local-first editing with Supabase sync on save.
 * All edits happen locally, then sync to server when user clicks "Done".
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Card, Button, IconButton } from '../shared'
import {
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  GripIcon,
  EditIcon,
  CheckIcon,
  WaveformIcon,
  LoadingIcon,
} from '../shared/icons'
import { useNamingSettings } from '../../lib/hooks'
import type {
  NamingConvention,
  NamingParameter,
  NamingParameterType,
} from '../../types/naming'
import { DEFAULT_PARAMETERS } from '../../types/naming'
import { Headphones, Music } from 'lucide-react'

type Mode = 'designer' | 'producer' | 'creator'

interface NamingSettingsProps {
  /** Initial mode tab to show */
  initialMode?: Mode
}

export function NamingSettings({ initialMode = 'designer' }: NamingSettingsProps) {
  const [activeMode, setActiveMode] = useState<Mode>(initialMode)
  const [isEditing, setIsEditing] = useState(false)
  
  const {
    settings,
    isLoaded,
    isSaving,
    error,
    getActiveConvention,
    getConventionsForMode,
    setActiveConvention,
    setNamingEnabled,
    addConvention,
    duplicateConvention,
    startEditing,
    updateConvention,
    deleteConvention,
    addParameter,
    updateParameter,
    removeParameter,
    setParameters,
    generatePreview,
    saveChanges,
    cancelChanges,
    getEditingConvention,
  } = useNamingSettings()

  const conventions = getConventionsForMode(activeMode)
  const activeConv = getActiveConvention(activeMode)
  const editingConvention = getEditingConvention()

  // Handle selecting a convention
  const handleSelectConvention = useCallback((id: string) => {
    setActiveConvention(activeMode, id)
  }, [activeMode, setActiveConvention])

  // Handle creating a new convention
  const handleCreateConvention = useCallback(() => {
    const newConv = addConvention(activeMode)
    setActiveConvention(activeMode, newConv.id)
    setIsEditing(true)
  }, [activeMode, addConvention, setActiveConvention])

  // Handle duplicating a convention
  const handleDuplicateConvention = useCallback((conv: NamingConvention) => {
    const cloned = duplicateConvention(conv)
    setActiveConvention(activeMode, cloned.id)
    setIsEditing(true)
  }, [activeMode, duplicateConvention, setActiveConvention])

  // Handle editing a convention
  const handleEditConvention = useCallback((conv: NamingConvention) => {
    if (conv.isBuiltin) {
      // Clone builtin for editing
      handleDuplicateConvention(conv)
    } else {
      startEditing(conv)
      setIsEditing(true)
    }
  }, [handleDuplicateConvention, startEditing])

  // Handle saving changes
  const handleSave = useCallback(async () => {
    const success = await saveChanges()
    if (success) {
      setIsEditing(false)
    }
  }, [saveChanges])

  // Handle canceling changes
  const handleCancel = useCallback(() => {
    cancelChanges()
    setIsEditing(false)
  }, [cancelChanges])

  // Handle deleting a convention
  const handleDelete = useCallback((id: string) => {
    deleteConvention(id)
    // If we're editing this convention, stop editing
    if (editingConvention?.id === id) {
      setIsEditing(false)
    }
  }, [deleteConvention, editingConvention])

  // Get the convention to display in editor
  const conventionToEdit = editingConvention || (isEditing ? activeConv : null)

  return (
    <Card
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* <SettingsIcon size={16} className="text-[var(--sona-sage)]" /> */}
          <h2 className="text-[var(--sona-text)] font-medium">Naming Convention</h2>
          {isSaving && (
            <LoadingIcon size={14} className="text-[var(--sona-sage)] animate-spin" />
          )}
        </div>
        {error && (
          <span className="text-[10px] text-[var(--sona-ember)]">
            {error instanceof Error ? error.message : 'Error saving'}
          </span>
        )}
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-[var(--sona-surface)] rounded-xl">
        <div className="flex items-center gap-2">
          {/* <Zap size={14} className={settings.namingEnabled ? 'text-[var(--sona-sage)]' : 'text-[var(--sona-text-subtle)]'} /> */}
          <div>
            <p className="text-sm text-[var(--sona-text)]">Auto File Naming</p>
            <p className="text-[10px] text-[var(--sona-text-subtle)]">
              {settings.namingEnabled ? 'Generate smart file names' : 'Faster generation, simple names'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setNamingEnabled(!settings.namingEnabled)}
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-200
            ${settings.namingEnabled 
              ? 'bg-[var(--sona-sage)]' 
              : 'bg-[var(--sona-border)]'
            }
          `}
          aria-label={settings.namingEnabled ? 'Disable AI naming' : 'Enable AI naming'}
        >
          <span
            className={`
              absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${settings.namingEnabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Loading State */}
      {!isLoaded ? (
        <div className="flex items-center justify-center py-8">
          <LoadingIcon size={24} className="text-[var(--sona-sage)] animate-spin" />
        </div>
      ) : !settings.namingEnabled ? (
        <div className="text-center py-6 text-[var(--sona-text-subtle)] text-sm">
          Enable Auto File Naming to customize naming conventions
        </div>
      ) : (
        <>
          {/* Mode Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-[var(--sona-surface)] rounded-xl">
            <ModeTab
              mode="designer"
              activeMode={activeMode}
              onClick={() => setActiveMode('designer')}
              icon={<WaveformIcon size={14} />}
              label="Designer"
            />
            <ModeTab
              mode="producer"
              activeMode={activeMode}
              onClick={() => setActiveMode('producer')}
              icon={<Headphones size={14} />}
              label="Producer"
            />
            <ModeTab
              mode="creator"
              activeMode={activeMode}
              onClick={() => setActiveMode('creator')}
              icon={<Music size={14} />}
              label="Creator"
            />
          </div>

          {/* Convention Selector */}
          <div className="mb-4">
            <ConventionSelector
              conventions={conventions}
              activeId={activeConv.id}
              onSelect={handleSelectConvention}
              onEdit={handleEditConvention}
              onDelete={handleDelete}
              disabled={isEditing}
            />
          </div>

          {/* Preview */}
          <div className="mb-4 p-3 bg-[var(--sona-surface)] rounded-xl">
            <p className="text-[10px] text-[var(--sona-text-subtle)] uppercase tracking-wider mb-1">
              Preview
            </p>
            <p className="text-[var(--sona-sage)] font-mono text-sm break-all">
              {generatePreview(conventionToEdit || activeConv)}.wav
            </p>
          </div>

          {/* Editor */}
          <AnimatePresence mode="wait">
            {isEditing && conventionToEdit && !conventionToEdit.isBuiltin && (
              <ConventionEditor
                convention={conventionToEdit}
                onUpdate={(updates) => updateConvention(conventionToEdit.id, updates)}
                onAddParameter={(type) => addParameter(conventionToEdit.id, type)}
                onUpdateParameter={(paramId, updates) => updateParameter(conventionToEdit.id, paramId, updates)}
                onRemoveParameter={(paramId) => removeParameter(conventionToEdit.id, paramId)}
                onSetParameters={(params) => setParameters(conventionToEdit.id, params)}
                onSave={handleSave}
                onCancel={handleCancel}
                generatePreview={generatePreview}
                isSaving={isSaving}
              />
            )}
          </AnimatePresence>

          {/* Create Button */}
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              icon={<PlusIcon size={14} />}
              onClick={handleCreateConvention}
              className="w-full justify-center mt-2"
            >
              Create Custom Convention
            </Button>
          )}
        </>
      )}
    </Card>
  )
}

// Mode Tab Component
interface ModeTabProps {
  mode: Mode
  activeMode: Mode
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ModeTab({ mode, activeMode, onClick, icon, label }: ModeTabProps) {
  const isActive = mode === activeMode
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
        text-xs font-medium transition-all
        ${isActive
          ? 'bg-[var(--sona-sage)] text-[var(--sona-void)]'
          : 'text-[var(--sona-text-muted)] hover:text-[var(--sona-text)]'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

// Convention Selector Component
interface ConventionSelectorProps {
  conventions: NamingConvention[]
  activeId: string
  onSelect: (id: string) => void
  onEdit: (conv: NamingConvention) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

function ConventionSelector({
  conventions,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  disabled,
}: ConventionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeConv = conventions.find(c => c.id === activeId)

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 
          bg-[var(--sona-surface)] border border-[var(--sona-border)] rounded-xl
          text-[var(--sona-text)] text-sm transition-all
          hover:border-[var(--sona-sage)]/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex-1 text-left">
          <p className="font-medium">{activeConv?.name || 'Select convention'}</p>
          <p className="text-[10px] text-[var(--sona-text-muted)]">
            {activeConv?.description}
          </p>
        </div>
        <ChevronDownIcon 
          size={16} 
          className={`text-[var(--sona-text-subtle)] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 z-50
              bg-[var(--sona-void)] border border-[var(--sona-border)] rounded-xl
              shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {conventions.map(conv => (
                <div
                  key={conv.id}
                  className={`
                    flex items-center gap-2 px-3 py-2 cursor-pointer
                    transition-colors group
                    ${conv.id === activeId
                      ? 'bg-[var(--sona-sage)]/10'
                      : 'hover:bg-[var(--sona-surface)]'
                    }
                  `}
                  onClick={() => {
                    onSelect(conv.id)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[var(--sona-text)] text-sm font-medium truncate">
                        {conv.name}
                      </p>
                      {conv.isBuiltin && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-[var(--sona-muted)] text-[var(--sona-text-subtle)] rounded uppercase">
                          Built-in
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--sona-text-muted)] truncate">
                      {conv.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton
                      icon={<EditIcon size={12} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(conv)
                        setIsOpen(false)
                      }}
                      size="sm"
                      label={conv.isBuiltin ? 'Clone & Edit' : 'Edit'}
                    />
                    {!conv.isBuiltin && (
                      <IconButton
                        icon={<TrashIcon size={12} />}
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(conv.id)
                        }}
                        size="sm"
                        label="Delete"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Convention Editor Component
interface ConventionEditorProps {
  convention: NamingConvention
  onUpdate: (updates: Partial<Omit<NamingConvention, 'id' | 'isBuiltin'>>) => void
  onAddParameter: (type: NamingParameterType) => void
  onUpdateParameter: (paramId: string, updates: Partial<Omit<NamingParameter, 'id'>>) => void
  onRemoveParameter: (paramId: string) => void
  onSetParameters: (params: NamingParameter[]) => void
  onSave: () => void
  onCancel: () => void
  generatePreview: (conv: NamingConvention) => string
  isSaving?: boolean
}

function ConventionEditor({
  convention,
  onUpdate,
  onAddParameter,
  onUpdateParameter,
  onRemoveParameter,
  onSetParameters,
  onSave,
  onCancel,
  generatePreview,
  isSaving,
}: ConventionEditorProps) {
  const [showAddParam, setShowAddParam] = useState(false)
  
  // Local state for parameters to enable smooth drag-drop
  const [localParams, setLocalParams] = useState(convention.parameters)
  
  // Sync local params when convention changes externally
  useEffect(() => {
    setLocalParams(convention.parameters)
  }, [convention.parameters])

  // Handle reorder with local state first
  const handleReorder = useCallback((newOrder: NamingParameter[]) => {
    setLocalParams(newOrder)
    onSetParameters(newOrder)
  }, [onSetParameters])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-[var(--sona-border)]"
    >
      {/* Name Input */}
      <div className="mb-3">
        <label className="sona-label mb-1">Name</label>
        <input
          type="text"
          value={convention.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          disabled={isSaving}
          className="w-full px-3 py-2 bg-[var(--sona-surface)] border border-[var(--sona-border)]
            rounded-lg text-[var(--sona-text)] text-sm
            focus:outline-none focus:border-[var(--sona-sage)]
            disabled:opacity-50"
        />
      </div>

      {/* Separator Input */}
      <div className="mb-4">
        <label className="sona-label mb-1">Separator</label>
        <input
          type="text"
          value={convention.separator}
          onChange={(e) => onUpdate({ separator: e.target.value || '_' })}
          maxLength={3}
          disabled={isSaving}
          className="w-16 px-3 py-2 bg-[var(--sona-surface)] border border-[var(--sona-border)]
            rounded-lg text-[var(--sona-text)] text-sm text-center font-mono
            focus:outline-none focus:border-[var(--sona-sage)]
            disabled:opacity-50"
        />
      </div>

      {/* Parameters */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="sona-label">Parameters</label>
          <button
            onClick={() => setShowAddParam(!showAddParam)}
            disabled={isSaving}
            className="text-[var(--sona-sage)] text-xs hover:underline disabled:opacity-50"
          >
            + Add
          </button>
        </div>

        {/* Parameter List */}
        <Reorder.Group
          axis="y"
          values={localParams}
          onReorder={handleReorder}
          className="space-y-1"
        >
          {localParams.map((param) => (
            <ParameterItem
              key={param.id}
              param={param}
              onUpdate={(updates) => onUpdateParameter(param.id, updates)}
              onRemove={() => onRemoveParameter(param.id)}
              disabled={isSaving}
            />
          ))}
        </Reorder.Group>

        {localParams.length === 0 && (
          <p className="text-[var(--sona-text-muted)] text-xs text-center py-4">
            No parameters. Add some to build your convention.
          </p>
        )}

        {/* Add Parameter Menu */}
        <AnimatePresence>
          {showAddParam && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 bg-[var(--sona-surface)] rounded-lg"
            >
              <p className="text-[10px] text-[var(--sona-text-subtle)] uppercase mb-2">
                Select parameter type
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(DEFAULT_PARAMETERS).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onAddParameter(type as NamingParameterType)
                      setShowAddParam(false)
                    }}
                    disabled={isSaving}
                    className="px-2 py-1 text-[10px] bg-[var(--sona-muted)] text-[var(--sona-text-muted)]
                      rounded hover:bg-[var(--sona-sage)]/20 hover:text-[var(--sona-sage)] transition-colors
                      disabled:opacity-50"
                  >
                    {DEFAULT_PARAMETERS[type as NamingParameterType].label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Preview */}
      <div className="mb-4 p-3 bg-[var(--sona-surface)] rounded-lg">
        <p className="text-[10px] text-[var(--sona-text-subtle)] uppercase mb-1">
          Live Preview
        </p>
        <p className="text-[var(--sona-sage)] font-mono text-sm break-all">
          {generatePreview(convention)}.wav
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={isSaving ? <LoadingIcon size={14} className="animate-spin" /> : <CheckIcon size={14} />}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Done'}
        </Button>
      </div>
    </motion.div>
  )
}

// Parameter Item Component
interface ParameterItemProps {
  param: NamingParameter
  onUpdate: (updates: Partial<Omit<NamingParameter, 'id'>>) => void
  onRemove: () => void
  disabled?: boolean
}

function ParameterItem({ param, onUpdate, onRemove, disabled }: ParameterItemProps) {
  return (
    <Reorder.Item
      value={param}
      className={`flex items-center gap-2 px-2 py-1.5 bg-[var(--sona-surface)] rounded-lg group
        ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <GripIcon size={12} className="text-[var(--sona-text-subtle)] cursor-grab shrink-0" />
      
      <div className="flex-1 min-w-0">
        <span className="text-[var(--sona-text)] text-xs font-medium">
          {param.label}
        </span>
        <span className="text-[var(--sona-text-muted)] text-[10px] ml-1">
          ({param.type})
        </span>
      </div>

      {/* Custom value input */}
      {param.type === 'custom' && (
        <input
          type="text"
          value={param.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Value"
          disabled={disabled}
          className="w-20 px-2 py-0.5 text-[10px] bg-[var(--sona-muted)] border-none
            rounded text-[var(--sona-text)] focus:outline-none focus:ring-1 focus:ring-[var(--sona-sage)]"
        />
      )}

      {/* Toggle enabled */}
      <button
        onClick={() => onUpdate({ enabled: !param.enabled })}
        disabled={disabled}
        className={`
          w-5 h-5 rounded flex items-center justify-center transition-colors
          ${param.enabled
            ? 'bg-[var(--sona-sage)] text-[var(--sona-void)]'
            : 'bg-[var(--sona-muted)] text-[var(--sona-text-subtle)]'
          }
        `}
      >
        {param.enabled && <CheckIcon size={10} />}
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={disabled}
        className="opacity-0 group-hover:opacity-100 transition-opacity
          text-[var(--sona-text-subtle)] hover:text-[var(--sona-ember)]"
      >
        <TrashIcon size={12} />
      </button>
    </Reorder.Item>
  )
}

export default NamingSettings
