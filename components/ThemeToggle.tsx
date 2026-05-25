"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = stored || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    // Set class immediately on mount
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    // Add theme-changing class to prevent transition flash
    document.documentElement.classList.add("theme-changing")

    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    document.documentElement.classList.toggle("dark", newTheme === "dark")

    // Remove transition blocking after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-changing")
    }, 300)
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl",
        "glass border border-[hsl(var(--color-border))]",
        "text-[hsl(var(--color-muted-foreground))]",
        "hover:text-[hsl(var(--color-foreground))] hover:border-[hsl(var(--color-primary)/0.3)]",
        "transition-all duration-300",
        "overflow-hidden group"
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Sun Icon */}
      <Sun className={cn(
        "absolute h-5 w-5 transition-all duration-300",
        theme === "dark" 
          ? "opacity-100 rotate-0 scale-100" 
          : "opacity-0 -rotate-90 scale-0"
      )} />
      
      {/* Moon Icon */}
      <Moon className={cn(
        "absolute h-5 w-5 transition-all duration-300",
        theme === "light" 
          ? "opacity-100 rotate-0 scale-100" 
          : "opacity-0 rotate-90 scale-0"
      )} />

      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        theme === "dark" 
          ? "bg-[hsl(var(--color-warning)/0.1)]" 
          : "bg-[hsl(var(--color-primary)/0.1)]"
      )} />
    </button>
  )
}
