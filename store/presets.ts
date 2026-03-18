"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Preset } from "@/types/package"

interface PresetsStore {
  customPresets: Preset[]
  savePreset: (preset: Preset) => void
  deletePreset: (id: string) => void
  getPreset: (id: string) => Preset | undefined
}

export const usePresetsStore = create<PresetsStore>()(
  persist(
    (set, get) => ({
      customPresets: [],
      savePreset: (preset: Preset) =>
        set((state) => ({
          customPresets: [
            ...state.customPresets.filter(p => p.id !== preset.id),
            preset
          ]
        })),
      deletePreset: (id: string) =>
        set((state) => ({
          customPresets: state.customPresets.filter(p => p.id !== id)
        })),
      getPreset: (id: string) =>
        get().customPresets.find(p => p.id === id),
    }),
    { name: "winsetup-presets" }
  )
)
