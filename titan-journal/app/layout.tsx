import type { Metadata } from "next"
import { Cinzel, JetBrains_Mono, Outfit } from "next/font/google"

import { Providers } from "@/components/layout/providers"
import "./globals.css"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
})

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "TITAN Journal",
    template: "%s · TITAN Journal",
  },
  description:
    "Obchodní deník TITAN Swing — zapisuje, proč byl obchod vzat.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`dark ${outfit.variable} ${cinzel.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
