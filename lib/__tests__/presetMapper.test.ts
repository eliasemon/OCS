import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mapPackageIdsToOs, getPersistedOs } from "../presetMapper"

describe("presetMapper", () => {
  describe("getPersistedOs", () => {
    const originalWindow = global.window

    beforeEach(() => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it("should return windows when window is undefined", () => {
      vi.stubGlobal("window", undefined)
      expect(getPersistedOs()).toBe("windows")
    })

    it("should return the persisted OS from localStorage when available", () => {
      vi.stubGlobal("window", {})
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ state: { os: "mac" } }))
      expect(getPersistedOs()).toBe("mac")

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ state: { os: "linux" } }))
      expect(getPersistedOs()).toBe("linux")
    })

    it("should return windows when localStorage contains invalid JSON or state", () => {
      vi.stubGlobal("window", {})
      vi.mocked(localStorage.getItem).mockReturnValue("invalid-json")
      expect(getPersistedOs()).toBe("windows")

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({}))
      expect(getPersistedOs()).toBe("windows")
    })
  })

  describe("mapPackageIdsToOs", () => {
    it("should keep IDs as-is if they already exist in the target OS", () => {
      // cask:visual-studio-code exists in macOS package data
      const resultMac = mapPackageIdsToOs(["cask:visual-studio-code"], "mac")
      expect(resultMac).toContain("cask:visual-studio-code")

      // apt:visual-studio-code exists in Linux package data
      const resultLinux = mapPackageIdsToOs(["apt:visual-studio-code"], "linux")
      expect(resultLinux).toContain("apt:visual-studio-code")

      // Microsoft.VisualStudioCode exists in Windows package data
      const resultWindows = mapPackageIdsToOs(["Microsoft.VisualStudioCode"], "windows")
      expect(resultWindows).toContain("Microsoft.VisualStudioCode")
    })

    it("should correctly map Windows IDs to macOS cask IDs using icon matcher", () => {
      const windowsIds = ["Git.Git", "Microsoft.VisualStudioCode", "Docker.DockerDesktop", "Postman.Postman"]
      const mapped = mapPackageIdsToOs(windowsIds, "mac")

      expect(mapped).toContain("formula:git")
      expect(mapped).toContain("cask:visual-studio-code")
      expect(mapped).toContain("cask:docker")
      expect(mapped).toContain("cask:postman")
      expect(mapped.length).toBe(4)
    })

    it("should correctly map Windows IDs to Linux apt IDs using icon matcher", () => {
      const windowsIds = ["Git.Git", "Microsoft.VisualStudioCode", "Docker.DockerDesktop"]
      const mapped = mapPackageIdsToOs(windowsIds, "linux")

      expect(mapped).toContain("apt:git")
      expect(mapped).toContain("apt:visual-studio-code")
      expect(mapped).toContain("apt:docker-desktop")
      expect(mapped.length).toBe(3)
    })

    it("should map macOS/Linux IDs back to Windows Winget IDs using icon matcher", () => {
      const macIds = ["cask:visual-studio-code", "formula:git"]
      const mapped = mapPackageIdsToOs(macIds, "windows")

      expect(mapped).toContain("Microsoft.VisualStudioCode")
      expect(mapped).toContain("Git.Git")
      expect(mapped.length).toBe(2)
    })

    it("should filter out IDs that cannot be resolved in any OS catalog", () => {
      const mapped = mapPackageIdsToOs(["NonExistent.App.Id", "Microsoft.VisualStudioCode"], "mac")
      expect(mapped).toEqual(["cask:visual-studio-code"])
    })
  })
})
