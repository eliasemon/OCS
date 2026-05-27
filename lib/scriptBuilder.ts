/**
 * Escapes user input for safe interpolation into PowerShell scripts.
 * Prevents command injection by escaping PowerShell special characters.
 * @see https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules
 */
function escapePowerShell(str: string): string {
  return str
    .replace(/`/g, '``')  // Backtick (command substitution) - MUST BE FIRST
    .replace(/\$/g, '`$')  // Dollar sign (variable interpolation)
    .replace(/"/g, '`"')  // Double quote (string breakout)
    .replace(/'/g, "''")   // Single quote (string breakout)
}

export function buildInstallScript(validIds: string[], invalidIds: string[]): string {
  const timestamp = new Date().toISOString()
  const pkgList = validIds.map(id => `  "${escapePowerShell(id)}"`).join(",\n")
  const warnBlock = invalidIds
    .map(id => `Write-Warning "Skipping unknown package: ${escapePowerShell(id)}"`)
    .join("\n")

  return `#Requires -Version 5.1
<#
.SYNOPSIS  Appnest Installer
.GENERATED ${timestamp}
.PACKAGES  ${validIds.length}
.SOURCE    appnest.app
#>
$ErrorActionPreference = "Continue"
$packages = @(
${pkgList}
)
${warnBlock}

function Write-Banner {
  $c = "Cyan"
  Write-Host ""
  Write-Host "  ██╗    ██╗██╗███╗   ██╗███████╗███████╗████████╗██╗   ██╗██████╗ " -ForegroundColor $c
  Write-Host "  ██║    ██║██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗" -ForegroundColor $c
  Write-Host "  ██║ █╗ ██║██║██╔██╗ ██║███████╗█████╗     ██║   ██║   ██║██████╔╝" -ForegroundColor $c
  Write-Host "  ██║███╗██║██║██║╚██╗██║╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ " -ForegroundColor $c
  Write-Host "  ╚███╔███╔╝██║██║ ╚████║███████║███████╗   ██║   ╚██████╔╝██║     " -ForegroundColor $c
  Write-Host "   ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝    " -ForegroundColor $c
  Write-Host "  Automated Windows Package Installer — appnest.app" -ForegroundColor DarkGray
  Write-Host ""
}

function Test-WingetInstalled {
  try { $null = Get-Command winget -ErrorAction Stop; return $true }
  catch { return $false }
}

function Install-WingetIfMissing {
  Write-Host "[Appnest] winget not found. Installing..." -ForegroundColor Yellow
  try {
    $rel = Invoke-RestMethod "https://api.github.com/repos/microsoft/winget-cli/releases/latest"
    $url = ($rel.assets | Where-Object { $_.name -like "*.msixbundle" })[0].browser_download_url
    $tmp = "$env:TEMP\\WinGet.msixbundle"
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
    Add-AppxPackage -Path $tmp
    Write-Host "[Appnest] winget installed." -ForegroundColor Green
  } catch {
    Write-Error "[Appnest] Could not install winget: $_"; exit 1
  }
}

function Install-Package {
  param([string]$Id)
  Write-Host ""
  Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
  Write-Host "  ▶ $Id" -ForegroundColor White
  $listed = winget list --id $Id --exact --accept-source-agreements 2>&1
  if ($LASTEXITCODE -eq 0 -and ($listed | Select-String ([regex]::Escape($Id)))) {
    Write-Host "  [SKIP] Already installed" -ForegroundColor DarkYellow
    return "skipped"
  }
  $attempt = 0
  do {
    $attempt++
    if ($attempt -gt 1) { Write-Host "  [RETRY] Attempt $attempt/2..." -ForegroundColor Yellow; Start-Sleep 3 }
    winget install --id=$Id -e --silent --accept-package-agreements --accept-source-agreements --disable-interactivity 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
  } while ($LASTEXITCODE -ne 0 -and $attempt -lt 2)
  if ($LASTEXITCODE -eq 0) { Write-Host "  [OK] Success" -ForegroundColor Green; return "success" }
  else { Write-Host "  [FAIL] Failed" -ForegroundColor Red; return "failed" }
}

Write-Banner
if (-not (Test-WingetInstalled)) { Install-WingetIfMissing }
$ver = winget --version
Write-Host "[Appnest] winget $ver" -ForegroundColor DarkGray
Write-Host "[Appnest] Installing $($packages.Count) package(s)..." -ForegroundColor Cyan

$r = @{
  success = [System.Collections.Generic.List[string]]::new()
  skipped = [System.Collections.Generic.List[string]]::new()
  failed  = [System.Collections.Generic.List[string]]::new()
}
$t0 = Get-Date
foreach ($pkg in $packages) { $s = Install-Package $pkg; $r[$s].Add($pkg) }
$dur = [math]::Round(((Get-Date)-$t0).TotalSeconds)

Write-Host ""
Write-Host "  ══════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✓ Installed : $($r.success.Count)"  -ForegroundColor Green
Write-Host "  ⊘ Skipped   : $($r.skipped.Count)"  -ForegroundColor Yellow
Write-Host "  ✗ Failed    : $($r.failed.Count)"   -ForegroundColor Red
Write-Host "  ⏱ Duration  : " + $dur + "s" -ForegroundColor Gray
Write-Host "  ══════════════════════════════════" -ForegroundColor Cyan
if ($r.failed.Count -gt 0) {
  Write-Host ""
  Write-Host "  Retry failed:" -ForegroundColor Red
  $fl = $r.failed -join ","
  Write-Host "  powershell -c \"irm https://appnest.app/api/install.ps1?apps=$fl | iex\"" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "  Restart terminal to apply PATH changes." -ForegroundColor DarkCyan
Write-Host ""`
}

export function buildCliScript(): string {
  return `#Requires -Version 5.1
<# Appnest CLI — Interactive Terminal Installer #>

$ErrorActionPreference = "Continue"
$baseUrl = "https://appnest.app"

function Write-Banner {
  Write-Host ""
  Write-Host "  Appnest CLI — Interactive Installer" -ForegroundColor Cyan
  Write-Host "  appnest.app" -ForegroundColor DarkGray
  Write-Host ""
}

function Get-Packages {
  try {
    $data = Invoke-RestMethod "$baseUrl/api/packages" -UseBasicParsing
    return $data
  } catch {
    Write-Error "Failed to fetch package list: $_"; exit 1
  }
}

function Show-CategoryMenu {
  param($packages)
  $categories = $packages | Select-Object -ExpandProperty category -Unique | Sort-Object
  Write-Host "  Select a category:" -ForegroundColor White
  $i = 1
  foreach ($cat in $categories) {
    $count = ($packages | Where-Object { $_.category -eq $cat }).Count
    Write-Host "  [$i] $cat ($count packages)" -ForegroundColor Gray
    $i++
  }
  Write-Host "  [A] All packages"   -ForegroundColor Gray
  Write-Host "  [Q] Quit"           -ForegroundColor DarkGray
  Write-Host ""
  $choice = Read-Host "  Enter choice"
  if ($choice -eq "Q") { exit 0 }
  if ($choice -eq "A") { return $packages }
  $idx = [int]$choice - 1
  if ($idx -ge 0 -and $idx -lt $categories.Count) {
    return $packages | Where-Object { $_.category -eq $categories[$idx] }
  }
  return $packages
}

function Select-Packages {
  param($packages)
  $selected = @()
  Write-Host ""
  Write-Host "  Toggle packages (enter number, DONE to finish, ALL to select all):" -ForegroundColor White
  Write-Host ""
  $i = 1
  foreach ($pkg in $packages) {
    $mark = if ($selected -contains $pkg.id) { "[x]" } else { "[ ]" }
    Write-Host "  $mark [$i] $($pkg.icon) $($pkg.name) — $($pkg.description)" -ForegroundColor Gray
    $i++
  }
  do {
    Write-Host ""
    $input = Read-Host "  Toggle # (or DONE/ALL)"
    if ($input -eq "ALL") { $selected = $packages | ForEach-Object { $_.id }; break }
    if ($input -eq "DONE") { break }
    $num = [int]$input - 1
    if ($num -ge 0 -and $num -lt $packages.Count) {
      $id = $packages[$num].id
      if ($selected -contains $id) { $selected = $selected | Where-Object { $_ -ne $id } }
      else { $selected += $id }
      Write-Host "  Selected: $($selected.Count)" -ForegroundColor Cyan
    }
  } while ($true)
  return $selected
}

Write-Banner
$allPackages = Get-Packages
$filtered = Show-CategoryMenu -packages $allPackages
$selectedIds = Select-Packages -packages $filtered

if ($selectedIds.Count -eq 0) {
  Write-Host "No packages selected. Exiting." -ForegroundColor Yellow; exit 0
}

$appsList = $selectedIds -join ","
$scriptUrl = "$baseUrl/api/install.ps1?apps=$appsList"
Write-Host ""
Write-Host "  Fetching install script for $($selectedIds.Count) packages..." -ForegroundColor Cyan
$script = Invoke-RestMethod $scriptUrl -UseBasicParsing
Invoke-Expression $script`
}
