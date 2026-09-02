import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import { Providers } from "@/components/layout/providers"
import { THEME_BOOT_SCRIPT } from "@/lib/workspace-storage"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
})

export const metadata: Metadata = {
  title: {
    default: "TITAN Journal",
    template: "%s · TITAN Journal",
  },
  description: "A simple trading journal. Fast to log, easy to customize.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="slate"
      data-density="comfortable"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Script
          id="titan-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
