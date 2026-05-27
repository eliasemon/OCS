import windowsPackages from "@/data/packages.json"
import macPackages from "@/data/mac-packages.json"
import linuxPackages from "@/data/linux-packages.json"

export type OsMode = "windows" | "mac" | "linux"

/**
 * Reads the current operating system from local storage to avoid circular store dependencies.
 */
export function getPersistedOs(): OsMode {
  if (typeof window === "undefined") return "windows"
  try {
    const val = localStorage.getItem("installora-os-mode")
    if (val) {
      const parsed = JSON.parse(val)
      if (parsed?.state?.os) {
        return parsed.state.os as OsMode
      }
    }
  } catch {}
  return "windows"
}

/**
 * Maps package IDs from any OS format to the target OS package IDs
 */
export function mapPackageIdsToOs(ids: readonly string[], targetOs: OsMode): string[] {
  const targetPackages = 
    targetOs === "mac" ? macPackages :
    targetOs === "linux" ? linuxPackages :
    windowsPackages;

  const targetIds = new Set(targetPackages.map(p => p.id));

  return ids.map(id => {
    // If the ID already exists in the target OS, keep it
    if (targetIds.has(id)) {
      return id;
    }

    // Otherwise, find the package in any OS catalog to identify it
    const allPackages = [...windowsPackages, ...macPackages, ...linuxPackages];
    const sourcePkg = allPackages.find(p => p.id === id);
    if (!sourcePkg) {
      return null;
    }

    // Primary Matcher: Same icon field (highly consistent across OS files)
    if (sourcePkg.icon) {
      const match = targetPackages.find(p => p.icon.toLowerCase() === sourcePkg.icon.toLowerCase());
      if (match) {
        return match.id;
      }
    }

    // Fallback Matcher: Case-insensitive name comparison
    const normalizedSourceName = sourcePkg.name.toLowerCase().replace(/\s+/g, "");
    const nameMatch = targetPackages.find(p => {
      const normalizedTargetName = p.name.toLowerCase().replace(/\s+/g, "");
      return normalizedTargetName === normalizedSourceName || 
             normalizedTargetName.includes(normalizedSourceName) ||
             normalizedSourceName.includes(normalizedTargetName);
    });
    if (nameMatch) {
      return nameMatch.id;
    }

    return null;
  }).filter((id): id is string => id !== null);
}
