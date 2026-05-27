"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getPersistedOs, mapPackageIdsToOs } from "@/lib/presetMapper"

interface SelectionStore {
  selectedIds: Set<string>
  togglePackage: (id: string) => void
  clearAll: () => void
  loadPreset: (ids: readonly string[]) => void
  isSelected: (id: string) => boolean
  count: number
}

export const useSelectionStore = create<SelectionStore>()(
  persist(
    (set, get) => ({
      selectedIds: new Set<string>(),
      count: 0,
      isSelected: (id: string) => get().selectedIds.has(id),
      togglePackage: (id: string) =>
        set((state) => {
          const next = new Set(state.selectedIds)
          next.has(id) ? next.delete(id) : next.add(id)
          return { selectedIds: next, count: next.size }
        }),
      clearAll: () => set({ selectedIds: new Set(), count: 0 }),
      loadPreset: (ids: readonly string[]) => {
        const targetOs = getPersistedOs()
        const mappedIds = mapPackageIdsToOs(ids, targetOs)
        const next = new Set(mappedIds)
        set({ selectedIds: next, count: next.size })
      },
    }),
    {
      name: "appnest-selection",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null
          try {
            const str = localStorage.getItem(name)
            if (!str) return null
            const { state } = JSON.parse(str)
            return {
              state: {
                ...state,
                selectedIds: new Set<string>(state.selectedIds ?? []),
                count: (state.selectedIds ?? []).length,
              },
            }
          } catch { return null }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return
          try {
            const { state } = value
            localStorage.setItem(name, JSON.stringify({
              state: { ...state, selectedIds: Array.from(state.selectedIds) }
            }))
          } catch {}
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return
          localStorage.removeItem(name)
        },
      },
    }
  )
)
