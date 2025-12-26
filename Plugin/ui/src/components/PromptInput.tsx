interface PromptInputProps {
  value: string
  onChange: (value: string) => void
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="prompt-input" className="text-gray-300 text-sm">Describe your sound</label>
      <textarea 
        id="prompt-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 text-white p-3 rounded-lg"
        placeholder="e.g., Heavy metal kick drum with deep sub"
        rows={3}
      />
    </div>
  )
}
