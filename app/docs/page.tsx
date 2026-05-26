"use client"

import Link from "next/link"
import { useState } from "react"
import { Monitor, Apple, Terminal } from "lucide-react"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"windows" | "mac" | "linux">("windows")

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-hover))] transition-colors">
          &larr; Back to OneSetup
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">OneSetup Documentation</h1>
        <p className="text-lg text-[hsl(var(--color-muted-foreground))] mb-8">
          Learn how to install, configure, and use OneSetup across different operating systems.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[hsl(var(--color-card))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-fit">
          <button
            onClick={() => setActiveTab("windows")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "windows"
                ? "bg-[hsl(var(--color-primary))] text-white shadow-md"
                : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
            }`}
          >
            <Monitor className="w-4 h-4" /> Windows
          </button>
          <button
            onClick={() => setActiveTab("mac")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "mac"
                ? "bg-[hsl(var(--color-primary))] text-white shadow-md"
                : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
            }`}
          >
            <Apple className="w-4 h-4" /> macOS
          </button>
          <button
            onClick={() => setActiveTab("linux")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "linux"
                ? "bg-[hsl(var(--color-primary))] text-white shadow-md"
                : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
            }`}
          >
            <Terminal className="w-4 h-4" /> Linux
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "windows" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">What is OneSetup for Windows?</h2>
                <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">
                  OneSetup on Windows leverages <strong>winget</strong> (Windows Package Manager) to help you install applications seamlessly. 
                  Select your apps from the catalog, generate a PowerShell command, and install everything with a single line.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">How It Works</h2>
                <ol className="mt-4 space-y-4 list-decimal list-inside text-[hsl(var(--color-muted-foreground))]">
                  <li>Select your applications from the catalog</li>
                  <li>Click "Generate Install Command"</li>
                  <li>Copy and run the PowerShell command on your Windows machine</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Example Command</h2>
                <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
                  <code className="text-sm text-[hsl(var(--color-primary))]">
                    powershell -ExecutionPolicy Bypass -c "irm https://winsetup.app/api/install.ps1?apps=Git.Git,Google.Chrome | iex"
                  </code>
                </pre>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">FAQ (Windows)</h2>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="font-semibold text-[hsl(var(--color-foreground))]">Is it safe?</dt>
                    <dd className="text-[hsl(var(--color-muted-foreground))]">Yes. OneSetup only generates PowerShell scripts that use winget, Microsoft's official package manager.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[hsl(var(--color-foreground))]">What's winget?</dt>
                    <dd className="text-[hsl(var(--color-muted-foreground))]">Windows Package Manager — Microsoft's official command-line package manager for Windows 10/11.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[hsl(var(--color-foreground))]">Does it require admin?</dt>
                    <dd className="text-[hsl(var(--color-muted-foreground))]">Some packages may require administrator privileges. Run PowerShell as Administrator for best results.</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}

          {activeTab === "mac" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">What is OneSetup for macOS?</h2>
                <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">
                  OneSetup on macOS uses <strong>Homebrew</strong>, the missing package manager for macOS, to install applications and developer tools. 
                  Generate a shell script to automate the installation of apps, casks, and fonts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Prerequisites</h2>
                <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">
                  Ensure you have Homebrew installed on your Mac. If not, open your terminal and run:
                </p>
                <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
                  <code className="text-sm text-[hsl(var(--color-primary))]">
                    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                  </code>
                </pre>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">How It Works</h2>
                <ol className="mt-4 space-y-4 list-decimal list-inside text-[hsl(var(--color-muted-foreground))]">
                  <li>Select the "macOS" toggle on the main page</li>
                  <li>Choose your applications from the catalog</li>
                  <li>Click "Generate Install Command"</li>
                  <li>Copy and run the bash script in your Terminal</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Example Command</h2>
                <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
                  <code className="text-sm text-[hsl(var(--color-primary))]">
                    curl -sSL "https://winsetup.app/api/mac/install.sh?apps=google-chrome,visual-studio-code" | bash
                  </code>
                </pre>
              </section>
            </div>
          )}

          {activeTab === "linux" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">What is OneSetup for Linux?</h2>
                <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">
                  OneSetup on Linux supports multiple package managers (APT, Flatpak, Snap) to install applications across different distributions like Ubuntu, Debian, Fedora, and Arch.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Supported Package Managers</h2>
                <ul className="mt-4 space-y-2 list-disc list-inside text-[hsl(var(--color-muted-foreground))]">
                  <li><strong>APT:</strong> Default for Debian/Ubuntu based distributions.</li>
                  <li><strong>Flatpak:</strong> A universal package management utility for Linux.</li>
                  <li><strong>Snap:</strong> Canonical's universal package manager.</li>
                  <li><strong>Pacman:</strong> For Arch-based distributions (Coming soon).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">How It Works</h2>
                <ol className="mt-4 space-y-4 list-decimal list-inside text-[hsl(var(--color-muted-foreground))]">
                  <li>Select the "Linux" toggle on the main page</li>
                  <li>Select your applications</li>
                  <li>Click "Generate Install Command"</li>
                  <li>Copy and run the shell command in your terminal (sudo may be required)</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Example Command</h2>
                <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
                  <code className="text-sm text-[hsl(var(--color-primary))]">
                    curl -sSL "https://winsetup.app/api/linux/install.sh?apps=git,curl,vlc" | bash
                  </code>
                </pre>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">FAQ (Linux)</h2>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="font-semibold text-[hsl(var(--color-foreground))]">Does it require sudo?</dt>
                    <dd className="text-[hsl(var(--color-muted-foreground))]">Yes, installing packages system-wide via apt, snap, or flatpak typically requires root permissions. The generated script will prompt for your password if needed.</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
