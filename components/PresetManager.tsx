"use client"

/**
 * PresetManager Component
 * 
 * Allows users to:
 * 1. Load existing presets (built-in or custom)
 * 2. Save current selection as a new preset
 * 3. Generate presets using AI based on natural language descriptions
 * 
 * AI Preset Generation:
 * - User describes what they need (e.g., "web development with React")
 * - AI analyzes the query and recommends relevant packages
 * - Packages are auto-selected and user can save as a preset
 * - NOTE: This is for PRESET CREATION, not search
 */

import { useState } from "react"
import { useSelectionStore } from "@/store/selection"
import { usePresetsStore } from "@/store/presets"
import { useOsStore } from "@/store/os"
import { BUILT_IN_PRESETS } from "@/lib/presets"
import { toast } from "sonner"
import { Plus, Save, Folder, Star, Sparkles, Loader2, Wand2 } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface AIPresetResponse {
  presetName: string
  presetDescription: string
  packageIds: string[]
  explanation: string
}

export function PresetManager() {
  const { count, loadPreset } = useSelectionStore()
  const { customPresets, savePreset } = usePresetsStore()
  const [isSaving, setIsSaving] = useState(false)
  const [presetName, setPresetName] = useState("")
  
  // AI Preset Generation State
  const [aiQuery, setAiQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAiInput, setShowAiInput] = useState(false)

  const handleLoadPreset = (presetId: string | null) => {
    if (!presetId) return
    const preset = [...BUILT_IN_PRESETS, ...customPresets].find(
      (p) => p.id === presetId
    )
    if (preset) {
      loadPreset(preset.packageIds)
      toast.success(`Loaded "${preset.name}" with ${preset.packageIds.length} apps`)
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

  /**
   * Generate preset using AI
   * 
   * This calls the /api/ai/preset endpoint which analyzes the user's
   * description and returns recommended packages. This is specifically
   * for preset creation, NOT for search.
   */
  const handleAIPresetGenerate = async () => {
    if (!aiQuery.trim()) {
      toast.error("Please describe what you need")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery.trim(),
          limit: 15,
          os: useOsStore.getState().os,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate preset")
      }

      const data: AIPresetResponse = await response.json()

      // Load the AI-generated preset
      if (data.packageIds.length > 0) {
        loadPreset(data.packageIds)
        
        // Pre-fill the preset name for saving
        setPresetName(data.presetName)
        
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">AI generated preset with {data.packageIds.length} apps</p>
            <p className="text-xs opacity-80">{data.explanation}</p>
          </div>,
          { duration: 5000 }
        )
        
        // Show the save input
        setIsSaving(true)
        setShowAiInput(false)
        setAiQuery("")
      } else {
        toast.warning("No packages found for your description. Try being more specific.")
      }
    } catch (error) {
      console.error("AI preset generation error:", error)
      toast.error("Failed to generate preset. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--color-foreground))]">
        <Folder className="h-4 w-4 text-[hsl(var(--color-primary))]" />
        <span>Presets</span>
      </div>

      {/* Load Preset Dropdown */}
      <Select onValueChange={handleLoadPreset}>
        <SelectTrigger className="w-full h-11 rounded-xl border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] hover:border-[hsl(var(--color-primary)/0.3)] transition-colors">
          <SelectValue placeholder="Load a preset..." />
        </SelectTrigger>
        <SelectContent className="border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] rounded-xl shadow-xl">
          {BUILT_IN_PRESETS.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[hsl(var(--color-muted-foreground))] flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Built-in Presets
              </SelectLabel>
              {BUILT_IN_PRESETS.map((preset) => (
                <SelectItem
                  key={preset.id}
                  value={preset.id}
                  className="text-[hsl(var(--color-foreground))] focus:bg-[hsl(var(--color-muted))] rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                    <span className="text-xs text-[hsl(var(--color-muted-foreground))] ml-auto">
                      {preset.packageIds.length} apps
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {customPresets.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[hsl(var(--color-muted-foreground))] flex items-center gap-2">
                <Star className="h-3 w-3" />
                My Presets
              </SelectLabel>
              {customPresets.map((preset) => (
                <SelectItem
                  key={preset.id}
                  value={preset.id}
                  className="text-[hsl(var(--color-foreground))] focus:bg-[hsl(var(--color-muted))] rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                    <span className="text-xs text-[hsl(var(--color-muted-foreground))] ml-auto">
                      {preset.packageIds.length} apps
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {/* AI Preset Generation */}
      {showAiInput ? (
        <div className="space-y-2 animate-fade-in-up">
          {/* 
            AI Preset Input
            User describes what they need, AI generates a preset.
            This is for PRESET CREATION, not search.
          */}
          <div className="flex gap-2">
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Describe what you need... (e.g., web dev with React)"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAIPresetGenerate()
                if (e.key === "Escape") {
                  setAiQuery("")
                  setShowAiInput(false)
                }
              }}
              className="flex-1 h-10 rounded-xl border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-primary))]"
              autoFocus
              disabled={isGenerating}
            />
            <Button
              size="sm"
              onClick={handleAIPresetGenerate}
              disabled={isGenerating || !aiQuery.trim()}
              className="h-10 px-4 rounded-xl bg-[hsl(var(--color-primary))] text-white shadow-[var(--shadow-glow-primary)] hover:scale-[1.02] transition-all duration-300"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))] px-1">
            AI will create a preset based on your description
          </p>
        </div>
      ) : isSaving ? (
        <div className="flex gap-2 animate-fade-in-up">
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
            className="flex-1 h-10 rounded-xl border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-primary))]"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSavePreset}
            className="h-10 px-4 rounded-xl bg-[hsl(var(--color-primary))] text-white shadow-[var(--shadow-glow-primary)] hover:scale-[1.02] transition-all duration-300"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* AI Generate Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAiInput(true)}
            className={cn(
              "flex-1 h-10 rounded-xl font-medium transition-all duration-300",
              "border-[hsl(var(--color-primary)/0.3)] text-[hsl(var(--color-primary))]",
              "hover:border-[hsl(var(--color-primary)/0.5)] hover:bg-[hsl(var(--color-primary)/0.1)]"
            )}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          
          {/* Save Preset Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSaving(true)}
            disabled={count === 0}
            className={cn(
              "flex-1 h-10 rounded-xl font-medium transition-all duration-300",
              "border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))]",
              "hover:border-[hsl(var(--color-primary)/0.3)] hover:bg-[hsl(var(--color-primary)/0.05)]",
              "disabled:border-[hsl(var(--color-muted))] disabled:text-[hsl(var(--color-muted-foreground))] disabled:cursor-not-allowed"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
