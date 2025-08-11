import type React from "react"
import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "GlobeTrotter",
  description: "Personalized, intelligent trip planning.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, lora.variable)}>
        {children}
      </body>
    </html>
  )
}
