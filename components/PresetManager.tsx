"use client"

import { useState } from "react"
import { useSelectionStore } from "@/store/selection"
import { usePresetsStore } from "@/store/presets"
import { BUILT_IN_PRESETS } from "@/lib/presets"
import { toast } from "sonner"
import { Plus, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function PresetManager() {
  const { count, loadPreset } = useSelectionStore()
  const { customPresets, savePreset } = usePresetsStore()
  const [isSaving, setIsSaving] = useState(false)
  const [presetName, setPresetName] = useState("")

  const handleLoadPreset = (presetId: string | null) => {
    if (!presetId) return
    const preset = [...BUILT_IN_PRESETS, ...customPresets].find(
      (p) => p.id === presetId
    )
    if (preset) {
      loadPreset(preset.packageIds)
      toast.success(`Preset loaded: ${preset.name}`)
    }
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name")
      return
    }

    const newPreset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      description: `${count} apps`,
      icon: "⭐",
      packageIds: Array.from(useSelectionStore.getState().selectedIds),
    }

    savePreset(newPreset)
    setPresetName("")
    setIsSaving(false)
    toast.success("Preset saved successfully!")
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-300">Presets</h3>
        <Select onValueChange={handleLoadPreset}>
          <SelectTrigger className="w-full border-gray-800 bg-gray-900 text-gray-100">
            <SelectValue placeholder="Load a preset..." />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-gray-950">
            {BUILT_IN_PRESETS.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-gray-500">Built-in Presets</SelectLabel>
                {BUILT_IN_PRESETS.map((preset) => (
                  <SelectItem
                    key={preset.id}
                    value={preset.id}
                    className="text-gray-300 focus:bg-gray-800"
                  >
                    <span className="mr-2">{preset.icon}</span>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {customPresets.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-gray-500">My Presets</SelectLabel>
                {customPresets.map((preset) => (
                  <SelectItem
                    key={preset.id}
                    value={preset.id}
                    className="text-gray-300 focus:bg-gray-800"
                  >
                    <span className="mr-2">{preset.icon}</span>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      {isSaving ? (
        <div className="flex gap-2">
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSavePreset()
              if (e.key === "Escape") {
                setPresetName("")
                setIsSaving(false)
              }
            }}
            className="flex-1 border-gray-800 bg-gray-900 text-gray-100"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSavePreset}
            className="bg-cyan-500 text-gray-950 hover:bg-cyan-400"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsSaving(true)}
          disabled={count === 0}
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 disabled:border-gray-800 disabled:text-gray-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Save as Preset
        </Button>
      )}
    </div>
  )
}
