"use client"

import { useState, useRef } from "react"
import { Check, Copy, Download, Link2, Terminal, ChevronDown, ChevronUp, Info, Cpu } from "lucide-react"
import { toast } from "sonner"
import {
  buildPowerShellCommand,
  buildCmdCommand,
  buildBrewCommand,
  buildLinuxCommand,
  buildShareUrl,
  copyToClipboard,
  downloadJson,
} from "@/lib/utils"
import { useOsStore } from "@/store/os"
import type { InstallConfig } from "@/types/package"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { cn } from "@/lib/utils"

interface CommandModalProps {
  open: boolean
  onClose: () => void
  selectedIds: string[]
}

type TerminalType = "powershell" | "cmd" | "zsh" | "bash"

export function CommandModal({ open, onClose, selectedIds }: CommandModalProps) {
  const { os } = useOsStore()
  const [copied, setCopied] = useState(false)
  const [terminalType, setTerminalType] = useState<TerminalType>(os === "mac" ? "zsh" : os === "linux" ? "bash" : "powershell")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Ensure terminal type matches current OS
  if (os === "mac" && (terminalType === "powershell" || terminalType === "cmd")) {
    setTerminalType("zsh")
  } else if (os === "linux" && (terminalType === "powershell" || terminalType === "cmd")) {
    setTerminalType("bash")
  } else if (os === "windows" && (terminalType === "zsh" || terminalType === "bash")) {
    setTerminalType("powershell")
  }

  const powerShellCommand = buildPowerShellCommand(selectedIds)
  const cmdCommand = buildCmdCommand(selectedIds)
  const brewCommand = buildBrewCommand(selectedIds)
  const linuxCommand = buildLinuxCommand(selectedIds)
  const shareUrl = buildShareUrl(selectedIds)

  const currentCommand = os === "mac" 
    ? brewCommand 
    : os === "linux"
    ? linuxCommand
    : terminalType === "powershell" ? powerShellCommand : cmdCommand

  const handleCopyCommand = async () => {
    await copyToClipboard(currentCommand)
    setCopied(true)
    toast.success("Command copied to clipboard!", {
      description: "Paste it in your terminal to start installing",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  const handleCopyUrl = async () => {
    await copyToClipboard(shareUrl)
    toast.success("Share link copied!")
  }

  const handleExportJson = () => {
    const config: InstallConfig = {
      version: "1.0",
      created: new Date().toISOString(),
      packages: selectedIds,
    }
    downloadJson(config, "ocs-install-config.json")
    toast.success("Configuration exported!")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col sm:max-w-2xl bg-[hsl(var(--color-card))] border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] p-0 overflow-hidden rounded-2xl max-h-[90vh]"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-[hsl(var(--color-primary)/0.05)]" />
          <DialogHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))] shadow-[var(--shadow-glow-primary)]">
                  <Terminal className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Ready to Install
                  </DialogTitle>
                  <DialogDescription className="text-[hsl(var(--color-muted-foreground))] mt-1">
                    {selectedIds.length} {selectedIds.length === 1 ? 'app' : 'apps'} selected for installation
                  </DialogDescription>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))] transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </DialogHeader>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth relative">
          {/* Terminal Type Toggle */}
          <div className="sticky top-0 z-10 bg-[hsl(var(--color-card))] px-6 pt-1 pb-4">
            <div className="flex items-center gap-2 p-1 bg-[hsl(var(--color-muted))] rounded-xl shadow-sm border border-[hsl(var(--color-border))]">
            {os === "windows" ? (
              <>
                <button
                  onClick={() => setTerminalType("powershell")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    terminalType === "powershell"
                      ? "bg-[hsl(var(--color-primary))] text-white shadow-lg"
                      : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                  )}
                >
                  <Cpu className="h-4 w-4" />
                  PowerShell
                </button>
                <button
                  onClick={() => setTerminalType("cmd")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    terminalType === "cmd"
                      ? "bg-[hsl(var(--color-primary))] text-white shadow-lg"
                      : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                  )}
                >
                  <Terminal className="h-4 w-4" />
                  CMD
                </button>
              </>
            ) : os === "mac" ? (
              <>
                <button
                  onClick={() => setTerminalType("zsh")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    terminalType === "zsh"
                      ? "bg-[hsl(var(--color-primary))] text-white shadow-lg"
                      : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                  )}
                >
                  <Terminal className="h-4 w-4" />
                  ZSH
                </button>
                <button
                  onClick={() => setTerminalType("bash")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    terminalType === "bash"
                      ? "bg-[hsl(var(--color-primary))] text-white shadow-lg"
                      : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                  )}
                >
                  <Cpu className="h-4 w-4" />
                  Bash
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTerminalType("bash")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    terminalType === "bash"
                      ? "bg-[hsl(var(--color-primary))] text-white shadow-lg"
                      : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                  )}
                >
                  <Terminal className="h-4 w-4" />
                  Bash
                </button>
              </>
            )}
            </div>
          </div>

          <div className="px-6 pb-6 space-y-5">
          {/* Command Display */}
          <div className="relative">
            <div className="absolute -inset-1 bg-[hsl(var(--color-primary)/0.2)] rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-[hsl(var(--color-background))] rounded-xl border border-[hsl(var(--color-border))] overflow-hidden">
              {/* Code header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--color-muted))] border-b border-[hsl(var(--color-border))]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-medium text-[hsl(var(--color-muted-foreground))] ml-2">
                    {os === "mac" ? (terminalType === "zsh" ? "ZSH" : "Bash") : os === "linux" ? "Bash" : (terminalType === "powershell" ? "PowerShell" : "Command Prompt")}
                  </span>
                </div>
                <span className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  {selectedIds.length} packages
                </span>
              </div>
              
              {/* Command code */}
              <div className="p-4 max-h-48 overflow-auto">
                <pre className="text-sm font-mono text-[hsl(var(--color-primary))] whitespace-pre-wrap break-all leading-relaxed">
                  {currentCommand}
                </pre>
              </div>
            </div>
          </div>

          {/* Primary Copy Button */}
          <button
            onClick={handleCopyCommand}
            className={cn(
              "w-full h-14 rounded-xl font-semibold text-base transition-all duration-300",
              "flex items-center justify-center gap-3",
              "relative overflow-hidden group",
              copied
                ? "bg-emerald-500 text-white"
                : "bg-[hsl(var(--color-primary))] text-white shadow-[var(--shadow-glow-primary)] hover:scale-[1.02]"
            )}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 transition-transform group-hover:scale-110" />
                Copy Command
                <span className="text-white/60 text-sm">then paste in terminal</span>
              </>
            )}
          </button>

          {/* Quick Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-border))]">
            <Info className="h-5 w-5 text-[hsl(var(--color-primary))] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[hsl(var(--color-muted-foreground))] leading-relaxed">
              <strong className="text-[hsl(var(--color-foreground))]">How to use:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Copy the command above</li>
                <li>Open {os === "mac" || os === "linux" ? "Terminal" : (terminalType === "powershell" ? "PowerShell" : "Command Prompt")} {os === "windows" && "as Administrator"}</li>
                <li>Paste and press Enter</li>
              </ol>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => {
              setShowAdvanced(!showAdvanced)
              if (!showAdvanced) {
                setTimeout(() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
                  }
                }, 50)
              }
            }}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-background))] transition-colors"
          >
            <span className="text-sm font-medium">More Options</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
            )}
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 animate-fade-in-up">
              <Separator className="bg-[hsl(var(--color-border))]" />
              
              {/* Share URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-[hsl(var(--color-primary))]" />
                  Share Configuration
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 h-10 px-3 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-sm font-mono text-[hsl(var(--color-muted-foreground))] truncate"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="h-10 px-4 rounded-lg border-[hsl(var(--color-border))]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-sm font-medium hover:bg-[hsl(var(--color-muted))] transition-colors"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[hsl(var(--color-muted))] border-t border-[hsl(var(--color-border))] flex justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-10 px-6 rounded-lg"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
