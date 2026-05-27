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

export function buildInstallUrl(appIds: string[], base = process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app"): string {
  return `${base}/api/install.ps1?apps=${appIds.join(",")}`
}

export function buildPowerShellCommand(appIds: string[], base = process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app"): string {
  const url = buildInstallUrl(appIds, base)
  return `powershell -ExecutionPolicy Bypass -c "irm ${url} | iex"`
}

export function buildCmdCommand(appIds: string[], base = process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app"): string {
  const url = buildInstallUrl(appIds, base)
  return `powershell -ExecutionPolicy Bypass -Command "irm ${url} | iex"`
}

export function buildShareUrl(appIds: string[], base = process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app"): string {
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

export function buildLinuxCommand(appIds: string[]): string {
  const aptPackages = appIds.filter(id => id.startsWith('apt:')).map(id => id.replace('apt:', ''))
  const flatpakPackages = appIds.filter(id => id.startsWith('flatpak:')).map(id => id.replace('flatpak:', ''))
  const snapPackages = appIds.filter(id => id.startsWith('snap:')).map(id => id.replace('snap:', ''))
  const unclassified = appIds.filter(id => !id.startsWith('apt:') && !id.startsWith('flatpak:') && !id.startsWith('snap:'))

  let cmd = `#!/bin/bash\n\n`
  
  if (aptPackages.length > 0 || unclassified.length > 0) {
    cmd += `# Update and install APT packages\n`
    cmd += `sudo apt update\n`
    const allApt = [...aptPackages, ...unclassified]
    cmd += `sudo apt install -y ${allApt.join(" ")}\n\n`
  }

  if (flatpakPackages.length > 0) {
    cmd += `# Install Flatpak packages\n`
    cmd += `flatpak install -y flathub ${flatpakPackages.join(" ")}\n\n`
  }

  if (snapPackages.length > 0) {
    cmd += `# Install Snap packages\n`
    cmd += `sudo snap install ${snapPackages.join(" ")}\n\n`
  }

  return cmd.trim()
}
