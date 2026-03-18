// Auto-generated mappings from winget package IDs to Simple Icons brand slugs
// This helps map package IDs to their brand icons

export const packageIdToBrandSlug: Record<string, string> = {
  "Git.Git": "git",
  "Microsoft.VisualStudioCode": "visualstudiocode",
  "OpenJS.NodeJS.LTS": "nodejs",
  "Python.Python.3.13": "python",
  "Docker.DockerDesktop": "docker",
  "Google.Chrome": "googlechrome",
  "Mozilla.Firefox": "firefox",
  "Microsoft.Edge": "microsoftedge",
  "Microsoft.VisualStudio.2022.BuildTools": "visualstudio",
  "Microsoft.WindowsTerminal": "windows",
  "OpenJS.NodeJS": "nodejs",
  "Python.Python": "python",
  "Golang.Go": "go",
  "Rustlang.Rust.MSVC": "rust",
  "Java.OpenJDK": "openjdk",
  "Adobe.Acrobat.Reader.64-bit": "adobe",
  "Microsoft.OneDrive": "microsoftonedrive",
  "Spotify.Spotify": "spotify",
  "Valve.Steam": "steam",
  "Discord.Discord": "discord",
  "Slack.Slack": "slack",
  "Notion.Notion": "notion",
  "Tencent.WeChat": "wechat",
  "Microsoft.Teams": "microsoftteams",
  "Zoom.Zoom": "zoom",
  "VideoLAN.VLC": "vlcmediaplayer",
  "Bitwarden.Bitwarden": "bitwarden",
  "1Password.1Password": "1password",
  "Microsoft.PowerToys": "microsoft",
  "Microsoft.WindowsSDK": "windows",
  "GitHub.cli": "github",
  "GitExtensionsTeam.GitExtensions": "git",
  "TortoiseGit.TortoiseGit": "git"
}

/**
 * Get the brand slug for a winget package ID
 * @param packageId - The winget package ID (e.g., 'Microsoft.VisualStudioCode')
 * @returns The brand slug or undefined if no mapping exists
 */
export function getBrandSlugForPackage(packageId: string): string | undefined {
  return packageIdToBrandSlug[packageId]
}

/**
 * Extract a potential brand slug from a package ID
 * This tries to guess the brand from the publisher name
 * @param packageId - The winget package ID
 * @returns A guessed brand slug or undefined
 */
export function guessBrandSlug(packageId: string): string | undefined {
  // Extract publisher name (part before the dot)
  const match = packageId.match(/^([^.]+)\./)
  if (!match) return undefined

  const publisher = match[1].toLowerCase()
  const appName = packageId.substring(packageId.indexOf('.') + 1).toLowerCase()

  // Try some common transformations - return first that might work
  // Remove dots from app name for packages like Visual.Studio.Code
  return appName.replace(/\./g, '')
}
