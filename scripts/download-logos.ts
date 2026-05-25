#!/usr/bin/env node
/**
 * Logo Downloader Script
 *
 * Downloads company logos from img.logo.dev for all packages
 * and saves them to public/images/logos/
 *
 * Usage: npx tsx scripts/download-logos.ts
 * Environment variables:
 *   LOGO_DEV_TOKEN - API token for img.logo.dev (optional, uses default if not set)
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import package data and domain mapping
const PACKAGES_JSON = path.join(__dirname, '../data/packages.json')
const OUTPUT_DIR = path.join(__dirname, '../public/images/logos')
const API_TOKEN = process.env.LOGO_DEV_TOKEN || 'pk_Bz35dSmGTpOP1Lzkqd0opw'
const API_BASE = 'https://img.logo.dev'

// Domain mapping
const PACKAGE_DOMAIN_MAP: Record<string, string> = {
  'Git.Git': 'git-scm.com',
  'Microsoft.VisualStudioCode': 'code.visualstudio.com',
  'OpenJS.NodeJS.LTS': 'nodejs.org',
  'OpenJS.NodeJS': 'nodejs.org',
  'Python.Python.3.13': 'python.org',
  'Python.Python': 'python.org',
  'Docker.DockerDesktop': 'docker.com',
  'Microsoft.WindowsTerminal': 'github.com',
  'Postman.Postman': 'postman.com',
  'Microsoft.PowerShell': 'microsoft.com',
  'GitHub.GitHubDesktop': 'github.com',
  'GitHub.cli': 'github.com',
  'JetBrains.IntelliJIDEA.Community': 'jetbrains.com',
  'JetBrains.WebStorm': 'jetbrains.com',
  'JetBrains.PyCharm.Community': 'jetbrains.com',
  'JetBrains.Toolbox': 'jetbrains.com',
  'Cursor.Cursor': 'cursor.sh',
  'Rustlang.Rustup': 'rust-lang.org',
  'Rustlang.Rust.MSVC': 'rust-lang.org',
  'GoLang.Go': 'go.dev',
  'Golang.Go': 'go.dev',
  'Microsoft.DotNet.Runtime.8': 'microsoft.com',
  'Microsoft.DotNet.DesktopRuntime.8': 'microsoft.com',
  'Microsoft.DotNet.Runtime.9': 'microsoft.com',
  'Microsoft.DotNet.DesktopRuntime.9': 'microsoft.com',
  'Microsoft.DotNet.Runtime.10': 'microsoft.com',
  'Microsoft.DotNet.DesktopRuntime.10': 'microsoft.com',
  'Microsoft.ASP.NET.Core.8': 'microsoft.com',
  'Microsoft.ASP.NET.Core.9': 'microsoft.com',
  'Microsoft.ASP.NET.Core.10': 'microsoft.com',
  'AdoptOpenJDK.OpenJDK.8': 'adoptium.net',
  'AdoptOpenJDK.OpenJDK.11': 'adoptium.net',
  'AdoptOpenJDK.OpenJDK.17': 'adoptium.net',
  'AdoptOpenJDK.OpenJDK.21': 'adoptium.net',
  'Amazon.Corretto.17': 'amazon.com',
  'Amazon.Corretto.21': 'amazon.com',
  'Amazon.AWSCLI': 'amazon.com',
  'EclipseAdoptium.Temurin.17.JDK': 'eclipse.org',
  'Hashicorp.Terraform': 'terraform.io',
  'Microsoft.AzureCLI': 'azure.microsoft.com',
  'Neovim.Neovim': 'neovim.io',
  'dbeaver.dbeaver': 'dbeaver.com',
  'Insomnia.Insomnia': 'insomnia.rest',
  'Oracle.JDK.21': 'oracle.com',
  'Oracle.JDK.17': 'oracle.com',
  'Oracle.VirtualBox': 'virtualbox.org',
  'RubyInstallerTeam.Ruby': 'ruby-lang.org',
  'PHP.PHP': 'php.net',
  'PHP.Composer': 'getcomposer.org',
  'Oracle.MySQL': 'mysql.com',
  'PostgreSQL.PostgreSQL': 'postgresql.org',
  'MongoDB.Server': 'mongodb.com',
  'Redis.Redis': 'redis.io',
  'TablePlus.TablePlus': 'tableplus.com',
  'Axosoft.GitKraken': 'gitkraken.com',
  'Atlassian.Sourcetree': 'atlassian.com',
  'Atlassian.Trello': 'atlassian.com',
  'MSYS2.MSYS2': 'msys2.org',
  'Kitware.CMake': 'cmake.org',
  'LLVM.LLVM': 'llvm.org',
  'Yarn.Yarn': 'yarnpkg.com',
  'pnpm.pnpm': 'pnpm.io',
  'DenoLand.Deno': 'deno.com',
  'Oven-sh.Bun': 'bun.sh',
  'Netlify.Netlify': 'netlify.com',
  'Google.CloudSDK': 'cloud.google.com',
  'Google.Chrome': 'google.com',
  'Google.Drive': 'google.com',
  'Google.Earth': 'google.com',
  'Kubernetes.kubectl': 'kubernetes.io',
  'Helm.Helm': 'helm.sh',
  'SublimeHQ.SublimeText.4': 'sublimetext.com',
  'GitHub.Atom': 'github.com',
  'vim.vim': 'vim.org',
  'GNU.Emacs': 'gnu.org',
  'StataCorp.Stata': 'stata.com',
  'RProject.R': 'r-project.org',
  'Posit.RStudio': 'posit.co',
  'Anaconda.Anaconda3': 'anaconda.com',
  'Anaconda.Miniconda3': 'anaconda.com',
  'Project Jupyter.JupyterDesktop': 'jupyter.org',
  'JuliaLang.julia': 'julialang.org',
  'MathWorks.MATLAB': 'mathworks.com',
  'GNU.Octave': 'gnu.org',
  'SageMath.SageMath': 'sagemath.org',
  'OSGeo.QGIS': 'qgis.org',
  'OpenBabel.OpenBabel': 'openbabel.org',
  'MiKTeX.MiKTeX': 'miktex.org',
  'TeX.Live': 'tug.org',
  'Mozilla.Firefox': 'mozilla.org',
  'Mozilla.Thunderbird': 'mozilla.org',
  'Brave.Brave': 'brave.com',
  'Microsoft.Edge': 'microsoft.com',
  'Opera.Opera': 'opera.com',
  'Opera.OperaGX': 'opera.com',
  'Vivaldi.Vivaldi': 'vivaldi.com',
  'Zen-Team.Zen-Browser': 'zen-browser.app',
  'TorProject.TorBrowser': 'torproject.org',
  'LibreWolf.LibreWolf': 'librewolf.net',
  'VideoLAN.VLC': 'videolan.org',
  'Spotify.Spotify': 'spotify.com',
  'OBSProject.OBSStudio': 'obsproject.com',
  'GIMP.GIMP': 'gimp.org',
  'Inkscape.Inkscape': 'inkscape.org',
  'dotnet.Paint.NET': 'getpaint.net',
  'IrfanSkiljan.IrfanView': 'irfanview.com',
  'XnSoft.XnView': 'xnview.com',
  'FastStone.FastStoneImageViewer': 'faststone.org',
  'HandBrake.HandBrake': 'handbrake.fr',
  'Audacity.Audacity': 'audacityteam.org',
  'Apple.iTunes': 'apple.com',
  'AIMP.AIMP': 'aimp.ru',
  'foobar2000.foobar2000': 'foobar2000.org',
  'PeterPawlowski.foobar2000': 'foobar2000.org',
  'Winamp.Winamp': 'winamp.com',
  'MusicBee.MusicBee': 'getmusicbee.com',
  'CodecGuide.K-LiteCodecPack': 'codecguide.com',
  'CodecGuide.K-LiteCodecPack.Full': 'codecguide.com',
  'GOMLab.GOMPlayer': 'gomlab.com',
  'CCCP.CCCP': 'cccp-project.net',
  'MediaMonkey.MediaMonkey': 'mediamonkey.com',
  'Kdenlive.Kdenlive': 'kdenlive.org',
  'clsid2.mpc-hc': 'mpc-hc.org',
  'Daum.PotPlayer': 'potplayer.daum.net',
  'mpv.net': 'mpv.io',
  'Gyan.FFmpeg': 'ffmpeg.org',
  'Streamlabs.Streamlabs': 'streamlabs.com',
  'Blackmagic.DaVinciResolve': 'blackmagicdesign.com',
  'Meltytech.Shotcut': 'shotcut.org',
  'ImageMagick.ImageMagick': 'imagemagick.org',
  'darktable.darktable': 'darktable.org',
  'KDE.Krita': 'krita.org',
  'Discord.Discord': 'discord.com',
  'Microsoft.Teams': 'microsoft.com',
  'Microsoft.Skype': 'microsoft.com',
  'SlackTechnologies.Slack': 'slack.com',
  'Zoom.Zoom': 'zoom.us',
  'Telegram.TelegramDesktop': 'telegram.org',
  'WhatsApp.WhatsApp': 'whatsapp.com',
  'Signal.Signal': 'signal.org',
  'OpenWhisperSystems.Signal': 'signal.org',
  'Pidgin.Pidgin': 'pidgin.im',
  'Viber.Viber': 'viber.com',
  'Element.Element': 'element.io',
  'Mattermost.MattermostDesktop': 'mattermost.com',
  'eMClient.eMClient': 'emclient.com',
  'Cisco.WebexTeams': 'webex.com',
  '7zip.7zip': '7-zip.org',
  'PeaZip.Peazip': 'peazip.github.io',
  'RARLab.WinRAR': 'rarlab.com',
  'Notepad++.Notepad++': 'notepad-plus-plus.org',
  'Microsoft.VCRedist.2015+.x64': 'microsoft.com',
  'Microsoft.VCRedist.2015+.x86': 'microsoft.com',
  'Microsoft.VCRedist.2013.x64': 'microsoft.com',
  'Microsoft.VCRedist.2013.x86': 'microsoft.com',
  'FileZillaClient.FileZilla': 'filezilla-project.org',
  'WinSCP.WinSCP': 'winscp.net',
  'PuTTY.PuTTY': 'putty.org',
  'WinMerge.WinMerge': 'winmerge.org',
  'Microsoft.PowerToys': 'microsoft.com',
  'Microsoft.Sysinternals': 'microsoft.com',
  'Microsoft.Sysinternals.Autoruns': 'microsoft.com',
  'Microsoft.Sysinternals.ProcessExplorer': 'microsoft.com',
  'Bitwarden.Bitwarden': 'bitwarden.com',
  'Malwarebytes.Malwarebytes': 'malwarebytes.com',
  'Avast.Avast': 'avast.com',
  'AVG.AVG': 'avg.com',
  'SaferNetworkingLimited.SpybotAntiBeacon': 'safer-networking.org',
  'Avira.Avira': 'avira.com',
  'SUPERAntiSpyware.SUPERAntiSpyware': 'superantispyware.com',
  'Greenshot.Greenshot': 'greenshot.org',
  'ShareX.ShareX': 'getsharex.com',
  'Flameshot.Flameshot': 'flameshot.org',
  'Skillbrains.Lightshot': 'app.prntscr.com',
  'qBittorrent.qBittorrent': 'qbittorrent.org',
  'Dropbox.Dropbox': 'dropbox.com',
  'Microsoft.OneDrive': 'microsoft.com',
  'WinDirStat.WinDirStat': 'windirstat.net',
  'AutoHotkey.AutoHotkey': 'autohotkey.com',
  'voidtools.Everything': 'voidtools.com',
  'Evernote.Evernote': 'evernote.com',
  'KeePassKeePass.KeePass': 'keepass.info',
  'KeePassXCTeam.KeePassXC': 'keepassxc.org',
  'NVAccess.NVDA': 'nvaccess.org',
  'AnyDeskSoftwareGmbH.AnyDesk': 'anydesk.com',
  'TeamViewer.TeamViewer': 'teamviewer.com',
  'LIGHTNINGUK.ImgBurn': 'imgburn.com',
  'RealVNC.RealVNC': 'realvnc.com',
  'RealVNC.VNCViewer': 'realvnc.com',
  'TightVNC.TightVNC': 'tightvnc.com',
  'CodeSector.TeraCopy': 'codesector.com',
  'CDBurnerXP.CDBurnerXP': 'cdburnerxp.se',
  'RevoUninstaller.RevoUninstaller': 'revouninstaller.com',
  'Launchy.Launchy': 'launchy.net',
  'AntibodySoftware.WizTree': 'wiztreefree.com',
  'Glarysoft.GlaryUtilities': 'glarysoft.com',
  'Infrarecorder.Infrarecorder': 'infrarecorder.org',
  'Open-Shell.Open-Shell': 'open-shell.net',
  'Piriform.CCleaner': 'ccleaner.com',
  'Piriform.Defraggler': 'defraggler.com',
  'Piriform.Recuva': 'recuva.com',
  'Flow-Launcher.Flow-Launcher': 'flowlauncher.com',
  'NirSoft.NirLauncher': 'nirsoft.net',
  'CrystalDewWorld.CrystalDiskInfo': 'crystalmark.info',
  'CrystalDewWorld.CrystalDiskMark': 'crystalmark.info',
  'JAMSoftware.TreeSize.Free': 'jam-software.com',
  'BulkRenameUtility.BulkRenameUtility': 'bulkrenameutility.co.uk',
  'Tichau.FileConverter': 'fileconverter.software.informer.com',
  'TwistedBit.GeekUninstaller': 'geekuninstaller.com',
  'BleachBit.BleachBit': 'bleachbit.org',
  'EaseUS.DataRecovery': 'easeus.com',
  'Rufus.Rufus': 'rufus.ie',
  'Ventoy.Ventoy': 'ventoy.net',
  'Balena.Etcher': 'balena.io',
  'digimezzo.dopamine': 'digimezzo.github.io',
  'Ditto.Ditto': 'ditto-cp.sourceforge.net',
  'Keypirinha.Keypirinha': 'keypirinha.com',
  'Wox.Wox': 'wox.one',
  'AgileBits.1Password': '1password.com',
  'Dashlane.Dashlane': 'dashlane.com',
  'AO Kaspersky Lab.KasperskyFree': 'kaspersky.com',
  'ProtonVPN.ProtonVPN': 'protonvpn.com',
  'OpenVPNTechnologies.OpenVPN': 'openvpn.net',
  'WireGuard.WireGuard': 'wireguard.com',
  'VeraCrypt.VeraCrypt': 'veracrypt.fr',
  'GnuPG.GnuPG': 'gnupg.org',
  'Transmission.Transmission': 'transmissionbt.com',
  'Nextcloud.NextcloudDesktop': 'nextcloud.com',
  'Syncthing.Syncthing': 'syncthing.net',
  'FreeFileSync.FreeFileSync': 'freefilesync.org',
  'Cyberduck.Cyberduck': 'cyberduck.io',
  'Mega.MEGASync': 'mega.io',
  'Rclone.Rclone': 'rclone.org',
  'Restic.Restic': 'restic.net',
  'Duplicati.Duplicati': 'duplicati.com',
  'Ghisler.TotalCommander': 'totalcommander.com',
  'alexx2000.DoubleCommander': 'doublecmd.com',
  'StefanHenke.Q-Dir': 'softwareok.com',
  'VMware.WorkstationPlayer': 'vmware.com',
  'QEMU.QEMU': 'qemu.org',
  'Microsoft.WSL': 'microsoft.com',
  'HashiCorp.Vagrant': 'vagrantup.com',
  'SUSE.RancherDesktop': 'rancherdesktop.io',
  'stascorp.rdpwrap': 'github.com',
  'tailscale.tailscale': 'tailscale.com',
  'angryziber.AngryIPScanner': 'angryip.org',
  'WiresharkFoundation.Wireshark': 'wireshark.org',
  'Insecure.Nmap': 'nmap.org',
  'Telerik.Fiddler': 'telerik.com',
  'mRemoteNG.mRemoteNG': 'mremoteng.org',
  'RoyalApps.RoyalTS': 'royalapps.com',
  'SimonMuerner.NetSpeedMonitor': 'netspeedmonitor.de',
  'GlassWire.GlassWire': 'glasswire.com',
  'Fortinet.FortiClientVPN': 'fortinet.com',
  'LogMeIn.Hamachi': 'hamachi.cc',
  'Notion.Notion': 'notion.so',
  'Obsidian.Obsidian': 'obsidian.md',
  'Logseq.Logseq': 'logseq.com',
  'LibreOffice.LibreOffice': 'libreoffice.org',
  'Foxit.FoxitReader': 'foxit.com',
  'SumatraPDF.SumatraPDF': 'sumatrapdfreader.org',
  'Cutepdf.CutePDF': 'cutepdf.com',
  'Apache.OpenOffice': 'openoffice.org',
  'Todoist.Todoist': 'todoist.com',
  'Anki.Anki': 'apps.ankiweb.net',
  'calibre.calibre': 'calibre-ebook.com',
  'Microsoft.Office': 'microsoft.com',
  'Kingsoft.WPSOffice': 'wps.com',
  'ONLYOFFICE.DesktopEditors': 'onlyoffice.com',
  'Joplin.Joplin': 'joplinapp.org',
  'Typora.Typora': 'typora.io',
  'marktext.marktext': 'marktext.app',
  'NotepadQQ.Notepad': 'notepadqq.com',
  'geeksoftwareGmbH.PDF24Creator': 'pdf24.org',
  'Adobe.Acrobat.Reader.64-bit': 'adobe.com',
  'Xournalpp.Xournalpp': 'xournalpp.github.io',
  'JGraph.Draw': 'drawio.app',
  'Zotero.Zotero': 'zotero.org',
  'Elsevier.Mendeley': 'mendeley.com',
  'JabRef.JabRef': 'jabref.org',
  'Figma.Figma': 'figma.com',
  'Canva.Canva': 'canva.com',
  'Blender.Blender': 'blender.org',
  'Valve.Steam': 'steampowered.com',
  'EpicGames.EpicGamesLauncher': 'epicgames.com',
  'Playnite.Playnite': 'playnite.link',
  'GOG.Galaxy': 'gog.com',
  'Overwolf.CurseForge': 'curseforge.com',
  'ElectronicArts.EADesktop': 'ea.com',
  'Blizzard.BattleNet': 'blizzard.com',
  'Ubisoft.Connect': 'ubisoft.com',
  'Microsoft.GamingApp': 'xbox.com',
  'Parsec.Parsec': 'parsec.app',
  'Nvidia.GeForceExperience': 'nvidia.com',
  'Guru3D.MSiAfterburner': 'guru3d.com',
  'REALiX.HWiNFO': 'hwinfo.com',
  'CPUID.CPU-Z': 'cpuid.com',
  'TechPowerUp.GPU-Z': 'techpowerup.com',
}

/**
 * Sanitize package ID to create a valid filename
 */
function sanitizePackageId(packageId: string): string {
  return packageId
    .replace(/\./g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

/**
 * Download logo from img.logo.dev
 */
async function downloadLogo(packageId: string, domain: string): Promise<{ success: boolean; path?: string; error?: string }> {
  const filename = `${sanitizePackageId(packageId)}.png`
  const outputPath = path.join(OUTPUT_DIR, filename)

  // Build API URL with parameters
  const url = `${API_BASE}/${domain}?token=${API_TOKEN}&format=png&size=128`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(outputPath, buffer)

    return { success: true, path: `/images/logos/${filename}` }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Delay between requests to avoid rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main function
 */
async function main() {
  console.log('🔷 Logo Downloader for WinSetup')
  console.log('==================================\n')

  // Read packages.json
  const packagesJson = await readFile(PACKAGES_JSON, 'utf-8')
  const packages = JSON.parse(packagesJson) as Array<{ id: string; name: string }>

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`)
  }

  const results = {
    success: [] as string[],
    failed: [] as string[],
    skipped: [] as string[],
  }

  console.log(`📦 Processing ${packages.length} packages...\n`)

  for (const pkg of packages) {
    const domain = PACKAGE_DOMAIN_MAP[pkg.id]

    if (!domain) {
      console.log(`⏭️  Skipped (no domain): ${pkg.name} (${pkg.id})`)
      results.skipped.push(pkg.id)
      continue
    }

    process.stdout.write(`⬇️  Downloading: ${pkg.name} (${domain})... `)

    const result = await downloadLogo(pkg.id, domain)

    if (result.success) {
      console.log('✅')
      results.success.push(pkg.id)
    } else {
      console.log(`❌ (${result.error})`)
      results.failed.push(pkg.id)
    }

    // Delay between requests to be nice to the API
    await delay(100)
  }

  // Print summary
  console.log('\n📊 Summary')
  console.log('==========')
  console.log(`✅ Success: ${results.success.length}`)
  console.log(`❌ Failed:  ${results.failed.length}`)
  console.log(`⏭️  Skipped: ${results.skipped.length}`)

  if (results.failed.length > 0) {
    console.log('\n❌ Failed packages:')
    results.failed.forEach(id => console.log(`   - ${id}`))
  }

  // Generate logo URL mapping for packages.json
  const logoUrlMap: Record<string, string> = {}
  for (const pkgId of results.success) {
    logoUrlMap[pkgId] = `/images/logos/${sanitizePackageId(pkgId)}.png`
  }

  // Save mapping to file for later use
  const mappingPath = path.join(__dirname, '../data/logo-url-map.json')
  await writeFile(mappingPath, JSON.stringify(logoUrlMap, null, 2))
  console.log(`\n💾 Saved logo URL mapping to: ${mappingPath}`)

  console.log('\n✨ Done!')
}

main().catch(console.error)
