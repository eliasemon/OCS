"use client"
import { Terminal, Box, Cpu, Code2, Layers, Monitor, HardDrive, Server } from "lucide-react"

export function WindowsLogo() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center perspective-[1000px]">
      <div className="relative w-full h-full transform-gpu rotate-y-[-20deg] rotate-x-[15deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[hsl(var(--color-primary))] opacity-20 blur-3xl rounded-full" />
        
        {/* Windows logo structure */}
        <div className="grid grid-cols-2 gap-2 w-48 h-48 sm:w-56 sm:h-56 z-10">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-tl-xl rounded-br-sm rounded-tr-sm rounded-bl-sm opacity-90 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-tr-xl rounded-bl-sm rounded-tl-sm rounded-br-sm opacity-90 shadow-[0_0_20px_rgba(96,165,250,0.5)] animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-bl-xl rounded-tr-sm rounded-tl-sm rounded-br-sm opacity-90 shadow-[0_0_20px_rgba(52,211,153,0.5)] animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="bg-gradient-to-br from-indigo-400 to-violet-500 rounded-br-xl rounded-tl-sm rounded-tr-sm rounded-bl-sm opacity-90 shadow-[0_0_20px_rgba(167,139,250,0.5)] animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  )
}

export function AppIcons() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[hsl(var(--color-accent))] opacity-15 blur-3xl rounded-full" />
      
      {/* Floating Icons */}
      <div className="relative w-full h-full z-10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '0s' }}>
          <Terminal className="w-10 h-10 text-cyan-500" />
        </div>
        
        <div className="absolute top-1/4 right-4 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '0.4s' }}>
          <Code2 className="w-8 h-8 text-blue-500" />
        </div>
        
        <div className="absolute top-1/4 left-4 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '0.8s' }}>
          <Box className="w-8 h-8 text-emerald-500" />
        </div>
        
        <div className="absolute bottom-1/4 right-8 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '1.2s' }}>
          <Cpu className="w-10 h-10 text-violet-500" />
        </div>
        
        <div className="absolute bottom-1/4 left-8 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '1.6s' }}>
          <Layers className="w-10 h-10 text-indigo-500" />
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass p-4 rounded-2xl animate-float shadow-xl border border-white/10 dark:border-white/5" style={{ animationDelay: '2.0s' }}>
          <Server className="w-8 h-8 text-fuchsia-500" />
        </div>
      </div>
    </div>
  )
}
