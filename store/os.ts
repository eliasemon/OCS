"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSelectionStore } from "./selection"

export type OsMode = "windows" | "mac"

interface OsStore {
  os: OsMode
  setOs: (os: OsMode) => void
}

export const useOsStore = create<OsStore>()(
  persist(
    (set) => ({
      os: "windows",
      setOs: (os: OsMode) => {
        // Clear selection when changing OS because package IDs won't match
        useSelectionStore.getState().clearAll()
        set({ os })
      },
    }),
    {
      name: "winsetup-os-mode",
    }
  )
)
