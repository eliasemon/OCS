"use client"

import { useState } from "react"
import { Check, Copy, Download, Link2 } from "lucide-react"
import { toast } from "sonner"
import {
  buildPowerShellCommand,
  buildCmdCommand,
  buildShareUrl,
  copyToClipboard,
  downloadJson,
} from "@/lib/utils"
import type { InstallConfig } from "@/types/package"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

interface CommandModalProps {
  open: boolean
  onClose: () => void
  selectedIds: string[]
}

export function CommandModal({ open, onClose, selectedIds }: CommandModalProps) {
  const [copied, setCopied] = useState<"ps" | "cmd" | "url" | null>(null)

  const powerShellCommand = buildPowerShellCommand(selectedIds)
  const cmdCommand = buildCmdCommand(selectedIds)
  const shareUrl = buildShareUrl(selectedIds)

  const handleCopy = async (text: string, type: "ps" | "cmd" | "url") => {
    await copyToClipboard(text)
    setCopied(type)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyUrl = () => {
    handleCopy(shareUrl, "url")
  }

  const handleExportJson = () => {
    const config: InstallConfig = {
      version: "1.0",
      created: new Date().toISOString(),
      packages: selectedIds,
    }
    downloadJson(config, "winsetup-install.json")
    toast.success("Exported install configuration")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-gray-800 bg-gray-950 text-gray-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">⚡ Your Install Command</DialogTitle>
          <DialogDescription className="text-gray-400">
            Run this command in PowerShell or CMD to install your selected apps
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="powershell" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="powershell" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-gray-950">
              PowerShell
            </TabsTrigger>
            <TabsTrigger value="cmd" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-gray-950">
              CMD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="powershell" className="space-y-4">
            <div className="relative group">
              <pre className="overflow-x-auto rounded-lg bg-gray-950 border border-gray-800 p-4 text-sm font-mono text-cyan-400 whitespace-pre-wrap break-all">
                {powerShellCommand}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(powerShellCommand, "ps")}
                className="absolute right-2 top-2 h-8 px-2 text-gray-400 hover:text-gray-100"
              >
                {copied === "ps" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cmd" className="space-y-4">
            <div className="relative group">
              <pre className="overflow-x-auto rounded-lg bg-gray-950 border border-gray-800 p-4 text-sm font-mono text-cyan-400 whitespace-pre-wrap break-all">
                {cmdCommand}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(cmdCommand, "cmd")}
                className="absolute right-2 top-2 h-8 px-2 text-gray-400 hover:text-gray-100"
              >
                {copied === "cmd" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="bg-gray-800" />

        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-300">Share Configuration</h4>
            <div className="flex gap-2">
              <div className="flex-1 rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-400 font-mono truncate">
                {shareUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {copied === "url" ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleExportJson}
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
        </div>

        <Separator className="bg-gray-800" />

        <div className="rounded-md bg-gray-900 border border-gray-800 p-3">
          <p className="text-xs text-gray-400">
            💡 Run PowerShell as Administrator for best results
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
