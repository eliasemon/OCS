import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "oneCommandSetup (OCS) - Set Up Windows in Minutes",
    template: "%s | oneCommandSetup"
  },
  description: "Set Up Windows in Minutes. One command installs everything. Skip the installer clicking and get your perfect development environment in just 5 minutes.",
  keywords: [
    "oneCommandSetup",
    "OCS",
    "winget",
    "windows package manager",
    "windows installer",
    "bulk install windows apps",
    "powershell installer",
    "developer tools",
    "windows setup automation"
  ],
  authors: [{ name: "oneCommandSetup" }],
  creator: "oneCommandSetup",
  publisher: "oneCommandSetup",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onecommandsetup.app",
    title: "oneCommandSetup - Set Up Windows in Minutes",
    description: "Set Up Windows in Minutes. One command installs everything.",
    siteName: "oneCommandSetup",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "oneCommandSetup - Set Up Windows in Minutes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "oneCommandSetup - Set Up Windows in Minutes",
    description: "Set Up Windows in Minutes. One command installs everything.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://onecommandsetup.app"
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
