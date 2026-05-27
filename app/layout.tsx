import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://installora-beta.vercel.app"),
  title: {
    default: "Installora - Set Up Windows, macOS & Linux in Minutes",
    template: "%s | Installora"
  },
  description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking and get your perfect development environment in just 5 minutes.",
  keywords: [
    "winget",
    "homebrew",
    "apt",
    "windows package manager",
    "mac package manager",
    "linux package manager",
    "Installora",
    "mac installer",
    "bulk install apps",
    "powershell installer",
    "brew installer",
    "developer tools",
    "setup automation"
  ],
  authors: [{ name: "Installora" }],
  creator: "Installora",
  publisher: "Installora",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://installora-beta.vercel.app",
    title: "Installora - Set Up Windows, macOS & Linux in Minutes",
    description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking.",
    siteName: "Installora",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Installora - Set Up Windows, macOS & Linux in Minutes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Installora - Set Up Windows, macOS & Linux in Minutes",
    description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/"
  }
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          theme="system"
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'hsl(var(--color-card))',
              color: 'hsl(var(--color-foreground))',
              border: '1px solid hsl(var(--color-border))',
              borderRadius: 'var(--radius-md)',
            },
          }}
        />
      </body>
    </html>
  )
}
