import type { Preset } from "@/types/package"

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "fullstack-dev",
    name: "Full Stack Dev",
    description: "Everything a full-stack developer needs to get started",
    icon: "⚡",
    packageIds: [
      "Git.Git", "Microsoft.VisualStudioCode", "OpenJS.NodeJS.LTS",
      "Docker.DockerDesktop", "Postman.Postman", "Microsoft.WindowsTerminal",
      "Microsoft.PowerShell", "GitHub.GitHubDesktop", "dbeaver.dbeaver"
    ]
  },
  {
    id: "frontend-dev",
    name: "Frontend Dev",
    description: "Modern frontend development tools and browsers",
    icon: "🎨",
    packageIds: [
      "Git.Git", "Microsoft.VisualStudioCode", "OpenJS.NodeJS.LTS",
      "Google.Chrome", "Mozilla.Firefox", "Figma.Figma", "Microsoft.WindowsTerminal"
    ]
  },
  {
    id: "fresh-windows",
    name: "Fresh Windows",
    description: "Essential apps for any new Windows installation",
    icon: "🪟",
    packageIds: [
      "Google.Chrome", "7zip.7zip", "VideoLAN.VLC", "Notepad++.Notepad++",
      "Microsoft.PowerToys", "Bitwarden.Bitwarden", "Spotify.Spotify", "Discord.Discord"
    ]
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    description: "Cloud, containers, and infrastructure tools",
    icon: "🏗️",
    packageIds: [
      "Git.Git", "Microsoft.VisualStudioCode", "Docker.DockerDesktop",
      "Hashicorp.Terraform", "Microsoft.AzureCLI", "Amazon.AWSCLI",
      "Microsoft.PowerShell", "Microsoft.WindowsTerminal"
    ]
  },
  {
    id: "designer",
    name: "Designer",
    description: "Creative tools for UI/UX and graphic design",
    icon: "🖌️",
    packageIds: [
      "Figma.Figma", "GIMP.GIMP", "Inkscape.Inkscape",
      "Blender.Blender", "Google.Chrome", "Notion.Notion"
    ]
  },
  {
    id: "gamer",
    name: "Gamer Setup",
    description: "Game launchers, Discord, and gaming utilities",
    icon: "🎮",
    packageIds: [
      "Valve.Steam", "EpicGames.EpicGamesLauncher", "Discord.Discord",
      "GOG.Galaxy", "Playnite.Playnite"
    ]
  },
  {
    id: "privacy-focused",
    name: "Privacy Focused",
    description: "Tools that respect your privacy",
    icon: "🔒",
    packageIds: [
      "Brave.Brave", "Signal.Signal", "Bitwarden.Bitwarden",
      "Telegram.TelegramDesktop", "Obsidian.Obsidian", "7zip.7zip"
    ]
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Recording, streaming, and media production",
    icon: "🎥",
    packageIds: [
      "OBSProject.OBSStudio", "Audacity.Audacity", "Kdenlive.Kdenlive",
      "GIMP.GIMP", "Spotify.Spotify", "Discord.Discord", "ShareX.ShareX"
    ]
  }
]

export function getPresetById(id: string): Preset | undefined {
  return BUILT_IN_PRESETS.find(p => p.id === id)
}
