"use client"
import { useState, useEffect } from "react"
import { Check, Clock, ChevronRight } from "lucide-react"

export function DemoTerminal() {
  const [step, setStep] = useState(0)
  
  useEffect(() => {
    let isMounted = true
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000))
      if (!isMounted) return; setStep(1) // type command
      await new Promise(r => setTimeout(r, 1500))
      if (!isMounted) return; setStep(2) // enter
      await new Promise(r => setTimeout(r, 500))
      if (!isMounted) return; setStep(3) // git
      await new Promise(r => setTimeout(r, 1800))
      if (!isMounted) return; setStep(4) // vscode
      await new Promise(r => setTimeout(r, 2200))
      if (!isMounted) return; setStep(5) // chrome
      await new Promise(r => setTimeout(r, 2000))
      if (!isMounted) return; setStep(6) // node
      await new Promise(r => setTimeout(r, 2000))
      if (!isMounted) return; setStep(7) // done
    }
    
    sequence()
    return () => { isMounted = false }
  }, [])

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes fill-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: fill-progress var(--duration, 2s) ease-out forwards;
        }
        @keyframes type-text {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-typewriter {
          animation: type-text 1s steps(40, end) forwards;
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>
      <div className="relative rounded-3xl overflow-hidden border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-elevated))] shadow-[var(--shadow-glow-primary)]">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-[hsl(var(--color-muted-foreground))] ml-4 font-mono flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> PowerShell
          </span>
        </div>
        
        {/* Terminal content */}
        <div className="p-6 font-mono text-sm h-[380px] overflow-hidden flex flex-col justify-start">
          <div className="text-[hsl(var(--color-foreground))] mb-4 flex items-center">
            <span className="text-[hsl(var(--color-success))] mr-2 shrink-0">PS C:\Users\Developer{">"}</span>
            {step >= 1 && (
              <span className="inline-block border-r-2 border-transparent animate-typewriter">
                irm https://appnest-beta.vercel.app/install.ps1 | iex
              </span>
            )}
            {step === 0 && (
              <span className="inline-block w-2 h-4 bg-[hsl(var(--color-muted-foreground))] animate-pulse ml-1" />
            )}
          </div>
          
          <div className="space-y-4">
            {step >= 3 && (
              <div className="animate-fade-in-up text-left">
                <div className="flex items-center gap-2">
                  {step > 3 ? (
                    <Check className="h-4 w-4 text-[hsl(var(--color-success))] shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-[hsl(var(--color-primary))] animate-spin shrink-0" />
                  )}
                  <span className={step > 3 ? "text-[hsl(var(--color-muted-foreground))]" : "text-[hsl(var(--color-primary))]"}>
                    {step > 3 ? "Successfully installed Git" : "Installing Git [Git.Git]..."}
                  </span>
                </div>
                {step === 3 && (
                  <div className="mt-2 w-full h-1 bg-[hsl(var(--color-muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--color-primary))] animate-progress rounded-full" style={{ "--duration": "1.8s" } as React.CSSProperties} />
                  </div>
                )}
              </div>
            )}

            {step >= 4 && (
              <div className="animate-fade-in-up text-left">
                <div className="flex items-center gap-2">
                  {step > 4 ? (
                    <Check className="h-4 w-4 text-[hsl(var(--color-success))] shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-[hsl(var(--color-primary))] animate-spin shrink-0" />
                  )}
                  <span className={step > 4 ? "text-[hsl(var(--color-muted-foreground))]" : "text-[hsl(var(--color-primary))]"}>
                    {step > 4 ? "Successfully installed Visual Studio Code" : "Installing Visual Studio Code [Microsoft.VisualStudioCode]..."}
                  </span>
                </div>
                {step === 4 && (
                  <div className="mt-2 w-full h-1 bg-[hsl(var(--color-muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--color-primary))] animate-progress rounded-full" style={{ "--duration": "2.2s" } as React.CSSProperties} />
                  </div>
                )}
              </div>
            )}

            {step >= 5 && (
              <div className="animate-fade-in-up text-left">
                <div className="flex items-center gap-2">
                  {step > 5 ? (
                    <Check className="h-4 w-4 text-[hsl(var(--color-success))] shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-[hsl(var(--color-primary))] animate-spin shrink-0" />
                  )}
                  <span className={step > 5 ? "text-[hsl(var(--color-muted-foreground))]" : "text-[hsl(var(--color-primary))]"}>
                    {step > 5 ? "Successfully installed Google Chrome" : "Installing Google Chrome [Google.Chrome]..."}
                  </span>
                </div>
                {step === 5 && (
                  <div className="mt-2 w-full h-1 bg-[hsl(var(--color-muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--color-primary))] animate-progress rounded-full" style={{ "--duration": "2.0s" } as React.CSSProperties} />
                  </div>
                )}
              </div>
            )}

            {step >= 6 && (
              <div className="animate-fade-in-up text-left">
                <div className="flex items-center gap-2">
                  {step > 6 ? (
                    <Check className="h-4 w-4 text-[hsl(var(--color-success))] shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-[hsl(var(--color-primary))] animate-spin shrink-0" />
                  )}
                  <span className={step > 6 ? "text-[hsl(var(--color-muted-foreground))]" : "text-[hsl(var(--color-primary))]"}>
                    {step > 6 ? "Successfully installed Node.js" : "Installing Node.js [OpenJS.NodeJS]..."}
                  </span>
                </div>
                {step === 6 && (
                  <div className="mt-2 w-full h-1 bg-[hsl(var(--color-muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--color-primary))] animate-progress rounded-full" style={{ "--duration": "2.0s" } as React.CSSProperties} />
                  </div>
                )}
              </div>
            )}
            
            {step >= 7 && (
              <div className="mt-6 text-[hsl(var(--color-success))] font-medium animate-fade-in-up text-left flex items-center gap-2">
                <Check className="h-5 w-5" /> Setup completed successfully in 4m 12s.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
