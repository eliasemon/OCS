import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function buildInstallUrl(appIds: string[], base = "https://winsetup.app"): string {
  return `${base}/api/install.ps1?apps=${appIds.join(",")}`
}

export function buildPowerShellCommand(appIds: string[], base = "https://winsetup.app"): string {
  const url = buildInstallUrl(appIds, base)
  return `powershell -ExecutionPolicy Bypass -c "irm ${url} | iex"`
}

export function buildCmdCommand(appIds: string[], base = "https://winsetup.app"): string {
  const url = buildInstallUrl(appIds, base)
  return `powershell -ExecutionPolicy Bypass -Command "irm ${url} | iex"`
}

export function buildShareUrl(appIds: string[], base = "https://winsetup.app"): string {
  return `${base}/share?apps=${appIds.join(",")}`
}

export function buildBrewCommand(appIds: string[]): string {
  const casks = appIds.filter(id => id.startsWith('cask:')).map(id => id.replace('cask:', ''))
  const formulas = appIds.filter(id => id.startsWith('formula:')).map(id => id.replace('formula:', ''))
  const unclassified = appIds.filter(id => !id.startsWith('cask:') && !id.startsWith('formula:'))

  let cmd = `# Install Homebrew if not installed
if ! command -v brew &> /dev/null; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install packages
`
  if (casks.length > 0) cmd += `brew install --cask ${casks.join(" ")}\n`
  if (formulas.length > 0) cmd += `brew install ${formulas.join(" ")}\n`
  if (unclassified.length > 0) cmd += `brew install ${unclassified.join(" ")}\n`

  return cmd.trim()
}
